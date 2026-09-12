import {
  type AdminUserSession,
  type LegacySessionRole,
  type SessionRole,
} from "@/lib/admin-platform";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";

function detectDevice(): AdminUserSession["device"] {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Navigateur";
}

function detectOs(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Inconnu";
}

function nowLabel(): string {
  return `Aujourd'hui, ${new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function recordLoginSession(params: {
  email: string;
  displayName?: string;
  role?: SessionRole | LegacySessionRole;
  userId?: string;
}) {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent;
  const email = params.email.trim().toLowerCase();
  const displayName =
    params.displayName ||
    email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useAdminPlatformStore.getState().recordSession({
    userId: params.userId ?? `u_${Date.now()}`,
    displayName,
    email,
    role: params.role ?? (email.includes("admin") ? "admin" : "acheteur"),
    device: detectDevice(),
    browser: detectBrowser(ua),
    os: detectOs(ua),
    ip: "196.158.42.18",
    location: "Conakry, GN",
    startedAtIso: new Date().toISOString(),
    startedAtLabel: nowLabel(),
    lastSeenLabel: "À l'instant",
    status: "active",
  });
}
