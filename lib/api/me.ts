"use client";

import { api } from "./client";

export type Me = {
  id: string;
  phone: string | null;
  email?: string | null;
  displayName: string;
  preferredLocale: "FR" | "EN";
  canBuy: boolean;
  seller: {
    /** Present when BE exposes it — used to list own annonces without sales. */
    profileId?: string;
    id?: string;
    kind: "particulier" | "boutique";
    shopKind: "standard" | "proximite" | "enseigne" | null;
    shopName?: string;
    shopDescription?: string;
    coverUrl?: string;
    likesCount?: number;
    verificationStatus: "none" | "pending" | "approved" | "rejected";
    listingDestination: string | null;
    allowedDestinations: string[];
    capabilities: {
      createListing: boolean;
      excelImport: boolean;
      productLibrary: boolean;
      sellerDashboard: boolean;
    };
  } | null;
  courier: { verificationStatus: string; isAvailable: boolean } | null;
  isAdmin: boolean;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  city?: string | null;
  bio?: string | null;
};

export async function fetchMe() {
  const { data } = await api.get<Me>("/me");
  return data;
}

export async function updateMe(body: {
  name?: string;
  preferredLocale?: "FR" | "EN";
  city?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  phone?: string;
}) {
  const { data } = await api.patch<Me>("/me", body);
  return data;
}
