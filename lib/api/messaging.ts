"use client";

import { api } from "./client";

export async function fetchConversations() {
  const { data } = await api.get("/conversations");
  return data;
}

export async function createConversation(body: {
  listingId?: string;
  orderId?: string;
  participantIds?: string[];
}) {
  const { data } = await api.post("/conversations", body);
  return data;
}

export async function fetchMessages(conversationId: string) {
  const { data } = await api.get(
    `/conversations/${conversationId}/messages`
  );
  return data;
}

export async function sendMessage(conversationId: string, body: string) {
  const { data } = await api.post(
    `/conversations/${conversationId}/messages`,
    { body }
  );
  return data;
}
