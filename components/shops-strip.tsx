"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchShops, type PublicShop } from "@/lib/api";
import { FiStar, FiHeart } from "react-icons/fi";

function ShopCard({
  shop,
  large,
  className,
}: {
  shop: PublicShop;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/boutique/${shop.id}`}
      className={`rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors ${
        className || (large ? "shrink-0 w-[280px] sm:w-[320px]" : "shrink-0 w-[220px]")
      }`}
    >
      <div className={`bg-muted ${large ? "h-40 sm:h-48" : "h-20"}`}>
        {shop.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 to-muted" />
        )}
      </div>
      <div className={`px-3 pb-3 ${large ? "-mt-8" : "-mt-6"}`}>
        <div
          className={`rounded-full border-2 border-background overflow-hidden bg-muted ${
            large ? "h-16 w-16" : "h-12 w-12"
          }`}
        >
          {shop.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold">
              {(shop.shopName || "B")[0]}
            </div>
          )}
        </div>
        <p className={`mt-2 truncate font-semibold ${large ? "text-base" : "text-sm"}`}>
          {shop.shopName}
        </p>
        {shop.bio ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{shop.bio}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {shop.rating || 0}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <FiHeart className="h-3 w-3" />
            {shop.likesCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ShopsStrip({
  title,
  shopKind,
  createdWithinDays,
  large = false,
  alwaysShow = false,
  href,
}: {
  title: string;
  shopKind?: "particulier" | "standard" | "proximite" | "enseigne";
  createdWithinDays?: number;
  large?: boolean;
  alwaysShow?: boolean;
  href?: string;
}) {
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["catalog-shops", shopKind, createdWithinDays],
    queryFn: () => fetchShops({ shopKind, createdWithinDays, limit: 24 }),
  });

  if (!isLoading && shops.length === 0 && !alwaysShow) return null;

  return (
    <section className="container mx-auto px-4 pb-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm font-medium text-primary hover:underline">
            Voir tout
          </Link>
        ) : null}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`shrink-0 rounded-2xl bg-muted animate-pulse ${
                  large ? "w-[320px] h-64" : "w-[220px] h-40"
                }`}
              />
            ))
          : shops.length === 0
            ? (
                <p className="py-8 text-sm text-muted-foreground">
                  Aucune boutique dans cette section pour le moment.
                </p>
              )
            : shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} large={large} />
              ))}
      </div>
    </section>
  );
}

export { ShopCard };
