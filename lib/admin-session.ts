import { removeToken, setToken } from "@/lib/api";

const ADMIN_SESSION_KEY = "fripcash-admin-session";

export function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminSession(active: boolean) {
  if (typeof window === "undefined") return;
  if (active) {
    localStorage.setItem(ADMIN_SESSION_KEY, "1");
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function clearAdminSession() {
  setAdminSession(false);
  removeToken();
}
