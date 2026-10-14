"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, registerDevice, readToken } from "@/lib/api";
import { useMe } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

function isOrderNotification(n: {
  type?: string;
  category?: string;
  topic?: string;
}) {
  const type = String(n.type || n.category || n.topic || "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (!type) return false;
  return (
    type === "ORDER" ||
    type.startsWith("ORDER_") ||
    type.includes("DISPUTE") ||
    type.includes("COMMANDE") ||
    type.includes("LITIGE") ||
    type.includes("DELIVER") ||
    type.includes("COURIER") ||
    type.includes("ESCROW")
  );
}

export function PushNotifier() {
  const { data: me } = useMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const { data } = useQuery({
    queryKey: ["notifications", "push-poll"],
    queryFn: fetchNotifications,
    enabled: hasToken(),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!me?.id || typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
    const audience = me.isAdmin
      ? "ADMIN"
      : me.courier
        ? "COURIER"
        : "CONSUMER";
    registerDevice({
      token: `web:${me.id}`,
      platform: "web",
      audience,
    }).catch(() => undefined);
  }, [me]);

  useEffect(() => {
    const rows = Array.isArray(data) ? data : (data as any)?.items || [];
    if (!rows.length) return;
    if (!primed.current) {
      for (const n of rows) {
        const id = n.id || n._id;
        if (id) seen.current.add(String(id));
      }
      primed.current = true;
      return;
    }
    let touchedOrders = false;
    for (const n of rows) {
      const id = String(n.id || n._id || "");
      if (!id || seen.current.has(id) || n.read) continue;
      seen.current.add(id);
      if (!isOrderNotification(n)) continue;
      touchedOrders = true;
      const title = n.title || "Commande mise à jour";
      const body = n.body || "";
      toast(body ? `${title} — ${body}` : title, "info", 7000);
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, { body, tag: id });
        } catch {
          /* le toast in-app suffit */
        }
      }
    }
    if (touchedOrders) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["courier"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [data, queryClient, toast]);

  return null;
}
