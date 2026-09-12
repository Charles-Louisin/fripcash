import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delay, mockReviews, type MockReview } from "@/lib/consumer-mock-data";

let reviews: MockReview[] = [...mockReviews];

export function useArticleReviews(articleId: string, page?: number) {
  return useQuery({
    queryKey: ["reviews", articleId, page],
    queryFn: async () => {
      const data = reviews.filter((r) => r.articleId === articleId);
      const avg =
        data.length === 0
          ? 0
          : data.reduce((s, r) => s + r.rating, 0) / data.length;
      return delay({
        data,
        total: data.length,
        page: page ?? 1,
        avgRating: Number(avg.toFixed(1)),
        ratingBreakdown: [
          { star: 5, count: 2 },
          { star: 4, count: 1 },
          { star: 3, count: 0 },
          { star: 2, count: 0 },
          { star: 1, count: 0 },
        ],
      });
    },
    enabled: !!articleId,
  });
}

export function useTopReviews() {
  return useQuery({
    queryKey: ["reviews", "top"],
    queryFn: () => delay(reviews.filter((r) => r.rating >= 4)),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePostReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      rating,
      comment,
    }: {
      articleId: string;
      rating: number;
      comment: string;
      images?: string[];
    }) => {
      const created: MockReview = {
        _id: `rev_${Date.now()}`,
        author: "aminata_v",
        rating,
        comment,
        articleId,
        createdAt: new Date().toISOString(),
      };
      reviews = [created, ...reviews];
      return delay({ success: true, data: created });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
