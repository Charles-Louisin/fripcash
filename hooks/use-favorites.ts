import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  delay,
  getFavoriteIds,
  mockArticles,
  toggleFavoriteId,
} from "@/lib/consumer-mock-data";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const ids = getFavoriteIds();
      const data = mockArticles
        .filter((a) => ids.has(a._id))
        .map((a) => ({ _id: a._id, article: a }));
      return delay(data);
    },
    enabled: hasToken(),
  });
}

export function useCheckFavorite(articleId: string) {
  return useQuery({
    queryKey: ["favorites", "check", articleId],
    queryFn: () => delay(getFavoriteIds().has(articleId)),
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
      const nowFavorite = toggleFavoriteId(articleId);
      return delay({ success: true, isFavorite: nowFavorite, was: isFavorite });
    },
    onMutate: async ({ articleId, isFavorite }) => {
      if (!isFavorite) return {};
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const prev = queryClient.getQueryData(["favorites"]);
      queryClient.setQueryData(["favorites"], (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((f: any) => (f.article?._id || f._id) !== articleId);
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["favorites"], context.prev);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorites", "check", variables.articleId],
      });
    },
  });
}
