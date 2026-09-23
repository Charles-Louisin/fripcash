import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  readToken,
  listingImageUrl,
} from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

function normalizeFavorites(raw: unknown): Array<{ _id: string; article: any }> {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown })?.items)
      ? (raw as { items: unknown[] }).items
      : [];

  return rows.map((item: any) => {
    const listing = item.listing || item.article || item;
    const id = listing.id || listing._id || item.listingId || item.id;
    const media = listing.media?.[0];
    const img = listingImageUrl(media ?? listing.media?.[0]?.storageKey);
    return {
      _id: id,
      article: {
        _id: id,
        title: listing.title || "Article",
        images: img ? [img] : [],
        price: listing.priceGnf ?? listing.price ?? 0,
        condition: listing.conditionNote || listing.condition || "",
        createdAt: listing.createdAt || item.createdAt,
        ...listing,
      },
    };
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => normalizeFavorites(await fetchFavorites()),
    enabled: hasToken(),
  });
}

export function useCheckFavorite(articleId: string) {
  const { data: favorites } = useFavorites();
  return useQuery({
    queryKey: ["favorites", "check", articleId],
    queryFn: async () => {
      const list = favorites ?? normalizeFavorites(await fetchFavorites());
      return list.some((f) => f._id === articleId || f.article?._id === articleId);
    },
    enabled: !!articleId && hasToken(),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      isFavorite,
    }: {
      articleId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        await removeFavorite(articleId);
        return { success: true, isFavorite: false };
      }
      await addFavorite(articleId);
      return { success: true, isFavorite: true };
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorites", "check", variables.articleId],
      });
    },
  });
}
