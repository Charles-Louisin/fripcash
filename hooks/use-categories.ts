import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      return res.data;
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const res = await categoriesApi.getAllAdmin();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
