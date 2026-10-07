"use client";

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ApiError, type ApiErrorBody, type AuthErrorBody } from "./errors";

export const TOKEN_COOKIE = "fripcash_token";
const LEGACY_TOKEN_KEY = "fripcash-token";

export function readToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`)
  );
  if (match) return decodeURIComponent(match[1]);
  try {
    const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      writeToken(legacy);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  try {
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0`;
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** @deprecated Prefer writeToken */
export function setToken(token: string) {
  writeToken(token);
}

/** @deprecated Prefer clearToken */
export function removeToken() {
  clearToken();
}

export function getToken(): string | null {
  return readToken();
}

function shouldRedirectOn401(pathname: string): boolean {
  if (
    pathname.startsWith("/connexion")
  ) {
    return false;
  }
  // Public browse: don't bounce guests when an optional authed call 401s
  if (
    pathname === "/" ||
    pathname.startsWith("/produits") ||
    pathname.startsWith("/article")
  ) {
    return false;
  }
  return true;
}

export const api = axios.create({
  // Browser: same-origin Next proxy (/api/v1 → backend :5000). Avoids CORS
  // and works if you open the site via localhost or 192.168.x.x.
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000/api/v1"
      : "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    config.baseURL = "/api/v1";
  }
  const url = config.url ?? "";
  const isAnonAuth =
    url.includes("/auth/phone-number/send-otp") ||
    url.includes("/auth/phone-number/verify") ||
    url.includes("/auth/sign-in/") ||
    url.includes("/auth/admin/login");

  if (!isAnonAuth) {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const locale =
    typeof document !== "undefined"
      ? document.documentElement.lang?.toUpperCase()
      : "FR";
  config.headers["x-locale"] = locale === "EN" ? "EN" : "FR";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody | AuthErrorBody>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (!error.response) {
      const offline =
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message === "Network Error";
      return Promise.reject(
        new ApiError({
          statusCode: 0,
          code: "NETWORK",
          message: offline
            ? "Impossible de joindre l’API. Vérifie que le backend tourne (port 5000) et recharge la page."
            : error.message || "Request failed",
          locale: "FR",
        })
      );
    }

    if (status === 401) {
      clearToken();
      if (
        typeof window !== "undefined" &&
        shouldRedirectOn401(window.location.pathname)
      ) {
        window.location.assign("/connexion");
      }
    }

    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      "statusCode" in data &&
      "code" in data
    ) {
      return Promise.reject(new ApiError(data as ApiErrorBody));
    }

    const body =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as AuthErrorBody)
        : null;
    const message = body?.message || error.message || "Request failed";
    const code = body?.code || `HTTP_${status ?? 0}`;

    return Promise.reject(
      new ApiError({
        statusCode: status ?? 0,
        code: String(code),
        message: String(message),
        locale: "FR",
      })
    );
  }
);
