"use client";

import { api, clearToken, writeToken } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
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

export async function verifyOtp(phoneNumber: string, code: string) {
  const { data } = await api.post<VerifyOtpResponse>(
    "/auth/phone-number/verify",
    { phoneNumber, code }
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

/** @deprecated Prefer signInEmail — same Better Auth endpoint */
export const adminSignInEmail = signInEmail;
