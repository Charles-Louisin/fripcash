import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi, type ArticleFilters } from "@/lib/api";

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: async () => {
      const res = await articlesApi.getAll(filters);
      return res;
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["articles", id],
    queryFn: async () => {
      const res = await articlesApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useArticlesByUser(userId: string) {
  return useQuery({
    queryKey: ["articles", "user", userId],
    queryFn: async () => {
      const res = await articlesApi.getByUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useMyArticles(status?: string) {
  return useQuery({
    queryKey: ["my-articles", status],
    queryFn: async () => {
      const res = await articlesApi.getMy(status);
      return res.data;
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => articlesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [key: string]: any }) =>
      articlesApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["my-articles"] });
      const prev = queryClient.getQueriesData({ queryKey: ["my-articles"] });
      queryClient.setQueriesData(
        { queryKey: ["my-articles"] },
        (old: unknown) => {
          if (!old || !Array.isArray(old)) return old;
          return old.filter((a: { _id?: string }) => a._id !== deletedId);
        }
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        context.prev.forEach(([key, data]) =>
          queryClient.setQueryData(key as string[], data)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}
