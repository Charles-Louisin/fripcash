"use client";

import Link from "next/link";
import { FiHeart } from "react-icons/fi";

export interface Product {
  id: number;
  image: string;
  brand: string;
  condition: string;
  size?: string;
  price: number;
  priceWithShipping: number;
  favorites: number;
  href: string;
  category?: string;
}

export function ProductCard({ product }: { product: Product }) {
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

        {/* Favorite badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground shadow-sm">
          <FiHeart className="h-3.5 w-3.5" />
          <span>{product.favorites}</span>
        </div>
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
            {product.price.toFixed(2)} &euro;
          </p>
          <p className="text-xs text-primary font-medium">
            {product.priceWithShipping.toFixed(2)} &euro; incl.
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
        <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-1/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
