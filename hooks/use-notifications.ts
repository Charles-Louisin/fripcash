import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  fetchNotificationPreferences,
  upsertNotificationPreference,
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

function normalizeNotification(n: any) {
  return {
    _id: n.id || n._id,
    id: n.id || n._id,
    title: n.title || n.type || "Notification",
    body: n.body || n.message || "",
    read: n.readAt != null || n.read === true || n.isRead === true,
    createdAt: n.createdAt,
    type: n.type,
    ...n,
  };
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      const raw = await fetchNotifications();
      const all = asArray(raw).map(normalizeNotification);
      const start = (page - 1) * limit;
      const data = all.slice(start, start + limit);
      return {
        data,
        total: all.length,
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
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const raw = await fetchNotifications();
      return asArray(raw)
        .map(normalizeNotification)
        .filter((n) => !n.read).length;
    },
    enabled: hasToken(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
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
