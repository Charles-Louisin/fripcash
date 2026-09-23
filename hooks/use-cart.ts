import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearServerCart,
  checkout,
  listingImageUrl,
  readToken,
  type Cart,
} from "@/lib/api";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!readToken();
}

export function useServerCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: hasToken(),
    staleTime: 30_000,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      quantity = 1,
    }: {
      listingId: string;
      quantity?: number;
    }) => addCartItem(listingId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => updateCartItem(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}

export function useClearServerCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearServerCart,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/** Map API cart to UI cart item shape used by local cart components. */
export function cartToUiItems(cart: Cart | undefined) {
  if (!cart?.items) return [];
  return cart.items.map((item) => ({
    id: item.listingId,
    cartItemId: item.id,
    image:
      listingImageUrl(item.listing.media?.[0]) ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop",
    brand: "",
    condition: "",
    price: item.listing.priceGnf,
    priceWithShipping: item.listing.priceGnf,
    href: `/article/${item.listingId}`,
    quantity: item.quantity,
    title: item.listing.title,
  }));
}
