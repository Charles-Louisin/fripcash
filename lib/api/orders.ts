"use client";

import { api } from "./client";

export type OrderStatus =
  | "ORDERED"
  | "PAID"
  | "SELLER_NOTIFIED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "COURIER_ASSIGNED"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FUNDS_RELEASED"
  | "FEEDBACK_PENDING"
  | "DISPUTED"
  | "REFUNDED";

export async function fetchPurchases() {
  const { data } = await api.get("/orders/purchases");
  return data;
}

export async function fetchSales() {
  const { data } = await api.get("/orders/sales");
  return data;
}

export async function fetchOrder(id: string) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function transitionOrderStatus(
  id: string,
  body: { status: OrderStatus; note?: string }
) {
  const { data } = await api.patch(`/orders/${id}/status`, body);
  return data;
}

export async function openDispute(orderId: string, reason: string) {
  const { data } = await api.post(`/orders/${orderId}/disputes`, { reason });
  return data;
}

export async function fetchInvoiceReceipt(id: string) {
  const { data } = await api.get<{ url?: string; receiptUrl?: string }>(
    `/invoices/${id}/receipt`
  );
  return data;
}
