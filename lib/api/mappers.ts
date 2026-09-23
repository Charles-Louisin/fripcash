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
