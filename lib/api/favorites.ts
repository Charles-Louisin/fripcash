"use client";

import { api } from "./client";

export async function fetchFavorites() {
  const { data } = await api.get("/favorites");
  return data;
}

export async function addFavorite(listingId: string) {
  const { data } = await api.post(`/favorites/${listingId}`);
  return data;
}

export async function removeFavorite(listingId: string) {
  const { data } = await api.delete(`/favorites/${listingId}`);
  return data;
}
