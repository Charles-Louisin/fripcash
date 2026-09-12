/**
 * Account capability helpers — mirrors Flutter `seller_access.dart`
 * and docs/backend/roles-and-capabilities.md
 */

import type {
  ListingDestination,
  ShopKind,
  SignUpRole,
  UserRole,
} from "@/lib/seller-domain";
import {
  listingDestinationForSignUpRole,
  shopKindFor,
  userRoleFromSignUp,
} from "@/lib/seller-domain";

export type SellerKind = "none" | "particulier" | "boutique";

export type VerificationStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected";

export type SellerCapabilities = {
  createListing: boolean;
  excelImport: boolean;
  productLibrary: boolean;
  sellerDashboard: boolean;
};

export type AccountSellerSnapshot = {
  kind: SellerKind;
  shopKind: ShopKind | null;
  verificationStatus: VerificationStatus;
  listingDestination: ListingDestination | null;
  capabilities: SellerCapabilities;
};

export function sellerKindFromUserRole(
  role: UserRole | string | undefined,
  shopKind?: ShopKind | null
): SellerKind {
  if (role === "vendeurParticulier" || role === "particulier") {
    return "particulier";
  }
  if (role === "boutique" || shopKind) return "boutique";
  // Legacy mock "seller"
  if (role === "seller") return "particulier";
  return "none";
}

export function buildSellerSnapshot(input: {
  role?: string;
  shopKind?: ShopKind | null;
  verificationStatus?: VerificationStatus;
}): AccountSellerSnapshot {
  const kind = sellerKindFromUserRole(input.role, input.shopKind);
  const shopKind = input.shopKind ?? null;
  const needsReview = shopKind === "proximite" || shopKind === "enseigne";
  const verificationStatus: VerificationStatus =
    input.verificationStatus ??
    (needsReview ? "pending" : kind === "none" ? "none" : "approved");

  const canPublish =
    kind !== "none" &&
    !(needsReview && verificationStatus === "pending") &&
    verificationStatus !== "rejected";

  const destination: ListingDestination | null =
    kind === "none"
      ? null
      : kind === "particulier"
        ? "secondeMain"
        : shopKind === "proximite"
          ? "quartierBoutiques"
          : shopKind === "enseigne"
            ? "enseignes"
            : "articlesNeufs";

  return {
    kind,
    shopKind,
    verificationStatus,
    listingDestination: destination,
    capabilities: {
      createListing: canPublish,
      excelImport: kind === "boutique",
      productLibrary: shopKind === "proximite" && canPublish,
      sellerDashboard: kind !== "none",
    },
  };
}

/** Web-allowed upgrade: buyer → particulier only (shops → app). */
export function webUpgradeToParticulier(): {
  role: UserRole;
  signUpRole: SignUpRole;
  shopKind: null;
  listingDestination: ListingDestination;
} {
  return {
    role: userRoleFromSignUp("particulier"),
    signUpRole: "particulier",
    shopKind: null,
    listingDestination: listingDestinationForSignUpRole("particulier"),
  };
}

export function shopKindLabelShort(kind: ShopKind | null): string {
  if (!kind) return "Particulier";
  return shopKindFor(
    kind === "proximite"
      ? "commerceLocal"
      : kind === "enseigne"
        ? "grandeSurface"
        : "boutique"
  )
    ? kind === "proximite"
      ? "Commerce local"
      : kind === "enseigne"
        ? "Enseigne"
        : "Boutique"
    : "Boutique";
}
