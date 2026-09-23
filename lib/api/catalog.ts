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

export async function fetchBestSellers() {
  const { data } = await api.get("/catalog/best-sellers");
  return data;
}

export async function createCategory(body: {
  parentId?: string | null;
  nameFr: string;
  nameEn: string;
  slug: string;
  destination: ListingDestination;
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
