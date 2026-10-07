import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchases,
  fetchSales,
  fetchOrder,
  transitionOrderStatus,
  openDispute,
  fetchInvoiceReceipt,
  checkout,
  sellerRefund,
  confirmReception,
  requestCourier,
  acceptOrderOffer,
  refuseOrderOffer,
  payFullAfterOfferRefuse,
  cancelAfterOfferRefuse,
  type OrderStatus,
} from "@/lib/api";
import {
  ORDER_STATUS_TO_UI,
  ORDER_STATUS_TO_API,
  ORDER_STATUS_LABEL_FR,
} from "@/lib/api/mappers";

function normalizeOrder(raw: any, role: "buyer" | "seller" = "buyer") {
  const status =
    ORDER_STATUS_TO_UI[raw.status] ||
    (typeof raw.status === "string" ? raw.status : "ordered");
  const escrowStatus =
    raw.escrowStatus ||
    (status === "fundsReleased" || status === "delivered"
      ? "released"
      : status === "refunded"
        ? "refunded"
        : "blocked");
  return {
    _id: raw.id || raw._id,
    id: raw.id || raw._id,
    article: raw.listing || raw.article || { title: "Article" },
    buyer: raw.buyer || { pseudo: "acheteur" },
    seller: raw.seller || { pseudo: "vendeur" },
    amount: raw.amountGnf ?? raw.amount ?? raw.totalGnf ?? 0,
    shippingCost: raw.shippingCostGnf ?? raw.shippingCost ?? 0,
    commission: raw.commissionGnf ?? raw.commission ?? 0,
    status,
    escrowStatus,
    deliveryMode:
      raw.deliveryMode ||
      (raw.fulfillmentMode === "pickup"
        ? "main-propre"
        : raw.fulfillmentMode === "shopLocalDelivery"
          ? "seller-delivery"
          : "buyer-delivery"),
    fulfillmentMode: raw.fulfillmentMode || "courier",
    paymentMethod: raw.paymentMethod || "mobile-money",
    courierName: raw.courierName ?? null,
    courierId: raw.courierId ?? raw.courier?.id ?? null,
    courier: raw.courier || null,
    notifiedCourierNames: raw.notifiedCourierNames || [],
    buyerId: raw.buyerId || raw.buyer?.id,
    sellerId: raw.sellerId || raw.seller?.id,
    disputeReason: raw.disputeReason,
    timeline: (raw.timeline || []).map((step: any) => ({
      at: step.at,
      status: step.status,
      note: step.note,
      label:
        step.label ||
        ORDER_STATUS_LABEL_FR[step.status] ||
        step.status ||
        "Mise à jour",
    })),
    createdAt: raw.createdAt,
    offerAmountGnf: raw.offerAmountGnf ?? null,
    originalAmountGnf: raw.originalAmountGnf ?? raw.amountGnf ?? 0,
    offerStatus: raw.offerStatus || "none",
    role,
    raw,
  };
}

export function useNewOrdersBadgeCount(isSeller?: boolean) {
  const { data: orders = [] } = useMyOrders({ isSeller });
  return orders.filter((o) => {
    if (o.role === "seller") {
      return o.status === "sellerNotified" || o.status === "paid";
    }
    return o.status === "inTransit" || o.status === "delivered";
  }).length;
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

export function useMyOrders(params?: {
  type?: string;
  status?: string;
  isSeller?: boolean;
}) {
  return useQuery({
    queryKey: ["orders", params, params?.isSeller ? "seller" : "buyer-only"],
    queryFn: async () => {
      const type = params?.type;
      let list: ReturnType<typeof normalizeOrder>[] = [];
      if (type === "sell") {
        list = asArray(await fetchSales()).map((o) =>
          normalizeOrder(o, "seller")
        );
      } else if (type === "buy") {
        list = asArray(await fetchPurchases()).map((o) =>
          normalizeOrder(o, "buyer")
        );
      } else {
        const [purchases, sales] = await Promise.all([
          fetchPurchases(),
          params?.isSeller === false ? [] : fetchSales(),
        ]);
        list = [
          ...asArray(purchases).map((o) => normalizeOrder(o, "buyer")),
          ...asArray(sales).map((o) => normalizeOrder(o, "seller")),
        ];
      }
      if (params?.status) {
        list = list.filter((o) => o.status === params.status);
      }
      return list;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => normalizeOrder(await fetchOrder(id)),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_body?: Record<string, unknown>) => {
      const result = await checkout();
      const orders = Array.isArray((result as any)?.orders)
        ? (result as any).orders
        : [];
      const first = orders[0];
      return {
        success: true,
        data: {
          _id: first?.id || first?._id || `ord_${Date.now()}`,
          ...first,
        },
        paymentIntent: (result as any)?.paymentIntent,
        orders,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; code?: string }) => {
      await confirmReception(id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useShipOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      fulfillmentMode,
    }: {
      id: string;
      trackingNumber?: string;
      fulfillmentMode?: string;
    }) => {
      const status: OrderStatus =
        fulfillmentMode === "shopLocalDelivery" || fulfillmentMode === "pickup"
          ? fulfillmentMode === "pickup"
            ? "READY_FOR_PICKUP"
            : "IN_TRANSIT"
          : "IN_TRANSIT";
      await transitionOrderStatus(id, { status });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function usePrepareOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await transitionOrderStatus(id, { status: "PREPARING" });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAssignCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      fulfillmentMode,
    }: {
      id: string;
      courierName?: string;
      fulfillmentMode?: string;
    }) => {
      if (fulfillmentMode === "pickup") {
        await transitionOrderStatus(id, { status: "READY_FOR_PICKUP" });
      } else {
        await requestCourier(id);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useTransitionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => {
      const apiStatus = (ORDER_STATUS_TO_API[status] ||
        status.toUpperCase()) as OrderStatus;
      return transitionOrderStatus(id, { status: apiStatus, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOpenDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => openDispute(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSellerRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await sellerRefund(id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useAcceptOrderOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptOrderOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useRefuseOrderOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => refuseOrderOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function usePayFullAfterOfferRefuse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payFullAfterOfferRefuse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useCancelAfterOfferRefuse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelAfterOfferRefuse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useInvoiceReceipt(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoiceReceipt(id),
    enabled: !!id,
  });
}
