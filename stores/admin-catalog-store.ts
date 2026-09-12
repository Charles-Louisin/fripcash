import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  initialListingCatalog,
  type ListingCategory,
  type ListingSizeSchema,
  type ListingSubcategory,
} from "@/lib/listing-catalog";

type AdminCatalogState = {
  catalog: ListingCategory[];
  addCategory: (cat: Omit<ListingCategory, "subcategories"> & { subcategories?: ListingSubcategory[] }) => void;
  updateCategory: (id: string, patch: Partial<ListingCategory>) => void;
  removeCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
  addSubcategory: (categoryId: string, sub: ListingSubcategory) => void;
  updateSubcategory: (
    categoryId: string,
    subId: string,
    patch: Partial<ListingSubcategory>
  ) => void;
  removeSubcategory: (categoryId: string, subId: string) => void;
};

export const useAdminCatalogStore = create<AdminCatalogState>()(
  persist(
    (set) => ({
      catalog: initialListingCatalog,

      addCategory: (cat) =>
        set((s) => ({
          catalog: [
            ...s.catalog,
            {
              ...cat,
              subcategories: cat.subcategories ?? [],
            },
          ],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          catalog: s.catalog.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      removeCategory: (id) =>
        set((s) => ({
          catalog: s.catalog.filter((c) => c.id !== id),
        })),

      toggleCategory: (id) =>
        set((s) => ({
          catalog: s.catalog.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          ),
        })),

      addSubcategory: (categoryId, sub) =>
        set((s) => ({
          catalog: s.catalog.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: [...c.subcategories, sub] }
              : c
          ),
        })),

      updateSubcategory: (categoryId, subId, patch) =>
        set((s) => ({
          catalog: s.catalog.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((sub) =>
                    sub.id === subId ? { ...sub, ...patch } : sub
                  ),
                }
              : c
          ),
        })),

      removeSubcategory: (categoryId, subId) =>
        set((s) => ({
          catalog: s.catalog.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  subcategories: c.subcategories.filter((sub) => sub.id !== subId),
                }
              : c
          ),
        })),
    }),
    { name: "fripcash-admin-catalog-v1" }
  )
);

export type { ListingSizeSchema };
