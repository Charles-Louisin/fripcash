import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyOffers,
  fetchListingOffers,
  createOffer,
  acceptOffer,
  refuseOffer,
  readToken,
} from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

function normalizeOffer(o: any) {
  return {
    _id: o.id || o._id,
    id: o.id || o._id,
    articleId: o.listingId || o.articleId,
    amount: o.amountGnf ?? o.amount ?? 0,
    message: o.message,
    status: (o.status || "pending").toLowerCase(),
    createdAt: o.createdAt,
    ...o,
  };
}

export function useMyOffers(_type?: "sent" | "received") {
  return useQuery({
    queryKey: ["offers", "me", _type],
    queryFn: async () => asArray(await fetchMyOffers()).map(normalizeOffer),
    enabled: hasToken(),
  });
}

export function useArticleOffers(articleId: string) {
  return useQuery({
    queryKey: ["offers", "article", articleId],
    queryFn: async () =>
      asArray(await fetchListingOffers(articleId)).map(normalizeOffer),
    enabled: !!articleId && hasToken(),
  });
}

export function useListingOffers(listingId: string) {
  return useArticleOffers(listingId);
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      articleId?: string;
      listingId?: string;
      amount?: number;
      amountGnf?: number;
      message?: string;
    }) => {
      const listingId = body.listingId || body.articleId;
      if (!listingId) throw new Error("listingId required");
      const amountGnf = Math.round(body.amountGnf ?? body.amount ?? 0);
      const created = await createOffer(listingId, {
        amountGnf,
        message: body.message,
      });
      return { success: true, data: normalizeOffer(created) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "accept" | "reject" | "counter";
      counterAmount?: number;
    }) => {
      if (action === "accept") return acceptOffer(id);
      if (action === "reject") return refuseOffer(id);
      throw new Error("Counter-offers are not supported by the API");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useRefuseOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => refuseOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useOffers() {
  return useMyOffers();
}
