"use client";

import { api } from "./client";

export async function fetchHealth() {
  const { data } = await api.get<{ status: string; timestamp?: string }>(
    "/health"
  );
  return data;
}

export async function fetchReady() {
  const { data } = await api.get("/health/ready");
  return data;
}
