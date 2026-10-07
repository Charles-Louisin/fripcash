/** Shared enum mappers between Nest SCREAMING_SNAKE and UI camelCase. */

export const DEST_TO_UI: Record<string, string> = {
  SECONDE_MAIN: "secondeMain",
  ARTICLES_NEUFS: "articlesNeufs",
  QUARTIER_BOUTIQUES: "quartierBoutiques",
  ENSEIGNES: "enseignes",
};

export const DEST_TO_API: Record<string, string> = {
  secondeMain: "SECONDE_MAIN",
  articlesNeufs: "ARTICLES_NEUFS",
  quartierBoutiques: "QUARTIER_BOUTIQUES",
  enseignes: "ENSEIGNES",
};

export const SHOP_KIND_TO_API: Record<string, string> = {
  standard: "STANDARD",
  proximite: "PROXIMITE",
  enseigne: "ENSEIGNE",
};

export const ORDER_STATUS_TO_UI: Record<string, string> = {
  ORDERED: "ordered",
  PAID: "paid",
  SELLER_NOTIFIED: "sellerNotified",
  PREPARING: "preparing",
  READY_FOR_PICKUP: "readyForPickup",
  COURIER_ASSIGNED: "courierAssigned",
  COLLECTED: "collected",
  IN_TRANSIT: "inTransit",
  DELIVERED: "delivered",
  FUNDS_RELEASED: "fundsReleased",
  FEEDBACK_PENDING: "feedbackPending",
  DISPUTED: "disputed",
  REFUNDED: "refunded",
};

export const ORDER_STATUS_TO_API: Record<string, string> = Object.fromEntries(
  Object.entries(ORDER_STATUS_TO_UI).map(([k, v]) => [v, k])
);

export const ORDER_STATUS_LABEL_FR: Record<string, string> = {
  ORDERED: "Commandé",
  PAID: "Payé (séquestre)",
  SELLER_NOTIFIED: "Vendeur notifié",
  PREPARING: "Préparation",
  READY_FOR_PICKUP: "Prêt à récupérer",
  COURIER_ASSIGNED: "Livreur assigné",
  COLLECTED: "Collecté",
  IN_TRANSIT: "En livraison",
  DELIVERED: "Livré",
  FUNDS_RELEASED: "Fonds libérés",
  FEEDBACK_PENDING: "Avis en attente",
  DISPUTED: "En litige",
  REFUNDED: "Remboursé",
  ordered: "Commandé",
  paid: "Payé (séquestre)",
  sellerNotified: "Vendeur notifié",
  preparing: "Préparation",
  readyForPickup: "Prêt à récupérer",
  courierAssigned: "Livreur assigné",
  collected: "Collecté",
  inTransit: "En livraison",
  delivered: "Livré",
  fundsReleased: "Fonds libérés",
  feedbackPending: "Avis en attente",
  disputed: "En litige",
  refunded: "Remboursé",
};
