import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api";
import { initialListingCatalog } from "@/lib/listing-catalog";

function mapApiCategories(rows: Awaited<ReturnType<typeof fetchCategories>>) {
  const active = rows.filter((c) => c.isActive !== false);
  const byParent = (parentId: string | null) =>
    active
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return byParent(null).map((c) => ({
    _id: c.id,
    name: c.nameFr || c.nameEn || c.slug || c.id,
    slug: c.slug || c.id,
    image: c.imageUrl || (undefined as string | undefined),
    enabled: c.isActive !== false,
    subGroups: byParent(c.id).map((child) => ({
      name: child.nameFr || child.nameEn || child.slug,
      items: [] as { name: string }[],
    })),
    destination: c.destination,
  }));
}

/** Public browse categories — Nest catalog. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const rows = await fetchCategories();
      return mapApiCategories(rows);
    },
    staleTime: 30 * 60 * 1000,
  });
}

/** Admin listing catalog — local Flutter-aligned seed until admin CRUD UI uses catalog API. */
export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      try {
        const rows = await fetchCategories();
        if (rows.length > 0) {
          return mapApiCategories(rows).map((c) => ({
            ...c,
            articlesCount: 0,
          }));
        }
      } catch {
        /* fall through */
      }
      return initialListingCatalog.map((c) => ({
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
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
