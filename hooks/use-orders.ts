import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";

export function useMyOrders(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const res = await ordersApi.getMy(params);
      return res.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const res = await ordersApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => ordersApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      ordersApi.confirmDelivery(id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useShipOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      trackingNumber,
    }: {
      id: string;
      trackingNumber?: string;
    }) => ordersApi.ship(id, trackingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
