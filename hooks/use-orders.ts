import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delay, mockOrders, type MockConsumerOrder } from "@/lib/consumer-mock-data";

let localOrders: MockConsumerOrder[] = [...mockOrders];

export function useMyOrders(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      let list = [...localOrders];
      if (params?.status) list = list.filter((o) => o.status === params.status);
      if (params?.type === "buy") list = list.filter((o) => o.role === "buyer");
      if (params?.type === "sell") list = list.filter((o) => o.role === "seller");
      return delay(list);
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const order = localOrders.find((o) => o._id === id);
      if (!order) throw new Error("Commande introuvable");
      return delay(order);
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: any) => {
      const created: MockConsumerOrder = {
        _id: `ord_${Date.now()}`,
        article: body.article || { title: "Article" },
        buyer: { pseudo: "aminata_v", _id: "u_demo" },
        seller: body.seller || { pseudo: "vendeur" },
        amount: body.amount || body.total || 0,
        shippingCost: body.shippingCost || 5000,
        commission: Math.round((body.amount || 0) * 0.08),
        status: "ordered",
        fulfillmentMode: body.fulfillmentMode || "courier",
        createdAt: new Date().toISOString(),
        role: "buyer",
      };
      localOrders = [created, ...localOrders];
      return delay({ success: true, data: created });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      const order = localOrders.find((o) => o._id === id);
      if (order?.pickupCode && order.pickupCode !== code) {
        throw new Error("Code incorrect.");
      }
      localOrders = localOrders.map((o) =>
        o._id === id ? { ...o, status: "fundsReleased" } : o
      );
      return delay({ success: true });
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
    }: {
      id: string;
      trackingNumber?: string;
    }) => {
      localOrders = localOrders.map((o) =>
        o._id === id ? { ...o, status: "inTransit" } : o
      );
      return delay({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
