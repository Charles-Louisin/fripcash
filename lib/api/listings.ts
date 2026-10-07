"use client";

import { api } from "./client";
import type { ListingDestination } from "./catalog";

export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SOLD"
  | "SOLD_OUT"
  | "REJECTED"
  | "FLAGGED"
  | "ARCHIVED";

export type ListingMedia = {
  id: string;
  listingId: string;
  /** Cloudinary public_id (or legacy MinIO object key). */
  storageKey: string;
  /** Prefer this for display — Cloudinary secure_url when set. */
  url?: string | null;
  mimeType: string;
  sortOrder: number;
};

export type Listing = {
  id: string;
  sellerProfileId: string;
  categoryId: string | null;
  zoneId: string | null;
  title: string;
  description: string | null;
  /** What the seller receives (net). */
  netPriceGnf: number;
  /** Buyer display / pay price (= net + commission). */
  priceGnf: number;
  /** Snapshotted rate 0..1 at create / price update. */
  commissionRate: number;
  commissionAmountGnf: number;
  quantity: number;
  negotiable: boolean;
  discountEnabled: boolean;
  compareAtPriceGnf: number | null;
  status: ListingStatus;
  destination: ListingDestination;
  conditionNote: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  media?: ListingMedia[];
  sellerProfile?: {
    id: string;
    userId: string;
    displayName?: string | null;
    shopName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    rating?: number;
    reviewsCount?: number;
    sellerKind?: string | null;
    shopKind?: string | null;
  } | null;
  listingRating?: number;
  listingReviewsCount?: number;
};

/**
 * Display URL for a listing photo.
 * Prefer `media.url` (Cloudinary). Fall back to MinIO base + storageKey.
 */
export function listingImageUrl(
  mediaOrKey?:
    | { storageKey?: string | null; url?: string | null }
    | string
    | null
): string | null {
  if (!mediaOrKey) return null;
  if (typeof mediaOrKey === "object") {
    if (mediaOrKey.url) return listingImageUrl(mediaOrKey.url);
    return listingImageUrl(mediaOrKey.storageKey ?? null);
  }
  const storageKey = mediaOrKey;
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    return storageKey;
  }
  if (storageKey.startsWith("/uploads/")) {
    if (typeof window !== "undefined") return storageKey;
    const api = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api/v1").replace(
      /\/api\/v1\/?$/,
      ""
    );
    return `${api}${storageKey}`;
  }
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "");
  if (!base) return storageKey.startsWith("/") ? storageKey : null;
  return `${base}/${storageKey.replace(/^\//, "")}`;
}

export async function attachListingMedia(
  listingId: string,
  body: {
    publicId: string;
    url: string;
    mimeType?: string;
    sortOrder?: number;
  }
) {
  const { data } = await api.post<ListingMedia>(
    `/listings/${listingId}/media`,
    {
      publicId: body.publicId,
      url: body.url,
      mimeType: body.mimeType || "image/jpeg",
      sortOrder: body.sortOrder ?? 0,
    }
  );
  return data;
}

export async function replaceListingMedia(
  listingId: string,
  mediaId: string,
  body: {
    publicId?: string;
    url?: string;
    mimeType?: string;
    sortOrder?: number;
  }
) {
  const { data } = await api.patch<ListingMedia>(
    `/listings/${listingId}/media/${mediaId}`,
    {
      publicId: body.publicId,
      url: body.url,
      mimeType: body.mimeType,
      sortOrder: body.sortOrder,
    }
  );
  return data;
}

export async function deleteListingMedia(listingId: string, mediaId: string) {
  const { data } = await api.delete(`/listings/${listingId}/media/${mediaId}`);
  return data;
}

export async function fetchListings(params?: {
  destination?: string;
  categoryId?: string;
  q?: string;
  shopKind?: string;
  sellerKind?: string;
  minListingRating?: number;
  minSellerRating?: number;
  createdWithinDays?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { data } = await api.get<Listing[]>("/listings", { params });
  return data;
}

export async function fetchListing(id: string) {
  const { data } = await api.get<Listing>(`/listings/${id}`);
  return data;
}

export async function createListing(body: {
  title: string;
  description?: string;
  /** Preferred: seller net. Response `priceGnf` is buyer display. */
  netPriceGnf: number;
  quantity: number;
  destination: ListingDestination;
  categoryId?: string;
  zoneId?: string;
  conditionNote?: string;
  negotiable?: boolean;
  discountEnabled?: boolean;
  compareAtPriceGnf?: number | null;
}) {
  const { data } = await api.post<Listing>("/listings", body);
  return data;
}

export async function updateListing(
  id: string,
  body: Partial<{
    title: string;
    description: string;
    netPriceGnf: number;
    quantity: number;
    destination: ListingDestination;
    categoryId: string;
    zoneId: string;
    conditionNote: string;
    status: ListingStatus;
    negotiable: boolean;
    discountEnabled: boolean;
    compareAtPriceGnf: number | null;
  }>
) {
  const { data } = await api.patch<Listing>(`/listings/${id}`, body);
  return data;
}

export async function deleteListing(id: string) {
  const { data } = await api.delete(`/listings/${id}`);
  return data;
}

export async function fetchListingComments(listingId: string) {
  const { data } = await api.get(`/listings/${listingId}/comments`);
  return data;
}

export async function createListingComment(
  listingId: string,
  body: { body: string; parentId?: string }
) {
  const { data } = await api.post(`/listings/${listingId}/comments`, body);
  return data;
}

export async function fetchListingReviews(listingId: string) {
  const { data } = await api.get(`/listings/${listingId}/reviews`);
  return data;
}

export async function fetchSellerReviews(sellerProfileId: string) {
  const { data } = await api.get(`/sellers/${sellerProfileId}/reviews`);
  return data;
}

export async function createOrderReview(
  orderId: string,
  body: { rating: number; comment?: string; listingId: string }
) {
  const { data } = await api.post(`/orders/${orderId}/reviews`, body);
  return data;
}
