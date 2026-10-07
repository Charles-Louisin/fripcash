"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications, registerDevice, readToken } from "@/lib/api";
import { useMe } from "@/hooks/use-auth";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

export function PushNotifier() {
  const { data: me } = useMe();
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
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
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
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    for (const n of rows) {
      const id = String(n.id || n._id || "");
      if (!id || seen.current.has(id) || n.read) continue;
      seen.current.add(id);
      const type = String(n.type || "");
      if (type !== "order" && type !== "ORDER_UPDATE" && type !== "dispute") continue;
      try {
        new Notification(n.title || "Commande mise à jour", {
          body: n.body || "",
          tag: id,
        });
      } catch {
        /* ignore */
      }
    }
  }, [data]);

  return null;
}
