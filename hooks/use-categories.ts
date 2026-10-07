import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api";
import { initialListingCatalog } from "@/lib/listing-catalog";

function pickImage(c: {
  imageUrl?: string | null;
  image?: string | null;
}): string | undefined {
  const url = c.imageUrl || c.image || null;
  return url || undefined;
}

function mapApiCategories(rows: Awaited<ReturnType<typeof fetchCategories>>) {
  const list = Array.isArray(rows) ? rows : [];
  const active = list.filter((c) => c.isActive !== false);
  const byParent = (parentId: string | null) =>
    active
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return byParent(null).map((c) => ({
    _id: c.id,
    name: c.nameFr || c.nameEn || c.slug || c.id,
    slug: c.slug || c.id,
    image: pickImage(c),
    enabled: c.isActive !== false,
    subGroups: byParent(c.id).map((child) => ({
      name: child.nameFr || child.nameEn || child.slug,
      slug: child.slug,
      image: pickImage(child),
      imageUrl: pickImage(child),
      // Catalog is 2 levels today — no third-level item types from API
      items: [] as { name: string }[],
    })),
    destination: c.destination,
  }));
}

/** Public browse categories — Nest catalog. */
export function useCategories() {
  return useQuery({
    // Bump when category shape changes so stale client cache cannot hide imageUrl
    queryKey: ["categories", "with-sub-images"],
    queryFn: async () => {
      const rows = await fetchCategories();
      return mapApiCategories(Array.isArray(rows) ? rows : []);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });
}

/** Admin listing catalog — local Flutter-aligned seed until admin CRUD UI uses catalog API. */
export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all", "with-sub-images"],
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
