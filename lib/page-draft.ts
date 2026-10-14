const PREFIX = "fripcash_draft:";
const memory = new Map<string, unknown>();
let wipedForThisLoad = false;

function isReload() {
  if (typeof performance === "undefined") return false;
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return nav?.type === "reload";
}

function wipeAfterRefresh() {
  if (wipedForThisLoad || typeof window === "undefined") return;
  wipedForThisLoad = true;
  if (!isReload()) return;
  memory.clear();
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

export function readPageDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  wipeAfterRefresh();
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    memory.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function writePageDraft<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  wipeAfterRefresh();
  memory.set(key, value);
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function clearPageDraft(key: string) {
  memory.delete(key);
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}
