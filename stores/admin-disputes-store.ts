import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AdminDispute,
  type AdminDisputeOutcome,
  type AdminDisputePayment,
  INITIAL_ADMIN_DISPUTES,
  INITIAL_DISPUTE_PAYMENTS,
  outcomeOrderStatus,
} from "@/lib/admin-disputes";

type ResolveResult = { ok: boolean; message: string };

type AdminDisputesState = {
  disputes: AdminDispute[];
  payments: AdminDisputePayment[];
  /** Linked order statuses updated by resolve (mock). */
  orderStatuses: Record<string, "disputed" | "completed" | "refunded">;
  markUnderReview: (id: string) => ResolveResult;
  resolveDispute: (
    id: string,
    outcome: AdminDisputeOutcome,
    notes?: string,
  ) => ResolveResult;
  getDispute: (id: string) => AdminDispute | undefined;
  paymentsForOrder: (orderId: string) => AdminDisputePayment[];
};

export const useAdminDisputesStore = create<AdminDisputesState>()(
  persist(
    (set, get) => ({
      disputes: INITIAL_ADMIN_DISPUTES,
      payments: INITIAL_DISPUTE_PAYMENTS,
      orderStatuses: {
        ord_mock_1004: "disputed",
        ord_mock_1007: "disputed",
        ord_mock_1008: "refunded",
      },

      getDispute: (id) => get().disputes.find((d) => d.id === id),

      paymentsForOrder: (orderId) =>
        get().payments.filter((p) => p.orderId === orderId),

      markUnderReview: (id) => {
        const dispute = get().disputes.find((d) => d.id === id);
        if (!dispute) return { ok: false, message: "Litige introuvable." };
        if (dispute.status !== "open") {
          return {
            ok: false,
            message: "Seuls les litiges ouverts peuvent passer en revue.",
          };
        }
        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === id ? { ...d, status: "under_review" } : d,
          ),
        }));
        return { ok: true, message: "Litige marqué en cours d’examen." };
      },

      resolveDispute: (id, outcome, notes) => {
        const dispute = get().disputes.find((d) => d.id === id);
        if (!dispute) return { ok: false, message: "Litige introuvable." };
        if (dispute.status === "resolved") {
          return { ok: false, message: "Ce litige est déjà résolu." };
        }

        const orderStatus = outcomeOrderStatus(outcome);
        const kind =
          outcome === "release_seller"
            ? ("escrow_release" as const)
            : outcome === "partial_refund"
              ? ("partial_refund" as const)
              : ("refund" as const);

        const paymentAmount =
          outcome === "partial_refund"
            ? Math.round(dispute.amount / 2)
            : dispute.amount;

        const label =
          outcome === "release_seller"
            ? `Libéré au vendeur · ${dispute.orderId}`
            : outcome === "partial_refund"
              ? `Remboursement partiel · ${dispute.orderId}`
              : `Remboursement acheteur · ${dispute.orderId}`;

        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "resolved",
                  outcome,
                  notes: notes?.trim() || d.notes,
                  resolvedAt: new Date().toISOString(),
                }
              : d,
          ),
          payments: [
            {
              id: `PAY-${Date.now()}`,
              kind,
              label,
              amount: paymentAmount,
              orderId: dispute.orderId,
              createdAt: new Date().toISOString(),
            },
            ...state.payments,
          ],
          orderStatuses: {
            ...state.orderStatuses,
            [dispute.orderId]: orderStatus,
          },
        }));

        return {
          ok: true,
          message: "Litige résolu. Paiement mis à jour (mock).",
        };
      },
    }),
    { name: "fripcash-admin-disputes" },
  ),
);
