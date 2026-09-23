import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchListingReviews,
  fetchSellerReviews,
  createOrderReview,
  createListingComment,
  fetchListingComments,
} from "@/lib/api";

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

function normalizeReview(r: any, articleId?: string) {
  return {
    _id: r.id || r._id,
    author: r.authorName || r.author?.pseudo || r.author?.name || "utilisateur",
    rating: r.rating ?? 0,
    comment: r.comment || r.body || "",
    articleId: articleId || r.listingId || r.articleId,
    createdAt: r.createdAt,
    ...r,
  };
}

export function useArticleReviews(articleId: string, page?: number) {
  return useQuery({
    queryKey: ["reviews", articleId, page],
    queryFn: async () => {
      const data = asArray(await fetchListingReviews(articleId)).map((r) =>
        normalizeReview(r, articleId)
      );
      const avg =
        data.length === 0
          ? 0
          : data.reduce((s, r) => s + r.rating, 0) / data.length;
      const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: data.filter((r) => r.rating === star).length,
      }));
      return {
        data,
        total: data.length,
        page: page ?? 1,
        avgRating: Number(avg.toFixed(1)),
        ratingBreakdown: breakdown,
      };
    },
    enabled: !!articleId,
  });
}

export function useTopReviews() {
  return useQuery({
    queryKey: ["reviews", "top"],
    queryFn: async () => {
      // No global top-reviews endpoint — empty until homepage uses listing-specific rails
      return [] as ReturnType<typeof normalizeReview>[];
    },
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
      orderId,
    }: {
      articleId: string;
      rating: number;
      comment: string;
      images?: string[];
      orderId?: string;
    }) => {
      if (!orderId) {
        throw new Error(
          "Une commande est requise pour laisser un avis (POST /v1/orders/:id/reviews)."
        );
      }
      return createOrderReview(orderId, {
        rating,
        comment,
        listingId: articleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useListingReviews(listingId: string) {
  return useArticleReviews(listingId);
}

export function useSellerReviews(sellerProfileId: string) {
  return useQuery({
    queryKey: ["reviews", "seller", sellerProfileId],
    queryFn: async () =>
      asArray(await fetchSellerReviews(sellerProfileId)).map((r) =>
        normalizeReview(r)
      ),
    enabled: !!sellerProfileId,
  });
}

export function useCreateReview() {
  return usePostReview();
}

export function useReviews(targetId?: string) {
  return useArticleReviews(targetId || "");
}

export function useListingComments(listingId: string) {
  return useQuery({
    queryKey: ["comments", listingId],
    queryFn: async () => asArray(await fetchListingComments(listingId)),
    enabled: !!listingId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      listingId: string;
      body: string;
      parentId?: string;
    }) =>
      createListingComment(body.listingId, {
        body: body.body,
        parentId: body.parentId,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", vars.listingId],
      });
    },
  });
}
