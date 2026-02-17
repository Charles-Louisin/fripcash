import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("fripcash-token");
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationsApi.getAll({ page, limit }),
    enabled: hasToken(),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const res = await notificationsApi.getUnreadCount();
      return res.unreadCount;
    },
    enabled: hasToken(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unreadCount"] });
      const prev = queryClient.getQueryData<number>(["notifications", "unreadCount"]);
      queryClient.setQueryData(
        ["notifications", "unreadCount"],
        (old: number | undefined) => Math.max(0, (old ?? 0) - 1)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["notifications", "unreadCount"], context.prev);
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
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "unreadCount"] });
      const prev = queryClient.getQueryData<number>(["notifications", "unreadCount"]);
      queryClient.setQueryData(["notifications", "unreadCount"], 0);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["notifications", "unreadCount"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
