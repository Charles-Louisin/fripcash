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

export async function fetchMyDisputes() {
  const { data } = await api.get("/disputes");
  return data;
}

export async function addDisputeEvidence(
  id: string,
  body: { url: string; storageKey?: string; uploaderRole?: string }
) {
  const { data } = await api.post(`/disputes/${id}/evidence`, body);
  return data;
}

export async function addDisputeMessage(
  id: string,
  body: string,
  extra?: {
    kind?: string;
    attachments?: Array<{ url: string; storageKey?: string; mimeType?: string; name?: string }>;
  }
) {
  const { data } = await api.post(`/disputes/${id}/messages`, {
    body,
    ...extra,
  });
  return data;
}

export async function closeDispute(id: string) {
  const { data } = await api.post(`/disputes/${id}/close`);
  return data;
}

export async function reopenDispute(id: string) {
  const { data } = await api.post(`/disputes/${id}/reopen`);
  return data;
}

export async function acceptOrderOffer(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/offer/accept`);
  return data;
}

export async function refuseOrderOffer(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/offer/refuse`);
  return data;
}

export async function payFullAfterOfferRefuse(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/offer/pay-full`);
  return data;
}

export async function cancelAfterOfferRefuse(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/offer/cancel`);
  return data;
}

export async function sellerRefund(orderId: string, amount: "full" | number = "full") {
  const { data } = await api.post(`/orders/${orderId}/seller-refund`, { amount });
  return data;
}

export async function confirmReception(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/confirm-reception`);
  return data;
}

export async function requestCourier(orderId: string) {
  const { data } = await api.post(`/orders/${orderId}/request-courier`);
  return data;
}

export async function fetchSalesChart(days = 30) {
  const { data } = await api.get(`/orders/sales-chart`, { params: { days } });
  return data as { date: string; ventes: number; revenus: number }[];
}

export async function fetchInvoiceReceipt(id: string) {
  const { data } = await api.get<{ url?: string; receiptUrl?: string }>(
    `/invoices/${id}/receipt`
  );
  return data;
}
