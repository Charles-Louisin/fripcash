"use client";

import { api } from "./client";

export type Cart = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    cartId: string;
    listingId: string;
    quantity: number;
    listing: {
      id: string;
      title: string;
      priceGnf: number;
      quantity: number;
      status: string;
      media?: Array<{ storageKey: string; url?: string | null }>;
    };
  }>;
};

export async function getCart() {
  const { data } = await api.get<Cart>("/cart");
  return data;
}

export async function clearCart() {
  const { data } = await api.delete<Cart>("/cart");
  return data;
}

export async function addCartItem(listingId: string, quantity: number) {
  const { data } = await api.post<Cart>("/cart/items", {
    listingId,
    quantity,
  });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch<Cart>(`/cart/items/${itemId}`, {
    quantity,
  });
  return data;
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
  return data;
}

export async function checkout(body?: {
  fulfillmentMode?: "courier" | "pickup" | "shopLocalDelivery";
  paymentMethod?: string;
  address?: string;
  city?: string;
  phone?: string;
  name?: string;
  shippingCostGnf?: number;
  toZoneId?: string;
  zoneId?: string;
  offerAmountGnf?: number;
}) {
  const { data } = await api.post<{
    paymentIntent?: unknown;
    orders?: unknown[];
  }>("/checkout", body ?? {});
  return data;
}
