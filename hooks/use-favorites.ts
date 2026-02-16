import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/lib/api";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await favoritesApi.getAll();
      return res.data;
    },
  });
}

export function useCheckFavorite(articleId: string) {
  return useQuery({
    queryKey: ["favorites", "check", articleId],
    queryFn: async () => {
      const res = await favoritesApi.check(articleId);
      return res.isFavorite;
    },
    enabled: !!articleId,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
