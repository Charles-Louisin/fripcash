"use client";

import { api } from "./client";

export async function fetchMyOffers() {
  const { data } = await api.get("/offers/mine");
  return data;
}

export async function fetchListingOffers(listingId: string) {
  const { data } = await api.get(`/offers/listings/${listingId}`);
  return data;
}

export async function createOffer(
  listingId: string,
  body: { amountGnf: number; message?: string }
) {
  const { data } = await api.post(`/offers/listings/${listingId}`, body);
  return data;
}

export async function acceptOffer(id: string) {
  const { data } = await api.patch(`/offers/${id}/accept`);
  return data;
}

export async function refuseOffer(id: string) {
  const { data } = await api.patch(`/offers/${id}/refuse`);
  return data;
}
