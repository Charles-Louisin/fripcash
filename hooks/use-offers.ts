import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "@/lib/api";

export function useMyOffers(type?: "sent" | "received") {
  return useQuery({
    queryKey: ["offers", "me", type],
    queryFn: async () => {
      const res = await offersApi.getMine(type);
      return res.data;
    },
  });
}

export function useArticleOffers(articleId: string) {
  return useQuery({
    queryKey: ["offers", "article", articleId],
    queryFn: async () => {
      const res = await offersApi.getForArticle(articleId);
      return res.data;
    },
    enabled: !!articleId,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { articleId: string; amount: number; message?: string }) =>
      offersApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      counterAmount,
    }: {
      id: string;
      action: "accept" | "reject" | "counter";
      counterAmount?: number;
    }) => offersApi.respond(id, { action, counterAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useCancelOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
