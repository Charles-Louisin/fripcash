/**
 * Client-side gates for marketplace CTAs.
 * Prefer hiding actions over letting users hit FORBIDDEN_AUDIENCE (403).
 *
 * Rules (aligned with docs/backend/roles-and-capabilities.md):
 * - Admin / non-buyer accounts → no buy / offer / message-as-buyer
 * - Enseigne listings → no offers (negotiation disabled)
 * - Own listings → no offer / message-to-self
 * - Guests → still show buy/offer (except enseigne offer) → login redirect
 */

export type MarketplaceActor = {
  isLoggedIn: boolean;
  canBuy?: boolean;
  isAdmin?: boolean;
  /** Seller profile id when the user also sells */
  sellerProfileId?: string | null;
};

export type MarketplaceListing = {
  /** API destination e.g. ENSEIGNES, or UI slug enseignes */
  destination?: string | null;
  sellerProfileId?: string | null;
};

function destKey(destination?: string | null): string {
  return String(destination || "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");
}

export function isEnseigneListing(listing: MarketplaceListing): boolean {
  const d = destKey(listing.destination);
  return d === "ENSEIGNES" || d === "ENSEIGNE";
}

/** Cart / checkout style actions */
export function canAddToCart(actor: MarketplaceActor): boolean {
  if (!actor.isLoggedIn) return true;
  if (actor.isAdmin) return false;
  if (actor.canBuy === false) return false;
  return true;
}

/** Price negotiation — not on enseigne, not on own listing */
export function canMakeOffer(
  actor: MarketplaceActor,
  listing: MarketplaceListing
): boolean {
  if (isEnseigneListing(listing)) return false;
  if (!canAddToCart(actor)) return false;
  if (
    actor.isLoggedIn &&
    actor.sellerProfileId &&
    listing.sellerProfileId &&
    actor.sellerProfileId === listing.sellerProfileId
  ) {
    return false;
  }
  return true;
}

/** Buyer → seller chat */
export function canMessageSeller(
  actor: MarketplaceActor,
  listing: MarketplaceListing
): boolean {
  if (!actor.isLoggedIn) return true;
  if (actor.isAdmin) return false;
  if (actor.canBuy === false) return false;
  if (
    actor.sellerProfileId &&
    listing.sellerProfileId &&
    actor.sellerProfileId === listing.sellerProfileId
  ) {
    return false;
  }
  return true;
}
