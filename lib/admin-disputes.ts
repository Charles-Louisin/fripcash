/** Dispute / refund resolve types & mock data (thriftcash parity, mock-only). */

export type AdminDisputeStatus = "open" | "under_review" | "resolved";

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

export const INITIAL_ADMIN_DISPUTES: AdminDispute[] = [
  {
    id: "DSP-1001",
    orderId: "ord_mock_1004",
    productTitle: "Écouteurs Bluetooth JBL",
    productImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    buyerName: "ibrahima_gn",
    sellerName: "ibrahim_shop",
    amount: 65000,
    reason:
      "Article reçu endommagé — écouteur gauche ne fonctionne pas, pas conforme à l’annonce.",
    initiatedBy: "buyer",
    initiatorName: "ibrahima_gn",
    openedVia: "order_page",
    status: "open",
    openedAt: "2026-06-18T14:00:00Z",
    evidence: [
      "Photo acheteur : écouteur endommagé",
      "Photos de l’annonce vs reçu",
      "Fil de discussion avec ibrahim_shop",
      "Séquestre Orange Money PAY-895",
    ],
  },
  {
    id: "DSP-1000",
    orderId: "ord_mock_1007",
    productTitle: "Robe wax premium",
    productImage:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
    buyerName: "fatou_styles",
    sellerName: "mariam_mode",
    amount: 120000,
    reason: "Colis jamais arrivé alors que le livreur a déclaré la livraison.",
    initiatedBy: "buyer",
    initiatorName: "fatou_styles",
    openedVia: "order_page",
    status: "under_review",
    openedAt: "2026-06-24T10:00:00Z",
    notes: "Demande du log GPS livreur et photo d’emballage vendeur.",
    evidence: [
      "Horodatage de livraison déclarée",
      "Confirmation d’adresse acheteur",
      "Photo d’emballage vendeur",
    ],
  },
  {
    id: "DSP-0998",
    orderId: "ord_mock_1008",
    productTitle: "Tote canvas",
    productImage:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop",
    buyerName: "moussa_gn",
    sellerName: "aminata_v",
    amount: 18000,
    reason: "Mauvaise couleur livrée.",
    initiatedBy: "buyer",
    initiatorName: "moussa_gn",
    openedVia: "dashboard",
    status: "resolved",
    outcome: "partial_refund",
    openedAt: "2026-06-10T09:30:00Z",
    resolvedAt: "2026-06-12T15:40:00Z",
    evidence: ["Photo unboxing acheteur", "Nuancier couleur de l’annonce"],
  },
];

export const INITIAL_DISPUTE_PAYMENTS: AdminDisputePayment[] = [
  {
    id: "PAY-hold-1004",
    kind: "escrow_hold",
    label: "Séquestre · ord_mock_1004",
    amount: 65000,
    orderId: "ord_mock_1004",
    createdAt: "2026-06-18T12:00:00Z",
  },
  {
    id: "PAY-hold-1007",
    kind: "escrow_hold",
    label: "Séquestre · ord_mock_1007",
    amount: 120000,
    orderId: "ord_mock_1007",
    createdAt: "2026-06-24T08:00:00Z",
  },
  {
    id: "PAY-partial-1008",
    kind: "partial_refund",
    label: "Remboursement partiel · ord_mock_1008",
    amount: 9000,
    orderId: "ord_mock_1008",
    createdAt: "2026-06-12T15:40:00Z",
  },
];
