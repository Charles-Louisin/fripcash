import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchases,
  fetchSales,
  fetchOrder,
  transitionOrderStatus,
  openDispute,
  fetchInvoiceReceipt,
  checkout,
  type OrderStatus,
} from "@/lib/api";
import { ORDER_STATUS_TO_UI, ORDER_STATUS_TO_API } from "@/lib/api/mappers";
import {
  listMockOrders,
  mockAssignCourier,
  mockConfirmReception,
  mockMarkShipped,
  mockOpenDispute,
  mockPrepareOrder,
  mockSellerRefund,
  type MockOrder,
} from "@/lib/mock-orders-store";

/** Web dashboard uses local mock order lifecycle until BE tracking is complete. */
const USE_MOCK_ORDERS = true;

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
    pickupCode: raw.pickupCode,
    disputeReason: raw.disputeReason,
    timeline: raw.timeline || [],
    createdAt: raw.createdAt,
    role,
    raw,
  };
}

function fromMock(o: MockOrder) {
  return normalizeOrder(o, o.role);
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
  /** When false, hide seller-side demo orders (buyer-only account). */
  isSeller?: boolean;
}) {
  return useQuery({
    queryKey: [
      "orders",
      params,
      USE_MOCK_ORDERS ? "mock" : "live",
      params?.isSeller ? "seller" : "buyer-only",
    ],
    queryFn: async () => {
      if (USE_MOCK_ORDERS) {
        let list = listMockOrders(params).map(fromMock);
        // Buyer-only accounts never see "Mes ventes" demo rows.
        if (params?.isSeller === false) {
          list = list.filter((o) => o.role === "buyer");
        }
        return list;
      }
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
          fetchSales(),
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
    queryKey: ["orders", id, USE_MOCK_ORDERS ? "mock" : "live"],
    queryFn: async () => {
      if (USE_MOCK_ORDERS) {
        const hit = listMockOrders().find((o) => o._id === id);
        if (!hit) throw new Error("Commande introuvable");
        return fromMock(hit);
      }
      return normalizeOrder(await fetchOrder(id));
    },
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
      if (USE_MOCK_ORDERS) {
        mockConfirmReception(id);
        return { success: true };
      }
      await transitionOrderStatus(id, { status: "DELIVERED" });
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
    mutationFn: async ({ id }: { id: string; trackingNumber?: string }) => {
      if (USE_MOCK_ORDERS) {
        mockMarkShipped(id);
        return { success: true };
      }
      await transitionOrderStatus(id, { status: "IN_TRANSIT" });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePrepareOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (USE_MOCK_ORDERS) {
        mockPrepareOrder(id);
        return { success: true };
      }
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
      courierName,
    }: {
      id: string;
      courierName?: string;
    }) => {
      if (USE_MOCK_ORDERS) {
        mockAssignCourier(id, courierName);
        return { success: true };
      }
      await transitionOrderStatus(id, { status: "COURIER_ASSIGNED" });
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
      if (USE_MOCK_ORDERS) {
        if (status === "preparing") mockPrepareOrder(id);
        else if (status === "courierAssigned") mockAssignCourier(id);
        else if (status === "inTransit") mockMarkShipped(id);
        else if (status === "fundsReleased" || status === "delivered")
          mockConfirmReception(id);
        else if (status === "disputed")
          mockOpenDispute(id, note || "Litige");
        else if (status === "refunded") mockSellerRefund(id);
        return { success: true };
      }
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
    }) => {
      if (USE_MOCK_ORDERS) {
        mockOpenDispute(orderId, reason);
        return { success: true };
      }
      return openDispute(orderId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSellerRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (USE_MOCK_ORDERS) {
        mockSellerRefund(id);
        return { success: true };
      }
      throw new Error("Remboursement vendeur non branché sur l’API.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useInvoiceReceipt(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoiceReceipt(id),
    enabled: !!id && !USE_MOCK_ORDERS,
  });
}
