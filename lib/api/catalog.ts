"use client";

import { api } from "./client";

export type ListingDestination =
  | "SECONDE_MAIN"
  | "ARTICLES_NEUFS"
  | "QUARTIER_BOUTIQUES"
  | "ENSEIGNES";

export type CatalogCategory = {
  id: string;
  parentId: string | null;
  nameFr: string;
  nameEn: string;
  slug: string;
  destination: ListingDestination;
  sortOrder: number;
  isActive: boolean;
  /** Cloudinary secure_url when set (incl. seed). */
  imageUrl?: string | null;
  /** Cloudinary public_id when set. */
  imagePublicId?: string | null;
};

export type CatalogZone = {
  id: string;
  code: string;
  nameFr: string;
  nameEn: string;
  isActive: boolean;
};

export async function fetchCategories() {
  const { data } = await api.get<CatalogCategory[]>("/catalog/categories");
  return data;
}

export async function fetchZones() {
  const { data } = await api.get<CatalogZone[]>("/catalog/zones");
  return data;
}

export type CatalogTariff = {
  id: string;
  fromZoneId: string;
  toZoneId: string;
  amountGnf: number;
};

export async function fetchTariffs() {
  const { data } = await api.get<CatalogTariff[]>("/catalog/tariffs");
  return data;
}

export type PublicShop = {
  id: string;
  shopName: string;
  sellerKind?: "particulier" | "boutique" | null;
  shopKind: string | null;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  likesCount?: number;
  createdAt?: string;
  likedByMe?: boolean;
  listings?: unknown[];
};

export async function fetchShops(params?: {
  shopKind?: "particulier" | "standard" | "proximite" | "enseigne";
  createdWithinDays?: number;
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
  q?: string;
  limit?: number;
}) {
  const { data } = await api.get<PublicShop[]>("/catalog/shops", { params });
  return data;
}

export async function fetchPublicSettings() {
  const { data } = await api.get<{
    platformName: string;
    contactEmail: string;
    contactPhone: string;
    maintenanceMode: boolean;
  }>("/catalog/public-settings");
  return data;
}

export async function fetchPublicStats() {
  const { data } = await api.get("/catalog/public-stats");
  return data as {
    totalUsers: number;
    totalSold: number;
    avgRating: number;
    totalArticles: number;
    users: number;
    articles: number;
    orders: number;
    rating: number;
  };
}

export async function createCategory(body: {
  parentId?: string | null;
  nameFr: string;
  nameEn?: string;
  slug?: string;
  destination?: ListingDestination | null;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string | null;
  imagePublicId?: string | null;
}) {
  const { data } = await api.post<CatalogCategory>(
    "/catalog/categories",
    body
  );
  return data;
}

export async function updateCategory(
  id: string,
  body: Partial<{
    parentId: string | null;
    nameFr: string;
    nameEn: string;
    slug: string;
    destination: ListingDestination;
    sortOrder: number;
    isActive: boolean;
    imageUrl: string | null;
    imagePublicId: string | null;
  }>
) {
  const { data } = await api.patch<CatalogCategory>(
    `/catalog/categories/${id}`,
    body
  );
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/catalog/categories/${id}`);
  return data;
}

export async function createZone(body: {
  code: string;
  nameFr: string;
  nameEn: string;
  isActive?: boolean;
}) {
  const { data } = await api.post("/catalog/zones", body);
  return data;
}

export async function updateZone(
  id: string,
  body: Partial<{
    code: string;
    nameFr: string;
    nameEn: string;
    isActive: boolean;
  }>
) {
  const { data } = await api.patch(`/catalog/zones/${id}`, body);
  return data;
}

export async function deleteZone(id: string) {
  const { data } = await api.delete(`/catalog/zones/${id}`);
  return data;
}
