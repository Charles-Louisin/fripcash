"use client";

import { api } from "./client";

export async function becomeParticulier(body?: {
  displayName?: string;
  bio?: string;
}) {
  const { data } = await api.post("/me/seller/particulier", body ?? {});
  return data;
}

export async function applyForShop(body: {
  shopKind: "STANDARD" | "PROXIMITE" | "ENSEIGNE";
  name: string;
  description?: string;
  coverUrl?: string;
  documents?: Array<{
    url: string;
    storageKey?: string;
    mimeType?: string;
    name?: string;
    documentType?: string;
  }>;
}) {
  const { data } = await api.post("/me/seller/shop", body);
  return data;
}

export async function fetchSellerVerification() {
  const { data } = await api.get("/me/seller/verification");
  return data;
}

export async function sendSellerVerificationMessage(body: {
  body: string;
  attachments?: Array<{
    url: string;
    storageKey?: string;
    mimeType?: string;
    name?: string;
  }>;
}) {
  const { data } = await api.post("/me/seller/verification/messages", body);
  return data;
}

export async function addSellerVerificationDocument(body: {
  url: string;
  storageKey?: string;
  mimeType?: string;
  name?: string;
  documentType?: string;
}) {
  const { data } = await api.post("/me/seller/verification/documents", body);
  return data;
}

export async function fetchPublicSeller(id: string) {
  const { data } = await api.get(`/sellers/${id}/public`);
  return data;
}

export async function toggleSellerLike(id: string) {
  const { data } = await api.post(`/sellers/${id}/like`);
  return data as { liked: boolean; likesCount: number };
}

export async function closeParticulier() {
  const { data } = await api.post("/me/seller/particulier/close");
  return data;
}

export async function closeShop() {
  const { data } = await api.post("/me/seller/shop/close");
  return data;
}

export async function downgradeToParticulier() {
  const { data } = await api.post("/me/seller/downgrade-to-particulier");
  return data;
}

export async function updateBundleSettings(body: {
  bundleEnabled?: boolean;
  bundleMinItems?: number;
  bundleDiscountPercent?: number;
}) {
  const { data } = await api.patch("/me/seller/bundle-settings", body);
  return data;
}

export async function setVacation(body: {
  enabled: boolean;
  startsAt?: string;
  endsAt?: string;
}) {
  const { data } = await api.post("/me/seller/tools/vacation", body);
  return data;
}

export async function fetchProductLibrary() {
  const { data } = await api.get("/me/seller/tools/library");
  return data;
}

export async function createLibraryItem(body: {
  title: string;
  description?: string;
  categoryId?: string;
  payloadJson?: Record<string, unknown>;
}) {
  const { data } = await api.post("/me/seller/tools/library", body);
  return data;
}

export async function queueExcelImport(objectKey: string) {
  const { data } = await api.post("/me/seller/tools/excel-import", {
    objectKey,
  });
  return data;
}
