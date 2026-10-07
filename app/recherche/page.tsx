"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { EmptyStateLottie } from "@/components/empty-state-lottie";
import {
  ProductCard,
  ProductCardSkeleton,
  mapArticleToProduct,
} from "@/components/product-card";
import { ShopCard } from "@/components/shops-strip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { listingToArticle } from "@/hooks/use-articles";
import {
  fetchCategories,
  fetchListings,
  fetchShops,
  type PublicShop,
} from "@/lib/api";
import {
  FiSearch,
  FiSliders,
  FiStar,
  FiX,
} from "react-icons/fi";

type Tab = "articles" | "boutiques";
type ShopKind = "particulier" | "standard" | "proximite" | "enseigne";

const SELLER_TYPES: { id: ShopKind; label: string }[] = [
  { id: "particulier", label: "Particuliers" },
  { id: "standard", label: "Boutiques" },
  { id: "proximite", label: "Commerces locaux" },
  { id: "enseigne", label: "Enseignes" },
];

const DESTINATIONS = [
  { id: "SECONDE_MAIN", label: "Seconde main" },
  { id: "ARTICLES_NEUFS", label: "Neuf" },
  { id: "QUARTIER_BOUTIQUES", label: "Boutiques" },
  { id: "ENSEIGNES", label: "Enseignes" },
];

const DATE_PRESETS = [
  { id: "", label: "Toutes les dates" },
  { id: "7", label: "7 derniers jours" },
  { id: "30", label: "30 derniers jours" },
  { id: "90", label: "3 derniers mois" },
  { id: "custom", label: "Période personnalisée" },
];

const SHOP_SECTIONS: { id: ShopKind; title: string }[] = [
  { id: "particulier", title: "Particuliers" },
  { id: "standard", title: "Boutiques" },
  { id: "proximite", title: "Commerces locaux" },
  { id: "enseigne", title: "Enseignes" },
];

function csv(value: string | null) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2.5 py-1.5 group"
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 group-hover:border-primary/60"
        }`}
      >
        {checked ? (
          <svg
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
              value === n
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {n === 0 ? "Tous" : (
              <span className="inline-flex items-center gap-0.5">
                {n}
                <FiStar className="h-3 w-3 fill-current" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </main>
          <Footer />
        </div>
      }
    >
      <RechercheContent />
    </Suspense>
  );
}

function RechercheContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const tab: Tab = searchParams.get("tab") === "boutiques" ? "boutiques" : "articles";
  const q = searchParams.get("q") || "";
  const sellerTypes = csv(searchParams.get("type")) as ShopKind[];
  const destinations = csv(searchParams.get("dest"));
  const categoryIds = csv(searchParams.get("cat"));
  const minListingRating = Number(searchParams.get("noteArticle") || 0);
  const minSellerRating = Number(searchParams.get("noteVendeur") || 0);
  const datePreset = searchParams.get("date") || "";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const [draft, setDraft] = useState(q);
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(q);
      setDebouncedQ(q);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(draft.trim()), 400);
    return () => clearTimeout(t);
  }, [draft]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };


  const createdWithinDays =
    datePreset && datePreset !== "custom" ? Number(datePreset) || undefined : undefined;
  const customFrom = datePreset === "custom" ? dateFrom || undefined : undefined;
  const customTo = datePreset === "custom" ? dateTo || undefined : undefined;

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: fetchCategories,
  });
  const rootCategories = categories.filter((c) => !c.parentId && c.isActive !== false);

  const selectedCategoryIds = useMemo(() => {
    if (!categoryIds.length) return undefined;
    const extra = categories
      .filter((c) => c.parentId && categoryIds.includes(c.parentId))
      .map((c) => c.id);
    return [...new Set([...categoryIds, ...extra])].join(",");
  }, [categories, categoryIds]);

  const listingParams = {
    q: debouncedQ || undefined,
    destination: destinations.length ? destinations.join(",") : undefined,
    categoryId: selectedCategoryIds,
    shopKind: sellerTypes.length ? sellerTypes.join(",") : undefined,
    minListingRating: minListingRating || undefined,
    minSellerRating: minSellerRating || undefined,
    createdWithinDays,
    dateFrom: customFrom,
    dateTo: customTo,
  };

  const shopParams = {
    q: debouncedQ || undefined,
    minRating: minSellerRating || undefined,
    createdWithinDays,
    dateFrom: customFrom,
    dateTo: customTo,
    limit: 80 as const,
  };

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["search-listings", listingParams],
    queryFn: () => fetchListings(listingParams),
  });

  const articles = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c]));
    return listings.map((l) => listingToArticle(l, catMap));
  }, [listings, categories]);

  const shopQueries = useQueries({
    queries: SHOP_SECTIONS.map((section) => ({
      queryKey: ["search-shops", section.id, shopParams],
      queryFn: () => fetchShops({ ...shopParams, shopKind: section.id }),
      enabled: sellerTypes.length === 0 || sellerTypes.includes(section.id),
    })),
  });
  const shopsLoading = shopQueries.some(
    (query) => query.isLoading && query.fetchStatus !== "idle"
  );
  const shopsByKind = useMemo(() => {
    const groups = {} as Record<ShopKind, PublicShop[]>;
    SHOP_SECTIONS.forEach((section, i) => {
      groups[section.id] = shopQueries[i]?.data || [];
    });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopQueries.map((query) => query.dataUpdatedAt).join(",")]);

  const visibleShopSections = sellerTypes.length
    ? SHOP_SECTIONS.filter((s) => sellerTypes.includes(s.id))
    : SHOP_SECTIONS;

  const activeFilterCount =
    sellerTypes.length +
    destinations.length +
    categoryIds.length +
    (minListingRating ? 1 : 0) +
    (minSellerRating ? 1 : 0) +
    (datePreset ? 1 : 0);

  const resetFilters = () => {
    setParams({
      type: null,
      dest: null,
      cat: null,
      noteArticle: null,
      noteVendeur: null,
      date: null,
      from: null,
      to: null,
    });
  };

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filtres</h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-primary hover:underline"
          >
            Tout effacer
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Type de vendeur</p>
        {SELLER_TYPES.map((item) => (
          <CheckboxItem
            key={item.id}
            label={item.label}
            checked={sellerTypes.includes(item.id)}
            onChange={() =>
              setParams({ type: toggleValue(sellerTypes, item.id).join(",") || null })
            }
          />
        ))}
      </div>

      {tab === "articles" ? (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Type d&apos;article</p>
            {DESTINATIONS.map((item) => (
              <CheckboxItem
                key={item.id}
                label={item.label}
                checked={destinations.includes(item.id)}
                onChange={() =>
                  setParams({
                    dest: toggleValue(destinations, item.id).join(",") || null,
                  })
                }
              />
            ))}
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Catégories</p>
            <div className="max-h-56 overflow-y-auto pr-1">
              {rootCategories.map((cat) => (
                <CheckboxItem
                  key={cat.id}
                  label={cat.nameFr || cat.nameEn || cat.slug}
                  checked={categoryIds.includes(cat.id)}
                  onChange={() =>
                    setParams({
                      cat: toggleValue(categoryIds, cat.id).join(",") || null,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <RatingPicker
            label="Note des articles"
            value={minListingRating}
            onChange={(n) => setParams({ noteArticle: n ? String(n) : null })}
          />
        </>
      ) : null}

      <RatingPicker
        label="Note des vendeurs"
        value={minSellerRating}
        onChange={(n) => setParams({ noteVendeur: n ? String(n) : null })}
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Date</p>
        <div className="space-y-1">
          {DATE_PRESETS.map((item) => (
            <CheckboxItem
              key={item.id || "all"}
              label={item.label}
              checked={datePreset === item.id}
              onChange={(checked) =>
                setParams({
                  date: checked ? item.id || null : null,
                  from: checked && item.id === "custom" ? dateFrom || null : null,
                  to: checked && item.id === "custom" ? dateTo || null : null,
                })
              }
            />
          ))}
        </div>
        {datePreset === "custom" ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setParams({ date: "custom", from: e.target.value || null })}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setParams({ date: "custom", to: e.target.value || null })}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AppSheet />
      <main className="container mx-auto flex-1 px-4 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ q: draft.trim() || null });
          }}
          className="relative mb-6"
        >
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Article, catégorie, boutique, enseigne…"
            className="h-12 w-full rounded-xl border border-input bg-muted/40 pl-12 pr-12 text-sm outline-none ring-primary/30 focus:bg-background focus:ring-2"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setParams({ q: null });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer"
            >
              <FiX className="h-4 w-4" />
            </button>
          ) : null}
        </form>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setParams({ tab: "articles" })}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "articles"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Articles
            </button>
            <button
              type="button"
              onClick={() => setParams({ tab: "boutiques" })}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "boutiques"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Boutiques
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm lg:hidden"
          >
            <FiSliders className="h-4 w-4" />
            Filtres
            {activeFilterCount ? (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          {debouncedQ ? (
            <p className="text-sm text-muted-foreground">
              Résultats pour « {debouncedQ} »
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              {filters}
            </div>
          </aside>

          <div>
            {tab === "articles" ? (
              listingsLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <div className="mb-4 h-40 w-40">
                    <EmptyStateLottie />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aucun article ne correspond à cette recherche.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {articles.map((article) => (
                    <ProductCard
                      key={article._id}
                      product={mapArticleToProduct(article)}
                    />
                  ))}
                </div>
              )
            ) : shopsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {visibleShopSections.map((section) => {
                  const list = shopsByKind[section.id];
                  return (
                    <section key={section.id}>
                      <h2 className="mb-4 text-xl font-bold tracking-tight">
                        {section.title}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({list.length})
                        </span>
                      </h2>
                      {list.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucune boutique dans cette catégorie.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {list.map((shop) => (
                            <ShopCard
                              key={shop.id}
                              shop={shop}
                              large
                              className="w-full"
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">{filters}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
