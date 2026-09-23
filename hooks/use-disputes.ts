import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openDispute } from "@/lib/api";

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { orderId: string; reason: string }) =>
      openDispute(body.orderId, body.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useDisputes() {
  // No list endpoint in Swagger for consumer disputes — use order status DISPUTED
  return { data: [], isLoading: false };
}
