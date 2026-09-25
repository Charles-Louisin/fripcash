import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  fetchNotificationPreferences,
  upsertNotificationPreference,
  fetchMessages,
  fetchMyOffers,
  readToken,
} from "@/lib/api";
import { isPeerBeacon } from "@/lib/peer-identity";

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

/** Map mobile deep links to web dashboard routes. */
function mapDeepLink(deepLink?: string | null, type?: string): string {
  if (!deepLink) {
    if (type === "CHAT_MESSAGE") return "/dashboard/messages";
    if (
      type === "OFFER_RECEIVED" ||
      type === "OFFER_ACCEPTED" ||
      type === "OFFER_REFUSED"
    ) {
      return "/dashboard";
    }
    return "/dashboard/notifications";
  }
  const messages = deepLink.match(/^fripcash:\/\/messages\/([^/?#]+)/i);
  if (messages) return `/dashboard/messages?conversation=${messages[1]}`;
  const offers = deepLink.match(/^fripcash:\/\/offers\/([^/?#]+)/i);
  if (offers) return `/dashboard`;
  if (/notifications/i.test(deepLink)) return "/dashboard/notifications";
  return "/dashboard/notifications";
}

function localizeTitle(type?: string, title?: string): string {
  const t = (title || "").trim();
  const map: Record<string, string> = {
    CHAT_MESSAGE: "Nouveau message",
    OFFER_RECEIVED: "Nouvelle offre",
    OFFER_ACCEPTED: "Offre acceptée",
    OFFER_REFUSED: "Offre refusée",
    ORDER_UPDATE: "Commande mise à jour",
  };
  if (type && map[type]) {
    if (!t || /^new\s/i.test(t) || t === type) return map[type];
  }
  if (/^new message$/i.test(t)) return "Nouveau message";
  if (/^new offer$/i.test(t)) return "Nouvelle offre";
  return t || map[type || ""] || "Notification";
}

function localizeBody(body?: string): string {
  const b = (body || "").trim();
  if (!b) return "";
  if (/you have a new message/i.test(b)) {
    return "Nouveau message dans votre conversation.";
  }
  if (/you received an offer/i.test(b) || /offer of \{amount\}/i.test(b)) {
    return b
      .replace(/You received an offer of \{amount\} GNF on your listing\./i, "Nouvelle offre reçue sur votre article.")
      .replace(/\{amount\}/g, "…");
  }
  return b;
}

function isGenericChatBody(body?: string): boolean {
  const b = (body || "").trim();
  return (
    !b ||
    /you have a new message/i.test(b) ||
    /nouveau message dans votre conversation/i.test(b)
  );
}

function normalizeNotification(n: any) {
  const body = localizeBody(n.body || n.message || "");
  const read =
    n.readAt != null || n.read === true || n.isRead === true;
  const type = n.type;
  return {
    ...n,
    _id: n.id || n._id,
    id: n.id || n._id,
    title: localizeTitle(type, n.title),
    body,
    message: body,
    read,
    createdAt: n.createdAt,
    type,
    entityId: n.entityId,
    entityType: n.entityType,
    link: mapDeepLink(n.deepLink, type),
  };
}

/** Pick the chat message that best matches a notification timestamp. */
function messageForNotification(
  msgs: any[],
  notifCreatedAt?: string
): string | null {
  const visible = msgs.filter((m) => !isPeerBeacon(m.body || m.text));
  if (!visible.length) return null;
  const notifMs = notifCreatedAt ? new Date(notifCreatedAt).getTime() : 0;
  let best: any = null;
  let bestDelta = Infinity;
  for (const m of visible) {
    const t = m.createdAt ? new Date(m.createdAt).getTime() : 0;
    const delta = Math.abs(t - notifMs);
    // Prefer messages at or slightly before the notification
    if (t <= notifMs + 8000 && delta < bestDelta) {
      best = m;
      bestDelta = delta;
    }
  }
  if (!best) best = visible[visible.length - 1];
  const text = (best?.body || best?.text || "").trim();
  return text || null;
}

/**
 * Replace generic chat/offer copy with real DB message / offer amounts.
 * Dedupe chat notifications so the dropdown shows one row per conversation.
 */
async function enrichNotifications(list: any[]): Promise<any[]> {
  const chatIds = [
    ...new Set(
      list
        .filter((n) => n.type === "CHAT_MESSAGE" && n.entityId)
        .map((n) => String(n.entityId))
    ),
  ];

  const msgsByConv = new Map<string, any[]>();
  await Promise.all(
    chatIds.map(async (id) => {
      try {
        msgsByConv.set(id, asArray(await fetchMessages(id)));
      } catch {
        msgsByConv.set(id, []);
      }
    })
  );

  // Optional: enrich offer notifications with amount
  const offerIds = [
    ...new Set(
      list
        .filter((n) => n.type === "OFFER_RECEIVED" && n.entityId)
        .map((n) => String(n.entityId))
    ),
  ];
  const offerAmountById = new Map<string, number>();
  if (offerIds.length) {
    try {
      const offers = asArray(await fetchMyOffers());
      for (const o of offers) {
        const id = String(o.id || o._id);
        if (offerIds.includes(id) && typeof o.amountGnf === "number") {
          offerAmountById.set(id, o.amountGnf);
        }
      }
    } catch {
      /* seller may use listing offers instead */
    }
  }

  const enriched = list.map((n) => {
    if (n.type === "CHAT_MESSAGE" && n.entityId) {
      const msgs = msgsByConv.get(String(n.entityId)) || [];
      const preview = messageForNotification(msgs, n.createdAt);
      if (preview) {
        return {
          ...n,
          title: "Nouveau message",
          body: preview,
          message: preview,
          previewKind: "chat" as const,
        };
      }
      if (isGenericChatBody(n.body)) {
        return {
          ...n,
          title: "Nouveau message",
          body: "Ouvrir la conversation",
          message: "Ouvrir la conversation",
          previewKind: "chat" as const,
        };
      }
    }

    if (n.type === "OFFER_RECEIVED" && n.entityId) {
      const amount = offerAmountById.get(String(n.entityId));
      if (typeof amount === "number") {
        const text = `Offre de ${amount.toLocaleString("fr-FR")} GNF`;
        return {
          ...n,
          title: "Nouvelle offre",
          body: text,
          message: text,
          previewKind: "offer" as const,
        };
      }
    }

    return n;
  });

  // Newest first assumed — keep first chat notif per conversation
  const seenConv = new Set<string>();
  const deduped: any[] = [];
  for (const n of enriched) {
    if (n.type === "CHAT_MESSAGE" && n.entityId) {
      const key = String(n.entityId);
      if (seenConv.has(key)) continue;
      seenConv.add(key);
    }
    deduped.push(n);
  }
  return deduped;
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", "list", page, limit],
    queryFn: async () => {
      const raw = await fetchNotifications();
      const all = await enrichNotifications(
        asArray(raw).map(normalizeNotification)
      );
      const start = (page - 1) * limit;
      const data = all.slice(start, start + limit);
      return {
        data,
        total: all.length,
        unreadCount: all.filter((n) => !n.read).length,
        page,
        limit,
        pagination: {
          page,
          limit,
          total: all.length,
          pages: Math.max(1, Math.ceil(all.length / limit)),
          totalPages: Math.max(1, Math.ceil(all.length / limit)),
        },
      };
    },
    enabled: hasToken(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Unread notifications count from GET /notifications (DB). */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const raw = await fetchNotifications();
      // Count unique unread chat threads + other unread types (matches enriched list)
      const all = asArray(raw).map(normalizeNotification);
      const seenConv = new Set<string>();
      let count = 0;
      for (const n of all) {
        if (n.read) continue;
        if (n.type === "CHAT_MESSAGE" && n.entityId) {
          const key = String(n.entityId);
          if (seenConv.has(key)) continue;
          seenConv.add(key);
        }
        count += 1;
      }
      return count;
    },
    enabled: hasToken(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prevCount = queryClient.getQueryData<number>([
        "notifications",
        "unreadCount",
      ]);
      if (typeof prevCount === "number" && prevCount > 0) {
        queryClient.setQueryData(
          ["notifications", "unreadCount"],
          prevCount - 1
        );
      }
      queryClient.setQueriesData(
        { queryKey: ["notifications", "list"] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((n: any) =>
              n._id === id || n.id === id
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n
            ),
            unreadCount: Math.max(0, (old.unreadCount || 1) - 1),
          };
        }
      );
      return { prevCount };
    },
    onError: (_e, _id, ctx) => {
      if (typeof ctx?.prevCount === "number") {
        queryClient.setQueryData(
          ["notifications", "unreadCount"],
          ctx.prevCount
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const raw = await fetchNotifications();
      const unread = asArray(raw)
        .map(normalizeNotification)
        .filter((n) => !n.read);
      await Promise.all(unread.map((n) => markNotificationRead(n._id)));
      return { success: true };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: fetchNotificationPreferences,
    enabled: hasToken(),
  });
}

export function useUpsertNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertNotificationPreference,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "preferences"],
      });
    },
  });
}
