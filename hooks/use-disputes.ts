import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputesApi } from "@/lib/api";

export function useMyDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: async () => {
      const res = await disputesApi.getMy();
      return res.data;
    },
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      orderId: string;
      reason: string;
      description: string;
    }) => disputesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
