import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  image: string;
  brand: string;
  condition: string;
  size?: string;
  price: number;
  priceWithShipping: number;
  href: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  cartOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed helpers
  itemCount: () => number;
  subtotal: () => number;
  totalWithShipping: () => number;
}

const dummyItems: CartItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    brand: "Nike Air Max 90",
    condition: "Neuf sans étiquette",
    size: "M / 38",
    price: 25000,
    priceWithShipping: 27500,
    href: "/article/1",
    quantity: 1,
  },
  {
    id: 102,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    brand: "H&M",
    condition: "Neuf avec étiquette",
    size: "S / 36",
    price: 12000,
    priceWithShipping: 13500,
    href: "/article/4",
    quantity: 1,
  },
  {
    id: 104,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
    brand: "Levi's 501",
    condition: "Très bon état",
    size: "L / 42",
    price: 15000,
    priceWithShipping: 17000,
    href: "/article/10",
    quantity: 2,
  },
];

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: dummyItems,
      cartOpen: false,

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
      name: "fripcash-cart-v2",
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
      // Keep dummy items if localStorage has nothing or empty cart
      merge: (persisted, current) => {
        const saved = persisted as { items?: CartItem[] } | undefined;
        return {
          ...current,
          items: saved?.items && saved.items.length > 0 ? saved.items : current.items,
        };
      },
    }
  )
);
