import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWalletBalance,
  fetchWalletLedger,
  requestWithdraw,
  readToken,
} from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  if (data && typeof data === "object" && Array.isArray((data as any).entries)) {
    return (data as any).entries;
  }
  return [];
}

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const raw: any = await fetchWalletBalance();
      return {
        balance: raw.balanceGnf ?? raw.balance ?? 0,
        availableBalance:
          raw.availableBalanceGnf ?? raw.availableBalance ?? raw.balance ?? 0,
        reservedBalance: raw.reservedBalanceGnf ?? raw.reservedBalance ?? 0,
        currency: "GNF",
        ...raw,
      };
    },
    enabled: hasToken(),
  });
}

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: ["wallet", "transactions", type],
    queryFn: async () => {
      const raw = await fetchWalletLedger();
      let list = asArray(raw).map((t: any) => ({
        _id: t.id || t._id,
        type:
          t.type === "escrowRelease"
            ? "sale"
            : t.type === "escrowHold"
              ? "escrow_block"
              : t.type === "withdraw" || t.type === "withdrawal"
                ? "withdrawal"
                : t.type || t.kind || "ledger",
        amount: t.amountGnf ?? t.amount ?? 0,
        label: t.label || t.description || t.type || "Mouvement",
        isCredit: t.isCredit ?? (t.direction === "credit" || (t.amountGnf ?? 0) > 0),
        status: "completed",
        createdAt: t.createdAt,
      }));
      if (type) list = list.filter((t) => t.type === type);
      return list;
    },
    enabled: hasToken(),
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { amount: number; phone?: string }) => {
      return requestWithdraw(Math.round(body.amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
