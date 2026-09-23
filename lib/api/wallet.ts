"use client";

import { api } from "./client";

export async function fetchWalletBalance() {
  const { data } = await api.get("/wallet/balance");
  return data;
}

export async function fetchWalletLedger() {
  const { data } = await api.get("/wallet/ledger");
  return data;
}

export async function requestWithdraw(amountGnf: number) {
  const { data } = await api.post("/wallet/withdraw", { amountGnf });
  return data;
}
