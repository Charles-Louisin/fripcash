"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cart-store";
import { CheckoutFlow } from "@/components/checkout-flow";

export function CheckoutModal() {
  const checkoutOpen = useCartStore((s) => s.checkoutOpen);
  const closeCheckout = useCartStore((s) => s.closeCheckout);

  return (
    <Dialog open={checkoutOpen} onOpenChange={(open) => !open && closeCheckout()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Finaliser ta commande</DialogTitle>
        </DialogHeader>
        <CheckoutFlow />
      </DialogContent>
    </Dialog>
  );
}
