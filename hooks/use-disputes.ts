import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delay } from "@/lib/consumer-mock-data";

export function useMyDisputes() {
  return useQuery({
    queryKey: ["disputes", "me"],
    queryFn: () => delay([]),
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      orderId: string;
      reason: string;
      details?: string;
    }) => delay({ success: true, data: { _id: `disp_${Date.now()}`, ...body } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}
