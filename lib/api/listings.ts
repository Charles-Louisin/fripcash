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
 * Prefer a full URL (Cloudinary, UploadThing). Fall back to /uploads or a media base.
 */
const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/i;

/** Origine absolue de l'API, seulement si elle est connue au build. Sinon chemin relatif (rewrite Next en dev). */
function mediaOrigin(): string {
  const media = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(/\/$/, "");
  if (/^https?:\/\//.test(media)) return media.replace(/\/uploads$/, "");
  const api = process.env.NEXT_PUBLIC_API_URL || "";
  if (/^https?:\/\//.test(api)) return api.replace(/\/api\/v1\/?$/, "");
  return "";
}

function uploadsUrl(pathname: string): string {
  const origin = mediaOrigin();
  return origin ? `${origin}${pathname}` : pathname;
}

export function listingImageUrl(
  mediaOrKey?:
    | {
        storageKey?: string | null;
        url?: string | null;
        secure_url?: string | null;
        ufsUrl?: string | null;
        publicId?: string | null;
        public_id?: string | null;
      }
    | string
    | null
): string | null {
  if (!mediaOrKey) return null;
  if (typeof mediaOrKey === "object") {
    const direct =
      mediaOrKey.url ||
      mediaOrKey.secure_url ||
      mediaOrKey.ufsUrl ||
      null;
    if (direct) return listingImageUrl(direct);
    return listingImageUrl(
      mediaOrKey.storageKey ||
        mediaOrKey.publicId ||
        mediaOrKey.public_id ||
        null
    );
  }
  const storageKey = mediaOrKey.trim();
  if (!storageKey) return null;
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    try {
      const parsed = new URL(storageKey);
      if (parsed.pathname.startsWith("/uploads/") && PRIVATE_HOST.test(parsed.hostname)) {
        return uploadsUrl(parsed.pathname);
      }
    } catch {
      return storageKey;
    }
    return storageKey;
  }
  if (storageKey.startsWith("//")) return `https:${storageKey}`;
  if (storageKey.startsWith("/uploads/")) return uploadsUrl(storageKey);
  if (
    storageKey.startsWith("utfs.io/") ||
    storageKey.startsWith("ufs.sh/") ||
    storageKey.includes(".ufs.sh/")
  ) {
    return `https://${storageKey.replace(/^\/+/, "")}`;
  }
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${storageKey.replace(/^\//, "")}`;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/\/$/, "");
  if (cloud && !storageKey.includes(" ")) {
    return `https://res.cloudinary.com/${cloud}/image/upload/${storageKey.replace(/^\//, "")}`;
  }
  return storageKey.startsWith("/") ? storageKey : null;
}

export function imagesFromListing(listing: {
  media?: Array<{
    storageKey?: string | null;
    url?: string | null;
    sortOrder?: number;
  }> | null;
  images?: unknown;
  coverUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
} | null | undefined): string[] {
  if (!listing) return [];
  const fromMedia = (listing.media || [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => listingImageUrl(item))
    .filter((url): url is string => !!url);
  if (fromMedia.length) return fromMedia;

  const loose = Array.isArray(listing.images) ? listing.images : [];
  const fromImages = loose
    .map((item) =>
      listingImageUrl(
        typeof item === "string" ? item : (item as { url?: string | null })
      )
    )
    .filter((url): url is string => !!url);
  if (fromImages.length) return fromImages;

  const single = listingImageUrl(
    listing.coverUrl || listing.image || listing.imageUrl || listing.thumbnail || null
  );
  return single ? [single] : [];
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
