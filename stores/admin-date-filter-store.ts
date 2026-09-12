import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type DatePreset,
  resolveDateRange,
  toInputDate,
} from "@/lib/admin-date-filter";

type AdminDateFilterState = {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: string, to: string) => void;
};

const today = toInputDate(new Date());
const monthAgo = toInputDate(new Date(Date.now() - 29 * 86_400_000));

export const useAdminDateFilterStore = create<AdminDateFilterState>()(
  persist(
    (set) => ({
      preset: "30d",
      customFrom: monthAgo,
      customTo: today,
      setPreset: (preset) => set({ preset }),
      setCustomRange: (customFrom, customTo) =>
        set({ preset: "custom", customFrom, customTo }),
    }),
    { name: "fripcash-admin-date-filter" }
  )
);

export function useAdminDateRange() {
  const { preset, customFrom, customTo } = useAdminDateFilterStore();
  return resolveDateRange(preset, customFrom, customTo);
}
