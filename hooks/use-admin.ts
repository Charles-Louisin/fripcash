import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mockAdminArticles,
  mockAdminOrders,
  mockAdminUsers,
  filterMockArticles,
  filterMockOrders,
  filterMockUsers,
} from "@/lib/admin-mock-data";
import { dashboardMock } from "@/lib/admin-platform";
import { filterTransactionChartByRange } from "@/lib/admin-chart-mock";

/** Admin hooks use local mocks until the shared backend is ready. */

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => ({
      ...dashboardMock,
      totalUsers: mockAdminUsers.length + 1200,
      totalArticles: mockAdminArticles.length + 3500,
      totalRevenue: 48_500_000,
      articlesChange: "+12% ce mois",
      revenueChange: "+8% ce mois",
      pendingArticles: mockAdminArticles.filter((a) => a.status === "pending"),
    }),
  });
}

export function useAdminChartData(days?: number) {
  return useQuery({
    queryKey: ["admin", "chart-data", days],
    queryFn: async () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - (days ?? 30));
      return filterTransactionChartByRange(from, to);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserChartData(range?: string) {
  return useQuery({
    queryKey: ["user", "chart-data", range],
    queryFn: async () => {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      return Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().slice(0, 10),
          ventes: 2 + (i % 5),
          revenus: 50000 + i * 12000,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => ({
      totalUsers: 12840,
      totalSold: 8920,
      avgRating: 4.8,
      totalArticles: 35620,
      users: 12840,
      articles: 35620,
      orders: 8920,
      rating: 4.8,
    }),
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
      const data = filterMockUsers(
        mockAdminUsers,
        params?.q ?? "",
        params?.status ?? "all"
      );
      return { data, total: data.length };
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => ({
      success: true,
      id,
      status,
    }),
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
      const data = filterMockArticles(
        mockAdminArticles,
        params?.q ?? "",
        params?.status ?? "all"
      );
      return { data, total: data.length };
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => ({
      success: true,
      id,
      status,
    }),
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
      const data = filterMockOrders(
        mockAdminOrders,
        "",
        params?.status ?? "all"
      );
      return { data, total: data.length };
    },
  });
}

export function useAdminDisputes(params?: {
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["admin", "disputes", params],
    queryFn: async () => ({ data: [], total: 0 }),
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => ({
      success: true,
      id,
      status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
