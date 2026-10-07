/** Dispute / refund resolve types for admin dispute UI (no seed data). */

export type AdminDisputeStatus = "open" | "under_review" | "resolved" | "closed";

export type AdminDisputeOutcome =
  | "refund_buyer"
  | "release_seller"
  | "partial_refund";

export type AdminDisputePaymentKind =
  | "escrow_hold"
  | "escrow_release"
  | "refund"
  | "partial_refund";

export type AdminDispute = {
  id: string;
  orderId: string;
  productTitle: string;
  productImage: string;
  buyerId?: string | null;
  sellerId?: string | null;
  buyerName: string;
  sellerName: string;
  amount: number;
  reason: string;
  initiatedBy: "buyer" | "seller";
  initiatorName: string;
  openedVia: "order_page" | "dashboard" | "app";
  status: AdminDisputeStatus;
  outcome?: AdminDisputeOutcome;
  openedAt: string;
  resolvedAt?: string;
  notes?: string;
  evidence: string[];
  messages?: any[];
};

export type AdminDisputePayment = {
  id: string;
  kind: AdminDisputePaymentKind;
  label: string;
  amount: number;
  orderId: string;
  createdAt: string;
};

export const DISPUTE_STATUS_LABELS: Record<AdminDisputeStatus, string> = {
  open: "Ouvert",
  under_review: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

export const DISPUTE_OUTCOME_LABELS: Record<AdminDisputeOutcome, string> = {
  refund_buyer: "Acheteur remboursé",
  release_seller: "Libéré au vendeur",
  partial_refund: "Remboursement partiel",
};

export const DISPUTE_PAYMENT_KIND_LABELS: Record<
  AdminDisputePaymentKind,
  string
> = {
  escrow_hold: "Séquestre",
  escrow_release: "Libération vendeur",
  refund: "Remboursement",
  partial_refund: "Remboursement partiel",
};

export const DISPUTE_OUTCOMES: Array<{
  id: AdminDisputeOutcome;
  title: string;
  blurb: string;
  tone: string;
}> = [
  {
    id: "release_seller",
    title: "Libérer au vendeur",
    blurb: "Réclamation rejetée — le montant séquestré va au vendeur.",
    tone: "border-emerald-200 bg-emerald-200 text-emerald-950 hover:bg-emerald-300",
  },
  {
    id: "partial_refund",
    title: "Remboursement partiel",
    blurb: "Partager la séquestre — moitié à l’acheteur, dossier clos.",
    tone: "border-amber-200 bg-amber-200 text-amber-950 hover:bg-amber-300",
  },
  {
    id: "refund_buyer",
    title: "Rembourser l’acheteur",
    blurb: "Remboursement intégral — le vendeur ne reçoit pas la séquestre.",
    tone: "border-red-200 bg-red-200 text-red-950 hover:bg-red-300",
  },
];

export function outcomeOrderStatus(
  outcome: AdminDisputeOutcome,
): "completed" | "refunded" {
  return outcome === "release_seller" ? "completed" : "refunded";
}
