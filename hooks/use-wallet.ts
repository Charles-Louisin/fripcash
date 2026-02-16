import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const res = await walletApi.getBalance();
      return res.data;
    },
  });
}

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: ["wallet", "transactions", type],
    queryFn: async () => {
      const res = await walletApi.getTransactions(type);
      return res.data;
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { amount: number; phone?: string }) =>
      walletApi.withdraw(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
