import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
  fetchMe,
  fetchListing,
  fetchListingComments,
  listingImageUrl,
  readToken,
  getSession,
} from "@/lib/api";
import {
  cachePeerIdentity,
  decodePeerBeacon,
  encodePeerBeacon,
  hasAnnouncedPeer,
  isPeerBeacon,
  markPeerAnnounced,
  readCachedPeerIdentity,
  type PeerIdentity,
} from "@/lib/peer-identity";

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

function readReceiptsKey(userId: string) {
  return `fripcash:msg-read:${userId}`;
}

function getLocalReadMap(userId: string): Record<string, string> {
  if (typeof window === "undefined" || !userId) return {};
  try {
    return JSON.parse(sessionStorage.getItem(readReceiptsKey(userId)) || "{}");
  } catch {
    return {};
  }
}

function setLocalReadAt(
  userId: string,
  conversationId: string,
  at = new Date().toISOString()
) {
  if (typeof window === "undefined" || !userId || !conversationId) return;
  try {
    const map = getLocalReadMap(userId);
    map[conversationId] = at;
    sessionStorage.setItem(readReceiptsKey(userId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function messageList(c: any): any[] {
  if (Array.isArray(c.messages)) return c.messages;
  if (c.lastMessage && typeof c.lastMessage === "object") return [c.lastMessage];
  return [];
}

function visibleMessages(msgs: any[]): any[] {
  return msgs.filter((m) => !isPeerBeacon(m.body || m.text || m.content));
}

function peerFromMessages(msgs: any[], otherUserId: string): PeerIdentity | null {
  if (!otherUserId) return null;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    const from = String(m.senderId || m.sender?.id || m.sender?._id || "");
    if (from !== String(otherUserId)) continue;
    const peer = decodePeerBeacon(m.body || m.text || m.content);
    if (peer) return peer;
  }
  return null;
}

function computeUnreadCount(c: any, userId: string): number {
  if (!userId) return 0;
  const me = (c.participants || []).find(
    (p: any) => p.userId === userId || p.id === userId
  );
  const convId = c.id || c._id;
  const localRead = getLocalReadMap(userId)[convId];
  const lastReadMs = Math.max(
    me?.lastReadAt ? new Date(me.lastReadAt).getTime() : 0,
    localRead ? new Date(localRead).getTime() : 0
  );
  const msgs = visibleMessages(messageList(c));
  if (!msgs.length) return 0;

  // Prefer counting unread from others in the embedded list
  const fromOthers = msgs.filter((m: any) => {
    const from = m.senderId || m.sender?.id || m.sender?._id || m.sender;
    if (!from || String(from) === String(userId)) return false;
    if (m.readAt) return false;
    const created = m.createdAt ? new Date(m.createdAt).getTime() : 0;
    return !lastReadMs || created > lastReadMs;
  });
  if (fromOthers.length > 0) return fromOthers.length;

  // API often only embeds the latest message — if it's from the other party
  // and we haven't read the thread, treat as 1 unread.
  const last = msgs[msgs.length - 1];
  const lastFrom = last?.senderId || last?.sender?.id || last?.sender?._id;
  if (!lastFrom || String(lastFrom) === String(userId)) return 0;
  const lastCreated = last.createdAt ? new Date(last.createdAt).getTime() : 0;
  if (lastReadMs && lastCreated <= lastReadMs) return 0;
  return 1;
}

function normalizeConversation(c: any, userId: string) {
  const id = c.id || c._id;
  const msgs = messageList(c);
  const visible = visibleMessages(msgs);
  const last = visible.length ? visible[visible.length - 1] : null;
  const unreadCount = computeUnreadCount({ ...c, id, messages: msgs }, userId);
  const otherUserId =
    (c.participants || []).find(
      (p: any) => p.userId && String(p.userId) !== String(userId)
    )?.userId || null;

  return {
    ...c,
    _id: id,
    id,
    otherUserId,
    otherParticipant: c.otherParticipant || null,
    article: c.article || null,
    participant: c.participant || c.participants?.[0] || { pseudo: "…" },
    lastMessage:
      last?.body ||
      (typeof c.lastMessage === "string" && !isPeerBeacon(c.lastMessage)
        ? c.lastMessage
        : "") ||
      (!isPeerBeacon(c.lastMessage?.body) ? c.lastMessage?.body : "") ||
      "",
    lastMessageAt: last?.createdAt || c.lastMessageAt || c.updatedAt,
    updatedAt: c.updatedAt,
    unread: unreadCount,
    unreadCount,
    listingId: c.listingId,
    orderId: c.orderId,
    messages: msgs,
  };
}

async function resolveMyIdentity(): Promise<PeerIdentity | null> {
  try {
    const [me, session] = await Promise.all([fetchMe(), getSession()]);
    const name =
      session?.user?.name ||
      me?.displayName ||
      null;
    if (!name) return null;
    return {
      name,
      email: session?.user?.email || null,
    };
  } catch {
    return null;
  }
}

async function announcePeerIdentity(conversationId: string) {
  if (!conversationId || hasAnnouncedPeer(conversationId)) return;
  const me = await resolveMyIdentity();
  if (!me?.name) return;
  // Mark first so concurrent callers don't double-send
  markPeerAnnounced(conversationId);
  try {
    await sendMessage(conversationId, encodePeerBeacon(me));
  } catch {
    // Allow retry next time if send failed
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`fripcash:peer-announced:${conversationId}`);
      } catch {
        /* ignore */
      }
    }
  }
}

async function enrichConversationParty(convo: any, userId: string) {
  const otherUserId = convo.otherUserId;
  if (!otherUserId) {
    return {
      ...convo,
      otherParticipant: {
        userId: null,
        name: "Membre",
        email: null,
        avatar: "",
        pseudo: "Membre",
      },
      article: convo.article || { title: "", image: "" },
    };
  }

  let name: string | null = null;
  let email: string | null = null;
  let listingTitle = "";
  let listingImage = "";
  let roleHint: "vendeur" | "acheteur" | null = null;

  // 1) Peer beacon / local cache (name + email for buyers without a public profile)
  const fromMsgs = peerFromMessages(convo.messages || [], otherUserId);
  const cached = readCachedPeerIdentity(otherUserId);
  if (fromMsgs) {
    name = fromMsgs.name;
    email = fromMsgs.email || null;
    cachePeerIdentity(otherUserId, fromMsgs);
  } else if (cached) {
    name = cached.name;
    email = cached.email || null;
  }

  // 2) Listing seller profile when the other party is the seller
  if (convo.listingId) {
    try {
      const listing = await fetchListing(convo.listingId);
      listingTitle = listing.title || "";
      listingImage = listingImageUrl(listing.media?.[0]) || "";
      const seller = listing.sellerProfile;
      if (seller?.userId && String(seller.userId) === String(otherUserId)) {
        name = seller.displayName || name;
        roleHint = "vendeur";
        if (name) cachePeerIdentity(otherUserId, { name, email });
      } else if (seller?.userId && String(seller.userId) === String(userId)) {
        roleHint = "acheteur";
      }
    } catch {
      /* listing may be gone */
    }

    // 3) Listing comments embed { user: { id, name } }
    if (!name || !email) {
      try {
        const comments = asArray(await fetchListingComments(convo.listingId));
        const flat: any[] = [];
        for (const c of comments) {
          flat.push(c);
          if (Array.isArray(c.replies)) flat.push(...c.replies);
        }
        const hit = flat.find(
          (c) => c.user?.id && String(c.user.id) === String(otherUserId)
        );
        if (!name && hit?.user?.name) name = hit.user.name;
        if (!email && hit?.user?.email) email = hit.user.email;
        if (name) cachePeerIdentity(otherUserId, { name, email });
      } catch {
        /* ignore */
      }
    }
  }

  // 4) Full message history may carry a beacon not embedded on the conversation
  if (!name && convo.id) {
    try {
      const history = asArray(await fetchMessages(convo.id));
      const peer = peerFromMessages(history, otherUserId);
      if (peer) {
        name = peer.name;
        email = email || peer.email || null;
        cachePeerIdentity(otherUserId, { name, email });
      }
    } catch {
      /* ignore */
    }
  }

  if (!name) {
    name =
      roleHint === "vendeur"
        ? "Vendeur"
        : roleHint === "acheteur"
          ? "Acheteur"
          : "Membre";
  }

  return {
    ...convo,
    otherParticipant: {
      userId: otherUserId,
      name,
      email,
      avatar: "",
      pseudo: name,
    },
    article: {
      title: listingTitle || convo.article?.title || "",
      image: listingImage || convo.article?.image || "",
      _id: convo.listingId,
    },
  };
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const [raw, me] = await Promise.all([fetchConversations(), fetchMe()]);
      const base = asArray(raw).map((c) => normalizeConversation(c, me.id));
      const enriched = await Promise.all(
        base.map((c) => enrichConversationParty(c, me.id))
      );
      // After resolving the list, quietly share our name/email in each thread
      void Promise.allSettled(
        base.map((c) => (c.id ? announcePeerIdentity(c.id) : Promise.resolve()))
      );
      return enriched;
    },
    enabled: hasToken(),
    refetchInterval: 30_000,
  });
}

/** Total unread messages across conversations (sidebar badge). */
export function useUnreadMessagesCount() {
  const { data: conversations = [] } = useConversations();
  return conversations.reduce(
    (sum: number, c: any) => sum + (Number(c.unreadCount) || 0),
    0
  );
}

/** Mark a conversation as read locally (no BE mark-read endpoint yet). */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useCallback(
    (conversationId: string) => {
      const me = queryClient.getQueryData<any>(["me"]);
      const userId = me?.id || me?._id;
      if (!userId || !conversationId) return;
      setLocalReadAt(String(userId), conversationId);
      // Share our name/email with the other participant (hidden beacon message)
      void announcePeerIdentity(conversationId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      });
      queryClient.setQueryData(["conversations"], (prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((c: any) =>
          c.id === conversationId || c._id === conversationId
            ? { ...c, unreadCount: 0, unread: 0 }
            : c
        );
      });
    },
    [queryClient]
  );
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () =>
      asArray(await fetchMessages(conversationId))
        .filter((m: any) => !isPeerBeacon(m.body || m.text || m.content))
        .map((m: any) => {
          const senderId = m.senderId || m.sender?.id || m.sender?._id || null;
          return {
            ...m,
            _id: m.id || m._id,
            conversationId,
            senderId,
            text: m.body || m.text || m.content,
            createdAt: m.createdAt,
          };
        }),
    enabled: !!conversationId && hasToken(),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { articleId: string; message?: string }) => {
      const conv: any = await createConversation({ listingId: body.articleId });
      const id = conv.id || conv._id;
      if (id) {
        await announcePeerIdentity(id);
        if (body.message) {
          await sendMessage(id, body.message);
        }
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
