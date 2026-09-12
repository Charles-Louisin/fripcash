import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delay } from "@/lib/consumer-mock-data";

type MockOffer = {
  _id: string;
  articleId: string;
  amount: number;
  message?: string;
  status: "pending" | "accepted" | "refused";
  createdAt: string;
};

let offers: MockOffer[] = [];

export function useMyOffers(type?: "sent" | "received") {
  return useQuery({
    queryKey: ["offers", "me", type],
    queryFn: () => delay(offers),
  });
}

export function useArticleOffers(articleId: string) {
  return useQuery({
    queryKey: ["offers", "article", articleId],
    queryFn: () => delay(offers.filter((o) => o.articleId === articleId)),
    enabled: !!articleId,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      articleId: string;
      amount: number;
      message?: string;
    }) => {
      const created: MockOffer = {
        _id: `off_${Date.now()}`,
        articleId: body.articleId,
        amount: body.amount,
        message: body.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      offers = [created, ...offers];
      return delay({ success: true, data: created });
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
      offers = offers.map((o) =>
        o._id === id
          ? {
              ...o,
              status:
                action === "accept"
                  ? "accepted"
                  : action === "reject"
                    ? "refused"
                    : o.status,
            }
          : o
      );
      return delay({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useCancelOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      offers = offers.filter((o) => o._id !== id);
      return delay({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
