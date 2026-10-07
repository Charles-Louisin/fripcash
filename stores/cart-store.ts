import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number | string;
  image: string;
  brand: string;
  condition: string;
  size?: string;
  price: number;
  priceWithShipping: number;
  href: string;
  quantity: number;
  zoneId?: string | null;
  sellerId?: string | null;
  negotiable?: boolean;
}

interface CartState {
  items: CartItem[];
  cartOpen: boolean;
  checkoutOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;

  // Computed helpers
  itemCount: () => number;
  subtotal: () => number;
  totalWithShipping: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,
      checkoutOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      openCheckout: () => set({ checkoutOpen: true, cartOpen: false }),
      closeCheckout: () => set({ checkoutOpen: false }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalWithShipping: () =>
        get().items.reduce(
          (sum, i) => sum + i.priceWithShipping * i.quantity,
          0
        ),
    }),
    {
      name: "fripcash-cart-v5",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
