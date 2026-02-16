"use client";

import Link from "next/link";
import { EmptyStateLottie } from "@/components/empty-state-lottie";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi";

export function CartSheet() {
  const { items, cartOpen, closeCart, removeItem, updateQuantity, itemCount, subtotal, totalWithShipping } =
    useCartStore();

  const count = itemCount();
  const sub = subtotal();
  const total = totalWithShipping();
  const shippingFees = total - sub;

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <FiShoppingBag className="h-5 w-5" />
            Mon panier ({count})
          </SheetTitle>
          <SheetDescription className="sr-only">
            Votre panier d&apos;achat
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          /* ─── Empty state ─── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-40 h-40 shrink-0">
              <EmptyStateLottie />
            </div>
            <div className="text-center">
              <p className="font-semibold text-primary">
                Ton panier est vide
              </p>
              <p className="text-sm text-primary mt-1">
                Parcours nos articles et trouve ton bonheur !
              </p>
            </div>
            <Button
              onClick={closeCart}
              className="rounded-full px-6"
              asChild
            >
              <Link href="/">Découvrir les articles</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* ─── Cart items ─── */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  {/* Image */}
                  <Link
                    href={item.href}
                    onClick={closeCart}
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.brand}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.brand}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.condition}
                          {item.size ? ` · ${item.size}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Supprimer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                          aria-label="Diminuer"
                        >
                          <FiMinus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                          aria-label="Augmenter"
                        >
                          <FiPlus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-bold text-foreground">
                        {(item.price * item.quantity).toLocaleString("fr-FR")} GNF
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Summary + checkout button ─── */}
            <div className="border-t pt-4 pb-2 px-1 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium text-foreground">
                    {sub.toLocaleString("fr-FR")} GNF
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Frais de livraison
                  </span>
                  <span className="font-medium text-foreground">
                    {shippingFees.toLocaleString("fr-FR")} GNF
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {total.toLocaleString("fr-FR")} GNF
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-full font-semibold text-base gap-2"
                asChild
                onClick={closeCart}
              >
                <Link href="/checkout">
                  Passer la commande
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
