/**
 * Seller / account domain aligned with the Flutter app
 * (`UserRole`, `SignUpRole`, `ShopKind`, `DeliveryPerimeter`, `ListingDestination`,
 * `FulfillmentMode`, `OrderStatus`).
 *
 * Signup paths (SignUpRole):
 * - particulier → Seconde main
 * - boutique → Articles neufs (toute la ville)
 * - commerceLocal → Boutiques de quartier (mon quartier)
 * - grandeSurface → Enseignes (toute la ville, validation manuelle)
 *
 * Runtime account roles (UserRole) also include livreur + admin.
 */

export type SignUpRole =
  | "acheteur"
  | "particulier"
  | "boutique"
  | "commerceLocal"
  | "grandeSurface";

/** Mirrors Flutter `UserRole`. */
export type UserRole =
  | "acheteur"
  | "vendeurParticulier"
  | "boutique"
  | "livreur"
  | "admin";

/** Roles shown in admin user tables (signup + livreur). */
export type AccountRole = SignUpRole | "livreur";

export type ShopKind = "standard" | "proximite" | "enseigne";

export type DeliveryPerimeter = "monQuartier" | "touteLaVille";

export type ListingDestination =
  | "secondeMain"
  | "articlesNeufs"
  | "quartierBoutiques"
  | "enseignes";

/** Mirrors Flutter `FulfillmentMode`. */
export type FulfillmentMode = "courier" | "pickup" | "shopLocalDelivery";

/**
 * Mirrors Flutter `OrderStatus` happy path + exceptions.
 * Admin UI may still map a few legacy short codes → these.
 */
export type OrderStatus =
  | "ordered"
  | "paid"
  | "sellerNotified"
  | "preparing"
  | "readyForPickup"
  | "courierAssigned"
  | "collected"
  | "inTransit"
  | "delivered"
  | "fundsReleased"
  | "feedbackPending"
  | "disputed"
  | "refunded";

export const signUpRoleLabels: Record<SignUpRole, string> = {
  acheteur: "Acheteur",
  particulier: "Particulier",
  boutique: "Boutique",
  commerceLocal: "Commerce local",
  grandeSurface: "Grande surface",
};

export const userRoleLabels: Record<UserRole, string> = {
  acheteur: "Acheteur",
  vendeurParticulier: "Vendeur particulier",
  boutique: "Boutique",
  livreur: "Livreur",
  admin: "Admin",
};

export const accountRoleLabels: Record<AccountRole, string> = {
  ...signUpRoleLabels,
  livreur: "Livreur",
};

export const listingDestinationLabels: Record<ListingDestination, string> = {
  secondeMain: "Seconde main",
  articlesNeufs: "Articles neufs",
  quartierBoutiques: "Boutiques de quartier",
  enseignes: "Enseignes",
};

export const shopKindLabels: Record<ShopKind, string> = {
  standard: "Boutique classique",
  proximite: "Proximité",
  enseigne: "Enseigne",
};

export const perimeterLabels: Record<DeliveryPerimeter, string> = {
  monQuartier: "Mon quartier",
  touteLaVille: "Toute la ville",
};

export const fulfillmentModeLabels: Record<FulfillmentMode, string> = {
  courier: "Livreur FripCash",
  pickup: "Retrait boutique",
  shopLocalDelivery: "Livraison locale boutique",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  ordered: "Commandée",
  paid: "Payée",
  sellerNotified: "Vendeur notifié",
  preparing: "En préparation",
  readyForPickup: "Prête à récupérer",
  courierAssigned: "Livreur assigné",
  collected: "Collectée",
  inTransit: "En transit",
  delivered: "Livrée",
  fundsReleased: "Fonds libérés",
  feedbackPending: "Avis en attente",
  disputed: "En litige",
  refunded: "Remboursée",
};

/** Fixed perimeter by role — mirrors Flutter `defaultPerimeter`. */
export function defaultPerimeter(role: SignUpRole): DeliveryPerimeter | null {
  if (role === "boutique" || role === "grandeSurface") return "touteLaVille";
  if (role === "commerceLocal") return "monQuartier";
  return null;
}

/** Shop kind by role — mirrors Flutter `shopKindFor`. */
export function shopKindFor(role: SignUpRole): ShopKind | null {
  switch (role) {
    case "boutique":
      return "standard";
    case "commerceLocal":
      return "proximite";
    case "grandeSurface":
      return "enseigne";
    default:
      return null;
  }
}

/** Home universe for listings — mirrors Flutter `listingDestinationForSignUpRole`. */
export function listingDestinationForSignUpRole(
  role: SignUpRole
): ListingDestination {
  switch (role) {
    case "boutique":
      return "articlesNeufs";
    case "commerceLocal":
      return "quartierBoutiques";
    case "grandeSurface":
      return "enseignes";
    case "particulier":
    case "acheteur":
    default:
      return "secondeMain";
  }
}

/** Default fulfillment for a shop kind — proximity skips FripCash courier. */
export function fulfillmentModeForShopKind(
  kind: ShopKind | null | undefined
): FulfillmentMode {
  if (kind === "proximite") return "pickup";
  return "courier";
}

/** Commerce local + grande surface need manual team validation. */
export function requiresManualValidation(role: SignUpRole | AccountRole): boolean {
  return role === "commerceLocal" || role === "grandeSurface";
}

/** Commission rates aligned with Flutter (5% proximité, 8% standard/enseigne). */
export function commissionRateForShopKind(kind: ShopKind | null | undefined): number {
  return kind === "proximite" ? 5 : 8;
}

/** Map signup role → Flutter runtime UserRole. */
export function userRoleFromSignUp(role: SignUpRole): UserRole {
  switch (role) {
    case "particulier":
      return "vendeurParticulier";
    case "boutique":
    case "commerceLocal":
    case "grandeSurface":
      return "boutique";
    case "acheteur":
    default:
      return "acheteur";
  }
}

/** Normalize legacy admin order status codes → Flutter OrderStatus. */
export function normalizeOrderStatus(status: string): OrderStatus {
  const legacy: Record<string, OrderStatus> = {
    pending: "ordered",
    paid_escrow: "paid",
    in_delivery: "inTransit",
    awaiting_confirmation: "delivered",
  };
  if (status in legacy) return legacy[status];
  if (status in orderStatusLabels) return status as OrderStatus;
  return "ordered";
}

export const SELLER_ROLES: SignUpRole[] = [
  "particulier",
  "boutique",
  "commerceLocal",
  "grandeSurface",
];

export const ACCOUNT_ROLES: AccountRole[] = [
  "acheteur",
  ...SELLER_ROLES,
  "livreur",
];

export const LISTING_DESTINATIONS: ListingDestination[] = [
  "secondeMain",
  "articlesNeufs",
  "quartierBoutiques",
  "enseignes",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "ordered",
  "paid",
  "sellerNotified",
  "preparing",
  "readyForPickup",
  "courierAssigned",
  "collected",
  "inTransit",
  "delivered",
  "fundsReleased",
  "feedbackPending",
  "disputed",
  "refunded",
];
