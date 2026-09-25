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
    const mediaList = Array.isArray(listing.media) ? listing.media : [];
    const sorted = mediaList
      .slice()
      .sort(
        (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
    const media =
      sorted.find((m: any) => m?.url) ||
      sorted.find(
        (m: any) => m?.storageKey && !String(m.storageKey).startsWith("seed/")
      ) ||
      sorted[0];
    const img = listingImageUrl(media ?? null);
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
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

/** Favorites badge count from GET /favorites (DB). */
export function useFavoritesCount() {
  const { data: favorites = [] } = useFavorites();
  return favorites.length;
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
    onMutate: async ({ articleId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const prev = queryClient.getQueryData<any[]>(["favorites"]);
      if (Array.isArray(prev)) {
        if (isFavorite) {
          queryClient.setQueryData(
            ["favorites"],
            prev.filter(
              (f) => f._id !== articleId && f.article?._id !== articleId
            )
          );
        } else if (!prev.some((f) => f._id === articleId || f.article?._id === articleId)) {
          queryClient.setQueryData(["favorites"], [
            ...prev,
            { _id: articleId, article: { _id: articleId } },
          ]);
        }
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["favorites"], ctx.prev);
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorites", "check", variables.articleId],
      });
    },
  });
}
