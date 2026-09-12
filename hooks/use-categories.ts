import { useQuery } from "@tanstack/react-query";
import { delay, mockBrowseCategories } from "@/lib/consumer-mock-data";
import { initialListingCatalog } from "@/lib/listing-catalog";

/** Public browse categories for header / home. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => delay(mockBrowseCategories.filter((c) => c.enabled)),
    staleTime: 30 * 60 * 1000,
  });
}

/** Admin listing catalog (Flutter-aligned) — local store seed, no API. */
export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: () =>
      delay(
        initialListingCatalog.map((c) => ({
          _id: c.id,
          name: c.label,
          slug: c.id,
          enabled: c.enabled,
          articlesCount: 0,
          subGroups: c.subcategories.map((s) => ({
            name: s.label,
            items: [],
            articlesCount: 0,
            id: s.id,
            sizeSchema: s.sizeSchema,
          })),
        }))
      ),
    staleTime: 5 * 60 * 1000,
  });
}
