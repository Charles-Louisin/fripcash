import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  delay,
  filterMockArticles,
  mockArticles,
  type MockConsumerArticle,
} from "@/lib/consumer-mock-data";

export type ArticleFilters = {
  category?: string;
  subCategory?: string;
  itemType?: string;
  condition?: string;
  size?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

let localArticles: MockConsumerArticle[] = [...mockArticles];

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () => delay(filterMockArticles({ ...filters, status: filters.status ?? "active" })),
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["articles", id],
    queryFn: async () => {
      const article =
        localArticles.find((a) => a._id === id) ??
        mockArticles.find((a) => a._id === id);
      if (!article) throw new Error("Article introuvable");
      return delay(article);
    },
    enabled: !!id,
  });
}

export function useArticlesByUser(userId: string) {
  return useQuery({
    queryKey: ["articles", "user", userId],
    queryFn: () =>
      delay(localArticles.filter((a) => a.seller._id === userId)),
    enabled: !!userId,
  });
}

export function useMyArticles(status?: string) {
  return useQuery({
    queryKey: ["my-articles", status],
    queryFn: async () => {
      let list = localArticles.filter((a) => a.seller.pseudo === "aminata_v");
      if (status) list = list.filter((a) => a.status === status);
      return delay(list);
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<MockConsumerArticle>) => {
      const created: MockConsumerArticle = {
        _id: `art_${Date.now()}`,
        title: body.title || "Nouvel article",
        brand: body.brand,
        description: body.description || "",
        images: body.images || [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop",
        ],
        category: body.category || "Femme",
        categoryId: body.categoryId || "mode",
        subCategory: body.subCategory,
        price: body.price || 0,
        shippingCost: body.shippingCost ?? 5000,
        condition: body.condition || "Bon état",
        size: body.size,
        stock: body.stock ?? 1,
        status: "pending",
        seller: {
          _id: "u_demo",
          pseudo: "aminata_v",
          rating: 4.9,
          reviewCount: 33,
        },
        favoritesCount: 0,
        listingDestination: body.listingDestination || "secondeMain",
        createdAt: new Date().toISOString(),
      };
      localArticles = [created, ...localArticles];
      return delay({ success: true, data: created });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; [key: string]: any }) => {
      localArticles = localArticles.map((a) =>
        a._id === id ? { ...a, ...body } : a
      );
      return delay({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      localArticles = localArticles.filter((a) => a._id !== id);
      return delay({ success: true });
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["my-articles"] });
      const prev = queryClient.getQueriesData({ queryKey: ["my-articles"] });
      queryClient.setQueriesData(
        { queryKey: ["my-articles"] },
        (old: any) =>
          Array.isArray(old) ? old.filter((a: any) => a._id !== deletedId) : old
      );
      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}
