import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data;
    },
  });
}

export function useAdminChartData(days?: number) {
  return useQuery({
    queryKey: ["admin", "chart-data", days],
    queryFn: async () => {
      const res = await adminApi.getChartData(days);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserChartData(range?: string) {
  return useQuery({
    queryKey: ["user", "chart-data", range],
    queryFn: async () => {
      const res = await adminApi.getUserChartData(range);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await adminApi.getPublicStats();
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminUsers(params?: {
  status?: string;
  q?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const res = await adminApi.getUsers(params);
      return { data: res.data, total: res.total };
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminArticles(params?: {
  status?: string;
  q?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "articles", params],
    queryFn: async () => {
      const res = await adminApi.getArticles(params);
      return { data: res.data, total: res.total };
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateArticleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminOrders(params?: {
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const res = await adminApi.getOrders(params);
      return { data: res.data, total: res.total };
    },
  });
}

export function useAdminDisputes(params?: {
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "disputes", params],
    queryFn: async () => {
      const res = await adminApi.getDisputes(params);
      return { data: res.data, total: res.total };
    },
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateDisputeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
