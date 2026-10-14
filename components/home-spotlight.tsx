"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FiChevronRight } from "react-icons/fi";
import { fetchCategories, fetchListings, fetchShops } from "@/lib/api";
import { listingToArticle } from "@/hooks/use-articles";
import { universeMeta } from "@/components/product-card";

const UNIVERSES = [
  {
    group: "Mode" as const,
    hint: "vêtements, sacs, chaussures",
    dest: "SECONDE_MAIN",
    title: "Seconde main",
    subtitle: "Entre particuliers",
    fallback:
      "linear-gradient(160deg, #8a5a45 0%, #c4896a 45%, #5c3a2e 100%)",
  },
  {
    group: "Mode" as const,
    hint: "vêtements, sacs, chaussures",
    dest: "ARTICLES_NEUFS",
    title: "Articles neufs",
    subtitle: "Boutiques et commerçants",
    fallback:
      "linear-gradient(160deg, #6b4a3a 0%, #d4a574 50%, #3d2a22 100%)",
  },
  {
    group: "Courses" as const,
    hint: "alimentaire et maison",
    dest: "QUARTIER_BOUTIQUES",
    title: "Boutiques de quartier",
    subtitle: "Retrait par code",
    fallback:
      "linear-gradient(160deg, #3d3428 0%, #a8845a 40%, #1f1a16 100%)",
  },
  {
    group: "Courses" as const,
    hint: "alimentaire et maison",
    dest: "ENSEIGNES",
    title: "Enseignes",
    subtitle: "Livraison en ville",
    fallback:
      "linear-gradient(160deg, #c4784a 0%, #f0c27a 42%, #5a321c 100%)",
  },
];

function formatCount(n: number, noun: "article" | "boutique") {
  return `${n.toLocaleString("fr-FR")} ${noun}${n > 1 ? "s" : ""}`;
}

export function HomeSpotlight() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["home-spotlight"],
    queryFn: async () => {
      const [rows, categories] = await Promise.all([
        fetchListings(),
        fetchCategories().catch(() => []),
      ]);
      const cats = Array.isArray(categories) ? categories : [];
      const catMap = new Map(cats.map((c) => [c.id, c]));
      return rows.map((row) => listingToArticle(row, catMap));
    },
  });
  const { data: localShops = [] } = useQuery({
    queryKey: ["home-local-shops"],
    queryFn: async () => {
      const rows = await fetchShops({ shopKind: "proximite", limit: 80 });
      return Array.isArray(rows) ? rows : [];
    },
  });

  const promotions = useMemo(
    () =>
      listings.filter(
        (a) =>
          a.discountEnabled &&
          a.compareAtPrice != null &&
          a.compareAtPrice > a.price
      ),
    [listings]
  );
  const promoScrollRef = useRef<HTMLDivElement>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const onPromoScroll = () => {
    const el = promoScrollRef.current;
    if (!el || !el.clientWidth) return;
    setPromoIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const byDest = useMemo(() => {
    const map = new Map<string, typeof listings>();
    for (const article of listings) {
      const key = article.destination || "";
      const list = map.get(key) || [];
      list.push(article);
      map.set(key, list);
    }
    return map;
  }, [listings]);

  return (
    <>
      <section className="container mx-auto px-4 pt-8 pb-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Promotions</h2>
          <Link href="/recherche?promo=1" className="text-sm font-medium text-primary">
            Voir tout
          </Link>
        </div>

        {isLoading ? (
          <div className="h-52 animate-pulse rounded-3xl bg-muted sm:h-60" />
        ) : promotions.length ? (
          <div>
            <div
              ref={promoScrollRef}
              onScroll={onPromoScroll}
              className="flex flex-nowrap overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x overscroll-x-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {promotions.map((promo) => (
                <Link
                  key={promo._id}
                  href={`/article/${promo._id}`}
                  className="relative block h-52 min-w-full shrink-0 snap-center overflow-hidden rounded-3xl text-white shadow-sm sm:h-60"
                  style={{
                    backgroundImage: promo.images?.[0]
                      ? `linear-gradient(180deg, rgba(40,20,10,0.15) 0%, rgba(40,20,10,0.72) 100%), url(${promo.images[0]})`
                      : "linear-gradient(160deg, #8a5a45, #5c3a2e)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    {universeMeta(promo.destination)?.label && (
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
                        {universeMeta(promo.destination)?.label}
                      </span>
                    )}
                    {promo.compareAtPrice != null &&
                      promo.compareAtPrice > promo.price && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                          -
                          {Math.round(
                            (1 - promo.price / promo.compareAtPrice) * 100
                          )}
                          %
                        </span>
                      )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-lg font-semibold leading-tight">
                      {promo.title}
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {promo.price.toLocaleString("fr-FR")} GNF
                      </span>
                      {promo.compareAtPrice != null && (
                        <span className="text-sm line-through opacity-80">
                          {promo.compareAtPrice.toLocaleString("fr-FR")} GNF
                        </span>
                      )}
                    </p>
                    {promo.seller?.pseudo && (
                      <p className="mt-1 text-sm opacity-90">
                        {promo.seller.pseudo}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {promotions.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {promotions.slice(0, 8).map((item, i) => (
                  <button
                    key={item._id}
                    type="button"
                    aria-label={`Promotion ${i + 1}`}
                    onClick={() => {
                      const el = promoScrollRef.current;
                      if (!el) return;
                      el.scrollTo({
                        left: i * el.clientWidth,
                        behavior: "smooth",
                      });
                      setPromoIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === promoIndex ? "w-5 bg-primary" : "w-1.5 bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune promotion pour le moment.
          </p>
        )}
      </section>

      {(["Mode", "Courses"] as const).map((group) => {
        const cards = UNIVERSES.filter((item) => item.group === group);
        return (
          <section key={group} className="container mx-auto px-4 py-6">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-xl font-bold tracking-tight">{group}</h2>
              <p className="text-sm text-muted-foreground">{cards[0]?.hint}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => {
                const isLocal = card.dest === "QUARTIER_BOUTIQUES";
                const rows = byDest.get(card.dest) || [];
                const shopImage = localShops.find((shop) => shop.coverUrl || shop.avatarUrl);
                const image = isLocal
                  ? shopImage?.coverUrl || shopImage?.avatarUrl
                  : rows.find((row) => row.images?.[0])?.images?.[0];
                const count = isLocal ? localShops.length : rows.length;
                return (
                  <Link
                    key={card.dest}
                    href={
                      isLocal
                        ? "/recherche?tab=boutiques&type=proximite"
                        : `/recherche?dest=${card.dest}`
                    }
                    className="relative flex min-h-[168px] flex-col justify-end overflow-hidden rounded-3xl p-4 text-white"
                    style={{
                      backgroundImage: image
                        ? `linear-gradient(180deg, rgba(30,16,10,0.15) 10%, rgba(30,16,10,0.78) 100%), url(${image})`
                        : card.fallback,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground shadow-sm">
                      <FiChevronRight className="h-4 w-4" />
                    </span>
                    <p className="text-base font-semibold leading-tight">{card.title}</p>
                    {/* <p className="mt-0.5 text-xs text-white/85">{card.subtitle}</p> */}
                    <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
                      {formatCount(count, isLocal ? "boutique" : "article")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
