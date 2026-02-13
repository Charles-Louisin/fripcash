import { create } from "zustand";

/**
 * UI Store — manages global UI state (sheets, modals, sidebars, etc.)
 *
 * Recommended pattern:
 *   - Server state (API data) stays in TanStack Query hooks
 *   - UI state (open/close, selected tab, etc.) lives here in Zustand
 *   - Never sync TanStack Query data into Zustand
 */

interface UIState {
  // Sheet / drawer state
  sheetOpen: boolean;
  sheetContent: "menu" | "notifications" | "details" | null;
  openSheet: (content: UIState["sheetContent"]) => void;
  closeSheet: () => void;

  // Modal state
  modalOpen: boolean;
  modalContent: string | null;
  openModal: (content: string) => void;
  closeModal: () => void;

  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sheet
  sheetOpen: false,
  sheetContent: null,
  openSheet: (content) => set({ sheetOpen: true, sheetContent: content }),
  closeSheet: () => set({ sheetOpen: false, sheetContent: null }),

  // Modal
  modalOpen: false,
  modalContent: null,
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
