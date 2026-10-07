"use client";

import { api, clearToken, writeToken } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  emailVerified?: boolean;
  preferredLocale?: "FR" | "EN";
  userKind?: string;
  authAudience?: "CONSUMER" | "ADMIN" | "COURIER";
};

export type VerifyOtpResponse = {
  status: boolean;
  token: string | null;
  user: AuthUser;
};

export async function sendOtp(phoneNumber: string) {
  const { data } = await api.post<{ message: string }>(
    "/auth/phone-number/send-otp",
    { phoneNumber }
  );
  return data;
}

export async function verifyOtp(
  phoneNumber: string,
  code: string,
  signupRole?: string,
  extra?: { name?: string; displayName?: string }
) {
  const { data } = await api.post<VerifyOtpResponse>(
    "/auth/phone-number/verify",
    {
      phoneNumber,
      code,
      ...(signupRole ? { signupRole } : {}),
      ...(extra?.name ? { name: extra.name } : {}),
      ...(extra?.displayName ? { displayName: extra.displayName } : {}),
    }
  );
  if (!data.token) {
    throw new Error("No session token returned");
  }
  writeToken(data.token);
  return data;
}

export async function signOut() {
  try {
    await api.post("/auth/sign-out");
  } finally {
    clearToken();
  }
}

export async function getSession() {
  const { data } = await api.get<{
    session: { token: string };
    user: AuthUser;
  } | null>("/auth/get-session");
  return data;
}

export async function signInEmail(email: string, password: string) {
  const { data } = await api.post<{
    token?: string;
    user?: AuthUser;
    session?: { token?: string };
  }>("/auth/sign-in/email", { email, password });

  const token = data.token || data.session?.token;
  if (token) writeToken(token);
  return data;
}

export async function courierLogin(body: {
  email?: string;
  phone?: string;
  password: string;
}) {
  const { data } = await api.post<{
    token?: string;
    user?: AuthUser;
  }>("/auth/courier/login", body);
  const token = data.token;
  if (!token) throw new Error("No courier session token returned");
  writeToken(token);
  return data;
}

/** Staff only — Nest `POST /auth/admin/login` → `aud: admin` session. */
export async function adminLogin(email: string, password: string) {
  const { data } = await api.post<{
    token?: string;
    user?: AuthUser;
    redirect?: boolean;
  }>("/auth/admin/login", { email, password });

  const token = data.token;
  if (!token) {
    throw new Error("No admin session token returned");
  }
  writeToken(token);
  return data;
}

/** France — Better Auth email signup. */
export async function signUpEmail(body: {
  email: string;
  password: string;
  name: string;
  signupRole?: string;
}) {
  const { data } = await api.post<{
    token?: string | null;
    user: AuthUser;
  }>("/auth/sign-up/email", body);

  const token = data.token;
  if (token) writeToken(token);
  return data;
}

export async function sendVerificationEmail(email: string) {
  const { data } = await api.post<{ message: string; code?: string }>(
    "/auth/send-verification-email",
    { email }
  );
  return data;
}

export async function verifyEmailCode(body: { email?: string; code: string }) {
  const { data } = await api.post<{
    status: boolean;
    message: string;
  }>("/auth/verify-email-code", body);
  return data;
}

/** @deprecated Use verifyEmailCode */
export async function verifyEmail(token: string) {
  return verifyEmailCode({ code: token });
}

export async function requestPasswordReset(
  email: string,
  redirectTo?: string
) {
  const { data } = await api.post<{ message: string; token?: string }>(
    "/auth/request-password-reset",
    {
      email,
      ...(redirectTo ? { redirectTo } : {}),
    }
  );
  return data;
}

export async function resetPassword(body: {
  token: string;
  newPassword: string;
}) {
  const { data } = await api.post("/auth/reset-password", body);
  return data;
}

/** @deprecated Prefer `adminLogin` — staff must use `/auth/admin/login`. */
export const adminSignInEmail = adminLogin;
