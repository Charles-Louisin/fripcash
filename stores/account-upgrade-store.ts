"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopKind, UserRole } from "@/lib/seller-domain";
import type { VerificationStatus } from "@/lib/account-capabilities";
import { webUpgradeToParticulier } from "@/lib/account-capabilities";

type AccountUpgradeState = {
  role: UserRole | "acheteur";
  shopKind: ShopKind | null;
  verificationStatus: VerificationStatus;
  /** Stable user id — never rewritten on upgrade. */
  userId: string;
  becomeParticulier: () => void;
  resetDemo: () => void;
};

const defaults = {
  role: "acheteur" as const,
  shopKind: null,
  verificationStatus: "none" as const,
  userId: "u_demo",
};

export const useAccountUpgradeStore = create<AccountUpgradeState>()(
  persist(
    (set) => ({
      ...defaults,
      becomeParticulier: () => {
        const next = webUpgradeToParticulier();
        set({
          role: next.role,
          shopKind: null,
          verificationStatus: "approved",
        });
      },
      resetDemo: () => set({ ...defaults }),
    }),
    { name: "fripcash-account-upgrade" }
  )
);
