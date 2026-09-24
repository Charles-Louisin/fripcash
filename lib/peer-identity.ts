/** Lightweight peer name/email shared via a hidden chat beacon (no public user API). */

const PEER_PREFIX = "__FC_PEER__";
const CACHE_KEY = "fripcash:peer-identity";

export type PeerIdentity = {
  name: string;
  email?: string | null;
};

export function isPeerBeacon(body: unknown): boolean {
  return typeof body === "string" && body.startsWith(PEER_PREFIX);
}

export function encodePeerBeacon(peer: PeerIdentity): string {
  return PEER_PREFIX + JSON.stringify({
    name: peer.name,
    email: peer.email || null,
  });
}

export function decodePeerBeacon(body: unknown): PeerIdentity | null {
  if (!isPeerBeacon(body)) return null;
  try {
    const raw = JSON.parse(String(body).slice(PEER_PREFIX.length));
    const name = typeof raw?.name === "string" ? raw.name.trim() : "";
    if (!name) return null;
    return {
      name,
      email: typeof raw?.email === "string" ? raw.email : null,
    };
  } catch {
    return null;
  }
}

function readCache(): Record<string, PeerIdentity> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function cachePeerIdentity(userId: string, peer: PeerIdentity) {
  if (typeof window === "undefined" || !userId || !peer?.name) return;
  try {
    const map = readCache();
    map[userId] = {
      name: peer.name,
      email: peer.email || map[userId]?.email || null,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function readCachedPeerIdentity(userId: string): PeerIdentity | null {
  if (!userId) return null;
  return readCache()[userId] || null;
}

const announcedKey = (conversationId: string) =>
  `fripcash:peer-announced:${conversationId}`;

export function hasAnnouncedPeer(conversationId: string): boolean {
  if (typeof window === "undefined" || !conversationId) return true;
  try {
    return localStorage.getItem(announcedKey(conversationId)) === "1";
  } catch {
    return false;
  }
}

export function markPeerAnnounced(conversationId: string) {
  if (typeof window === "undefined" || !conversationId) return;
  try {
    localStorage.setItem(announcedKey(conversationId), "1");
  } catch {
    /* ignore */
  }
}
