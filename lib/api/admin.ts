"use client";

import { api } from "./client";

export async function fetchAdminMe() {
  const { data } = await api.get("/admin/me");
  return data;
}

export async function fetchPlatformSettings() {
  const { data } = await api.get("/admin/platform-settings");
  return data;
}

export async function fetchAuditLogs() {
  const { data } = await api.get("/admin/audit-logs");
  return data;
}

export async function provisionAudience(
  userId: string,
  audience: "CONSUMER" | "ADMIN" | "COURIER"
) {
  const { data } = await api.post(
    `/admin/users/${userId}/provision-audience`,
    { audience }
  );
  return data;
}

export async function hideReview(id: string) {
  const { data } = await api.post(`/admin/reviews/${id}/hide`);
  return data;
}

export async function hideComment(id: string) {
  const { data } = await api.post(`/admin/comments/${id}/hide`);
  return data;
}

export async function fetchSellerVerifications() {
  const { data } = await api.get("/admin/seller-verifications");
  return data;
}

export async function approveSellerVerification(
  id: string,
  reviewerNote?: string
) {
  const { data } = await api.post(
    `/admin/seller-verifications/${id}/approve`,
    { reviewerNote }
  );
  return data;
}

export async function rejectSellerVerification(
  id: string,
  reviewerNote?: string
) {
  const { data } = await api.post(
    `/admin/seller-verifications/${id}/reject`,
    { reviewerNote }
  );
  return data;
}

export async function fetchAdminOrgKyc() {
  const { data } = await api.get("/admin/kyc/organizations");
  return data;
}

export async function fetchAdminIndividualKyc() {
  const { data } = await api.get("/admin/kyc/individuals");
  return data;
}

export async function approveOrgKyc(id: string, reviewerNote?: string) {
  const { data } = await api.post(`/admin/kyc/organizations/${id}/approve`, {
    reviewerNote,
  });
  return data;
}

export async function rejectOrgKyc(id: string, reviewerNote?: string) {
  const { data } = await api.post(`/admin/kyc/organizations/${id}/reject`, {
    reviewerNote,
  });
  return data;
}

export async function requestOrgKycResubmission(
  id: string,
  reviewerNote?: string
) {
  const { data } = await api.post(
    `/admin/kyc/organizations/${id}/request-resubmission`,
    { reviewerNote }
  );
  return data;
}

export async function approveIndividualKyc(id: string, reviewerNote?: string) {
  const { data } = await api.post(`/admin/kyc/individuals/${id}/approve`, {
    reviewerNote,
  });
  return data;
}

export async function rejectIndividualKyc(id: string, reviewerNote?: string) {
  const { data } = await api.post(`/admin/kyc/individuals/${id}/reject`, {
    reviewerNote,
  });
  return data;
}

export async function resolveDispute(
  id: string,
  body: { resolution: "resolved_buyer" | "resolved_seller"; note: string }
) {
  const { data } = await api.post(`/admin/disputes/${id}/resolve`, body);
  return data;
}

/** Admin catalogue — all statuses (unlike public GET /listings = ACTIVE only). */
export type AdminListing = {
  id: string;
  sellerProfileId: string;
  categoryId: string | null;
  zoneId: string | null;
  title: string;
  description: string | null;
  priceGnf: number;
  quantity: number;
  status: string;
  destination: string;
  conditionNote: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  media?: Array<{
    id?: string;
    storageKey?: string;
    url?: string | null;
    mimeType?: string;
    sortOrder?: number;
  }>;
  sellerProfile?: {
    id: string;
    userId?: string;
    sellerKind?: string;
    verificationStatus?: string;
  };
  category?: {
    id: string;
    nameFr?: string;
    nameEn?: string;
    parentId?: string | null;
  };
};

export async function fetchAdminListings(params?: {
  status?: string;
}) {
  const { data } = await api.get<AdminListing[]>("/admin/listings", {
    params: params?.status ? { status: params.status } : { status: "ALL" },
  });
  return data;
}
