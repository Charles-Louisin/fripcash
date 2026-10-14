"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import { FiHeart, FiShoppingBag, FiTag, FiUser } from "react-icons/fi";
import { HiOutlineBuildingOffice2, HiOutlineBuildingStorefront } from "react-icons/hi2";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { useMe } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart-store";
import { useAddCartItem } from "@/hooks/use-cart";

export interface Product {
  id: number | string;
  image: string;
  brand: string;
  condition: string;
  size?: string;
  price: number;
  priceWithShipping: number;
  /** Strikethrough when discountEnabled */
  compareAtPrice?: number | null;
  discountEnabled?: boolean;
  favorites: number;
  href: string;
  category?: string;
  zoneId?: string | null;
  sellerId?: string | null;
  negotiable?: boolean;
  universe?: string | null;
  sellerName?: string;
}

const UNIVERSE_META: Record<
  string,
  { label: string; icon: ElementType }
> = {
  SECONDE_MAIN: { label: "Seconde main", icon: FiUser },
  secondeMain: { label: "Seconde main", icon: FiUser },
  ARTICLES_NEUFS: { label: "Neuf", icon: FiTag },
  articlesNeufs: { label: "Neuf", icon: FiTag },
  QUARTIER_BOUTIQUES: { label: "Boutique", icon: HiOutlineBuildingStorefront },
  quartierBoutiques: { label: "Boutique", icon: HiOutlineBuildingStorefront },
  ENSEIGNES: { label: "Enseigne", icon: HiOutlineBuildingOffice2 },
  enseignes: { label: "Enseigne", icon: HiOutlineBuildingOffice2 },
};

export function universeMeta(destination?: string | null) {
  if (!destination) return null;
  return UNIVERSE_META[destination] || null;
}

export function mapArticleToProduct(article: any): Product {
  const destination = article.destination || article.listingDestination;
  return {
    id: article._id,
    image: article.images?.[0] || "",
    brand: article.brand || article.title || "Article",
    condition: article.condition || "",
    size: article.size,
    price: article.price || 0,
    priceWithShipping: (article.price || 0) + (article.shippingCost || 0),
    compareAtPrice: article.compareAtPrice ?? null,
    discountEnabled: article.discountEnabled === true,
    favorites: article.favoritesCount || 0,
    href: `/article/${article._id}`,
    category: article.category,
    zoneId: article.zoneId || null,
    sellerId: article.seller?._id || null,
    negotiable: article.negotiable === true,
    universe: universeMeta(destination)?.label || null,
    sellerName: article.seller?.pseudo || article.seller?.shopName || "",
  };
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: user } = useMe();
  const isLoggedIn = !!user;
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const addItem = useCartStore((s) => s.addItem);
  const addCartItem = useAddCartItem();

  const isFavorited = favorites.some(
    (f: any) => (f.article?._id || f.article) === String(product.id)
  );

  // Listings API has no favoritesCount yet — bump locally when the viewer liked it.
  const favoritesDisplay = Math.max(
    product.favorites || 0,
    isFavorited ? 1 : 0
  );

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast("Connecte-toi pour ajouter aux favoris.", "info");
      router.push("/connexion");
      return;
    }
    toggleFavorite.mutate(
      { articleId: String(product.id), isFavorite: isFavorited },
      {
        onSuccess: () => {
          toast(
            isFavorited
              ? "Article retiré des favoris."
              : "Article ajouté aux favoris.",
            isFavorited ? "info" : "success"
          );
        },
        onError: () => {
          toast("Erreur lors de la mise à jour des favoris.", "error");
        },
      }
    );
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      image: product.image,
      brand: product.brand,
      condition: product.condition,
      size: product.size,
      price: product.price,
      priceWithShipping: product.priceWithShipping,
      href: product.href,
      zoneId: product.zoneId || null,
      sellerId: product.sellerId || null,
      negotiable: product.negotiable === true,
    });
    if (isLoggedIn) {
      try {
        await addCartItem.mutateAsync({
          listingId: String(product.id),
          quantity: 1,
        });
      } catch {
        /* local cart kept */
      }
    }
    toast("Article ajouté au panier !", "success");
  };

  return (
    <Link href={product.href} className="group block">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.brand}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {product.universe && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
            {product.universe}
          </span>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-white/90 text-foreground hover:scale-110"
          aria-label="Ajouter au panier"
        >
          <FiShoppingBag className="h-4 w-4" />
        </button>

        {/* Favorite count badge - bottom right, clickable */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={toggleFavorite.isPending}
          className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs shadow-sm ${
            isFavorited ? "text-red-500" : "text-muted-foreground"
          }`}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <FiHeart
            className={`h-3.5 w-3.5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          />
          <span>{favoritesDisplay}</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5">
        <p className="text-sm text-foreground font-medium truncate">
          {product.brand}
          {product.condition && (
            <span className="text-muted-foreground font-normal">
              {" "}
              &middot; {product.condition}
            </span>
          )}
        </p>
        {product.size && (
          <p className="text-xs text-muted-foreground">{product.size}</p>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {product.price.toLocaleString("fr-FR")} GNF
            {product.discountEnabled &&
              product.compareAtPrice != null &&
              product.compareAtPrice > product.price && (
                <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
                  {product.compareAtPrice.toLocaleString("fr-FR")} GNF
                </span>
              )}
          </p>
          <p className="text-xs text-primary font-medium">
            {product.priceWithShipping.toLocaleString("fr-FR")} GNF incl.
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-square rounded-md bg-muted animate-pulse" />
      <div className="mt-2 space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
