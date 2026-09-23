"use client";

import { api } from "./client";

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function registerDevice(body: {
  token: string;
  platform: string;
  audience: "CONSUMER" | "ADMIN" | "COURIER";
}) {
  const { data } = await api.post("/notifications/devices", body);
  return data;
}

export async function fetchNotificationPreferences() {
  const { data } = await api.get("/notifications/preferences");
  return data;
}

export async function upsertNotificationPreference(body: {
  type: string;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
}) {
  const { data } = await api.put("/notifications/preferences", body);
  return data;
}
