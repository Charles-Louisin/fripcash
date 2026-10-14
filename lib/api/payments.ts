"use client";

import { api } from "./client";

export type CheckoutPaymentMethod = "OM_GN" | "MTN_GN" | "CINETPAY";

export type PaymentPublic = {
  id: string;
  merchantTransactionId: string;
  status: "pending" | "success" | "failed" | "expired";
  kind: string;
  paymentMethod: CheckoutPaymentMethod;
  amountGnf: number;
  message: string;
  paymentUrl: string;
  mustRedirect?: boolean;
  orderIds: string[];
};

export async function fetchPayment(merchantTransactionId: string) {
  const { data } = await api.get<{
    payment: PaymentPublic;
    orders: unknown[];
  }>(`/payments/${encodeURIComponent(merchantTransactionId)}`);
  return data;
}
