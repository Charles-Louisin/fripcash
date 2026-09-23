/** Shared admin money formatting + session label types (no mock datasets). */

export type SessionStatus = "active" | "idle" | "ended";

export type SessionRole =
  | "admin"
  | "acheteur"
  | "particulier"
  | "boutique"
  | "commerceLocal"
  | "grandeSurface"
  | "livreur"
  | "vendeur";

/** @deprecated Prefer SessionRole */
export type LegacySessionRole = SessionRole;

export type AdminUserSession = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: SessionRole | LegacySessionRole;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ip: string;
  location: string;
  startedAtIso: string;
  startedAtLabel: string;
  lastSeenLabel: string;
  status: SessionStatus;
};

export const sessionRoleLabels: Record<SessionRole | LegacySessionRole, string> =
  {
    admin: "Admin",
    acheteur: "Acheteur",
    particulier: "Particulier",
    boutique: "Boutique",
    commerceLocal: "Commerce local",
    grandeSurface: "Grande surface",
    livreur: "Livreur",
    vendeur: "Vendeur",
  };

export function formatGnf(amount: number) {
  return `${Math.round(amount || 0).toLocaleString("fr-FR")} GNF`;
}
