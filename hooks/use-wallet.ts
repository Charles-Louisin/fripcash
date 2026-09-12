import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delay, mockMe, mockWalletTransactions } from "@/lib/consumer-mock-data";

let balance = mockMe.walletBalance ?? 250000;
let txs = [...mockWalletTransactions];

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: () =>
      delay({
        balance,
        availableBalance: balance,
        reservedBalance: 75000,
        currency: "GNF",
      }),
  });
}

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: ["wallet", "transactions", type],
    queryFn: async () => {
      let list = [...txs];
      if (type) list = list.filter((t) => t.type === type);
      return delay(list);
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { amount: number; phone?: string }) => {
      if (body.amount > balance) throw new Error("Solde insuffisant");
      balance -= body.amount;
      txs = [
        {
          _id: `tx_${Date.now()}`,
          type: "withdrawal",
          amount: body.amount,
          label: `Retrait Orange Money${body.phone ? ` (${body.phone})` : ""}`,
          isCredit: false,
          createdAt: new Date().toISOString(),
        },
        ...txs,
      ];
      return delay({ success: true, balance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
