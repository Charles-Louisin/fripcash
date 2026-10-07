"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  fetchMessages,
  sendMessage,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FiMessageCircle, FiSend } from "react-icons/fi";

export function OrderChat({
  orderId,
  peerId,
  peerName,
}: {
  orderId: string;
  peerId?: string | null;
  peerName?: string | null;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [convId, setConvId] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: async () => {
      if (!peerId) throw new Error("Destinataire manquant");
      const conv = await createConversation({
        orderId,
        participantIds: [peerId],
      });
      return conv.id as string;
    },
    onSuccess: (id) => {
      setConvId(id);
      setOpen(true);
    },
  });

  const messages = useQuery({
    queryKey: ["order-chat", convId],
    queryFn: () => fetchMessages(convId!),
    enabled: !!convId && open,
    refetchInterval: open ? 4000 : false,
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!convId || !text.trim()) return;
      await sendMessage(convId, text.trim());
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["order-chat", convId] });
    },
  });

  if (!peerId) return null;

  const rows = Array.isArray(messages.data) ? messages.data : [];

  return (
    <div className="space-y-2">
      {!open ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 rounded-lg text-sm gap-2"
          onClick={() => (convId ? setOpen(true) : start.mutate())}
          disabled={start.isPending}
        >
          <FiMessageCircle className="h-4 w-4" />
          Discuter avec {peerName || "le livreur"}
        </Button>
      ) : (
        <div className="rounded-xl border border-border p-3 space-y-2">
          <p className="text-xs font-semibold">Chat · {peerName || "Livreur"}</p>
          <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
            {rows.length === 0 ? (
              <p className="text-muted-foreground">Aucun message</p>
            ) : (
              rows.map((m: any) => (
                <p key={m.id}>
                  <span className="font-medium">{m.body}</span>
                </p>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-input px-2 text-sm"
              placeholder="Écrire…"
              onKeyDown={(e) => {
                if (e.key === "Enter") send.mutate();
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => send.mutate()}
              disabled={send.isPending || !text.trim()}
            >
              <FiSend className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
