import type { Me } from "@/lib/api";

export type AccountTypeId =
  | "acheteur"
  | "particulier"
  | "boutique"
  | "commerceLocal"
  | "grandeSurface"
  | "admin"
  | "livreur";

export type VerificationStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected";

export type AccountType = {
  id: AccountTypeId;
  label: string;
  shortLabel: string;
  description: string;
  destination: string | null;
  isSeller: boolean;
  isShop: boolean;
  /** Commerce local + enseigne must wait for admin. */
  requiresAdminApproval: boolean;
  verificationStatus: VerificationStatus;
  /** Live listings / Excel / directory. */
  canPublish: boolean;
  /** Nav: Excel page visible for every shop, even pending. */
  seesExcel: boolean;
  /** Nav: library visible for proximité, even pending. */
  seesLibrary: boolean;
  excelImport: boolean;
  productLibrary: boolean;
};

const BASE: Record<
  AccountTypeId,
  Omit<
    AccountType,
    | "verificationStatus"
    | "canPublish"
    | "seesExcel"
    | "seesLibrary"
    | "excelImport"
    | "productLibrary"
  >
> = {
  acheteur: {
    id: "acheteur",
    label: "Acheteur",
    shortLabel: "Acheteur",
    description: "Tu achètes sur FripCash. Tu n’as pas encore de profil vendeur.",
    destination: null,
    isSeller: false,
    isShop: false,
    requiresAdminApproval: false,
  },
  particulier: {
    id: "particulier",
    label: "Vendeur particulier",
    shortLabel: "Particulier",
    description: "Tu vends déjà en Seconde main — pas de validation admin.",
    destination: "Seconde main",
    isSeller: true,
    isShop: false,
    requiresAdminApproval: false,
  },
  boutique: {
    id: "boutique",
    label: "Boutique",
    shortLabel: "Boutique",
    description: "Tu es vendeur d’articles neufs, toute la ville.",
    destination: "Articles neufs",
    isSeller: true,
    isShop: true,
    requiresAdminApproval: false,
  },
  commerceLocal: {
    id: "commerceLocal",
    label: "Commerce local",
    shortLabel: "Quartier",
    description: "Tu es vendeur de proximité. La publication publique attend la validation admin.",
    destination: "Boutiques de quartier",
    isSeller: true,
    isShop: true,
    requiresAdminApproval: true,
  },
  grandeSurface: {
    id: "grandeSurface",
    label: "Grande surface spécialisée",
    shortLabel: "Enseigne",
    description: "Tu es déjà vendeur enseigne. Catalogue et outils s’ouvrent après validation admin.",
    destination: "Enseignes",
    isSeller: true,
    isShop: true,
    requiresAdminApproval: true,
  },
  admin: {
    id: "admin",
    label: "Administrateur",
    shortLabel: "Admin",
    description: "Espace d’administration de la plateforme.",
    destination: null,
    isSeller: false,
    isShop: false,
    requiresAdminApproval: false,
  },
  livreur: {
    id: "livreur",
    label: "Livreur",
    shortLabel: "Livreur",
    description: "Missions de livraison FripCash.",
    destination: null,
    isSeller: false,
    isShop: false,
    requiresAdminApproval: false,
  },
};

export type AccountUserLike = {
  isAdmin?: boolean;
  courier?: unknown;
  seller?: {
    kind?: string | null;
    shopKind?: string | null;
    verificationStatus?: string | null;
    capabilities?: { createListing?: boolean };
  } | null;
  role?: string;
  shopKind?: string | null;
};

function idFromUser(user?: AccountUserLike | Me | null): AccountTypeId {
  if (!user) return "acheteur";
  if ("isAdmin" in user && user.isAdmin) return "admin";
  if ("courier" in user && user.courier) return "livreur";

  const seller = "seller" in user ? user.seller : null;
  const shopKind =
    seller?.shopKind ??
    ("shopKind" in user ? user.shopKind : null) ??
    null;

  const role = "role" in user ? (user as { role?: string }).role : undefined;
  if (seller?.kind === "particulier" || role === "vendeurParticulier") {
    return "particulier";
  }
  if (seller?.kind === "boutique" || role === "boutique") {
    if (shopKind === "proximite") return "commerceLocal";
    if (shopKind === "enseigne") return "grandeSurface";
    return "boutique";
  }
  return "acheteur";
}

export function resolveAccountType(user?: AccountUserLike | Me | null): AccountType {
  const id = idFromUser(user);
  const base = BASE[id];
  const raw = user && "seller" in user ? user.seller?.verificationStatus : undefined;
  const verificationStatus: VerificationStatus =
    raw === "pending" || raw === "approved" || raw === "rejected" || raw === "none"
      ? raw
      : base.requiresAdminApproval
        ? "pending"
        : "approved";

  const canPublish =
    base.isSeller &&
    verificationStatus !== "rejected" &&
    (!base.requiresAdminApproval || verificationStatus === "approved");

  const seesExcel = base.isShop;
  const seesLibrary = id === "commerceLocal";

  return {
    ...base,
    verificationStatus,
    canPublish,
    seesExcel,
    seesLibrary,
    excelImport: seesExcel && canPublish,
    productLibrary: seesLibrary && canPublish,
  };
}

export function accountTypeLabel(user?: AccountUserLike | Me | null) {
  return resolveAccountType(user).label;
}

export function verificationLabel(status: VerificationStatus) {
  if (status === "approved") return "Validé par l’équipe";
  if (status === "pending") return "En attente de validation";
  if (status === "rejected") return "Dossier refusé";
  return "Aucune validation requise";
}
