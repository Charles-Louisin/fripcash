import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await favoritesApi.getAll();
      return res.data;
    },
    enabled: hasToken(),
  });
}

export function useCheckFavorite(articleId: string) {
  return useQuery({
    queryKey: ["favorites", "check", articleId],
    queryFn: async () => {
      const res = await favoritesApi.check(articleId);
      return res.isFavorite;
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
        return favoritesApi.remove(articleId);
      } else {
        return favoritesApi.add(articleId);
      }
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
    onError: (_err, _vars, context: { prev?: unknown }) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["favorites"], context.prev);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["articles", variables.articleId] });
    },
  });
}
