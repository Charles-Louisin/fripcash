import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  delay,
  mockNotifications,
  type MockNotification,
} from "@/lib/consumer-mock-data";

let notifications: MockNotification[] = [...mockNotifications];

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      const start = (page - 1) * limit;
      const data = notifications.slice(start, start + limit);
      return delay({
        data,
        total: notifications.length,
        page,
        limit,
        pagination: {
          page,
          limit,
          total: notifications.length,
          pages: Math.max(1, Math.ceil(notifications.length / limit)),
          totalPages: Math.max(1, Math.ceil(notifications.length / limit)),
        },
      });
    },
    enabled: hasToken(),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () =>
      delay(notifications.filter((n) => !n.read).length),
    enabled: hasToken(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      notifications = notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      );
      return delay({ success: true });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unreadCount"],
      });
      const prev = queryClient.getQueryData<number>([
        "notifications",
        "unreadCount",
      ]);
      queryClient.setQueryData(
        ["notifications", "unreadCount"],
        (old: number | undefined) => Math.max(0, (old ?? 0) - 1)
      );
      return { prev, id };
    },
    onError: (_err, _id, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ["notifications", "unreadCount"],
          context.prev
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
      notifications = notifications.map((n) => ({ ...n, read: true }));
      return delay({ success: true });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unreadCount"],
      });
      const prev = queryClient.getQueryData<number>([
        "notifications",
        "unreadCount",
      ]);
      queryClient.setQueryData(["notifications", "unreadCount"], 0);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ["notifications", "unreadCount"],
          context.prev
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
