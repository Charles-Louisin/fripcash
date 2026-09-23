"use client";

import { api } from "./client";

export async function fetchMyKyc() {
  const { data } = await api.get("/me/kyc");
  return data;
}

export async function submitMyKyc(body?: { note?: string }) {
  const { data } = await api.post("/me/kyc", body ?? {});
  return data;
}

export async function uploadMyKycDocument(body: {
  documentType: string;
  storageKey: string;
  mimeType?: string;
}) {
  const { data } = await api.post("/me/kyc/documents", body);
  return data;
}

export async function fetchOrgKyc(orgId: string) {
  const { data } = await api.get(`/organizations/${orgId}/kyc`);
  return data;
}

export async function submitOrgKyc(orgId: string, body?: { note?: string }) {
  const { data } = await api.post(`/organizations/${orgId}/kyc`, body ?? {});
  return data;
}

export async function uploadOrgKycDocument(
  orgId: string,
  body: { documentType: string; storageKey: string; mimeType?: string }
) {
  const { data } = await api.post(
    `/organizations/${orgId}/kyc/documents`,
    body
  );
  return data;
}
