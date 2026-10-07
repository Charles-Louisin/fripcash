import { setAdminSession } from "@/lib/admin-session";
import type { Me } from "@/lib/api";

export function homeForAccount(me: Me): string {
  if (me.isAdmin) return "/admin";
  if (me.courier) return "/livreur";
  return "/dashboard";
}

export function applySessionFlags(me: Me) {
  setAdminSession(!!me.isAdmin);
}

export function needsEmailVerification(me: {
  email?: string | null;
  emailVerified?: boolean;
}) {
  return Boolean(me.email) && me.emailVerified === false;
}
