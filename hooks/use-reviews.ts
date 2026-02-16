import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api";

export function useArticleReviews(articleId: string, page?: number) {
  return useQuery({
    queryKey: ["reviews", articleId, page],
    queryFn: async () => {
      const res = await reviewsApi.getForArticle(articleId, page);
      return res;
    },
    enabled: !!articleId,
  });
}

export function useTopReviews() {
  return useQuery({
    queryKey: ["reviews", "top"],
    queryFn: async () => {
      const res = await reviewsApi.getTop();
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function usePostReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      articleId,
      ...body
    }: {
      articleId: string;
      rating: number;
      comment: string;
      images?: string[];
    }) => reviewsApi.post(articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
