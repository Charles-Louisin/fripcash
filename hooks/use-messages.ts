import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
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

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () =>
      asArray(await fetchConversations()).map((c: any) => ({
        _id: c.id || c._id,
        id: c.id || c._id,
        participant: c.participant || c.participants?.[0] || { pseudo: "…" },
        lastMessage: c.lastMessage?.body || c.lastMessage || "",
        updatedAt: c.updatedAt,
        unread: c.unreadCount ?? c.unread ?? 0,
        listingId: c.listingId,
        orderId: c.orderId,
        ...c,
      })),
    enabled: hasToken(),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () =>
      asArray(await fetchMessages(conversationId)).map((m: any) => ({
        _id: m.id || m._id,
        conversationId,
        senderId: m.senderId || m.sender?.id,
        text: m.body || m.text || m.content,
        createdAt: m.createdAt,
        ...m,
      })),
    enabled: !!conversationId && hasToken(),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { articleId: string; message?: string }) => {
      const conv: any = await createConversation({ listingId: body.articleId });
      const id = conv.id || conv._id;
      if (body.message && id) {
        await sendMessage(id, body.message);
      }
      return { success: true, data: { _id: id, ...conv } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  return useStartConversation();
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
      body,
    }: {
      conversationId: string;
      text?: string;
      body?: string;
    }) => sendMessage(conversationId, body || text || ""),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", vars.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
