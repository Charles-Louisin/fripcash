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

function normalizeOrder(raw: any, role: "buyer" | "seller" = "buyer") {
  const status =
    ORDER_STATUS_TO_UI[raw.status] ||
    (typeof raw.status === "string" ? raw.status : "ordered");
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
    fulfillmentMode: raw.fulfillmentMode || "courier",
    createdAt: raw.createdAt,
    role,
    pickupCode: raw.pickupCode,
    raw,
  };
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

export function useMyOrders(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["orders", params],
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
    queryKey: ["orders", id],
    queryFn: async () => normalizeOrder(await fetchOrder(id)),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_body?: Record<string, unknown>) => {
      // Checkout creates PaymentIntent + orders from the server cart
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
      await transitionOrderStatus(id, { status: "IN_TRANSIT" });
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
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      openDispute(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useInvoiceReceipt(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoiceReceipt(id),
    enabled: !!id,
  });
}
