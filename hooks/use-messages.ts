import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  delay,
  mockConversations,
  mockMessages,
  type MockConversation,
  type MockMessage,
} from "@/lib/consumer-mock-data";

let conversations: MockConversation[] = [...mockConversations];
let messages: MockMessage[] = [...mockMessages];

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => delay(conversations),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      delay(messages.filter((m) => m.conversationId === conversationId)),
    enabled: !!conversationId,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { articleId: string; message?: string }) => {
      const id = `conv_${Date.now()}`;
      const created: MockConversation = {
        _id: id,
        participant: { pseudo: "vendeur" },
        lastMessage: body.message || "Nouvelle conversation",
        updatedAt: new Date().toISOString(),
        unread: 0,
      };
      conversations = [created, ...conversations];
      if (body.message) {
        messages = [
          {
            _id: `msg_${Date.now()}`,
            conversationId: id,
            senderId: "u_demo",
            text: body.message,
            createdAt: new Date().toISOString(),
          },
          ...messages,
        ];
      }
      return delay({ success: true, data: created });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
    }: {
      conversationId: string;
      text: string;
    }) => {
      const msg: MockMessage = {
        _id: `msg_${Date.now()}`,
        conversationId,
        senderId: "u_demo",
        text,
        createdAt: new Date().toISOString(),
      };
      messages = [...messages, msg];
      conversations = conversations.map((c) =>
        c._id === conversationId
          ? { ...c, lastMessage: text, updatedAt: msg.createdAt }
          : c
      );
      return delay({ success: true, data: msg });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
