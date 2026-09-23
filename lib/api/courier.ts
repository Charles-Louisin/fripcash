"use client";

import { api } from "./client";

/** Courier API module — primarily used by the mobile livreur app; available for web if needed. */

export async function fetchCourierMe() {
  const { data } = await api.get("/courier/me");
  return data;
}

export async function updateCourierAvailability(isAvailable: boolean) {
  const { data } = await api.patch("/courier/me/availability", {
    isAvailable,
  });
  return data;
}

export async function fetchCourierMissions() {
  const { data } = await api.get("/courier/missions");
  return data;
}

export async function fetchOpenMissions() {
  const { data } = await api.get("/courier/missions/open");
  return data;
}

export async function acceptMission(orderId: string) {
  const { data } = await api.post(`/courier/missions/${orderId}/accept`);
  return data;
}

export async function progressMission(
  orderId: string,
  status: "COLLECTED" | "IN_TRANSIT" | "DELIVERED"
) {
  const { data } = await api.post(`/courier/missions/${orderId}/progress`, {
    status,
  });
  return data;
}

export async function transferMission(
  orderId: string,
  toCourierUserId: string
) {
  const { data } = await api.post(`/courier/missions/${orderId}/transfer`, {
    toCourierUserId,
  });
  return data;
}
