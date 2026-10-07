"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EmptyStateLottie } from "@/components/empty-state-lottie";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { ProductCard, ProductCardSkeleton, mapArticleToProduct } from "@/components/product-card";
import {
  ProductFilters,
  defaultFilters,
  type Filters,
} from "@/components/product-filters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSliders,
  FiHome,
} from "react-icons/fi";
import { useArticles } from "@/hooks/use-articles";

type SortOption = "recent" | "price_asc" | "price_desc" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Plus récent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "popular", label: "Popularité" },
];

const ITEMS_PER_PAGE = 12;

const SORT_MAP: Record<SortOption, string> = {
  recent: "-createdAt",
  price_asc: "price",
  price_desc: "-price",
  popular: "-favoritesCount",
};

export default function ProduitsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    }>
      <ProduitsContent />
    </Suspense>
  );
}

function ProduitsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSubCategory = searchParams.get("subCategory") || "";
  const urlItemType = searchParams.get("itemType") || "";
  const urlQuery = searchParams.get("q") || "";

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    categories: urlCategory ? [urlCategory] : [],
  }));
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categories: urlCategory ? [urlCategory] : prev.categories,
    }));
    setPage(1);
  }, [urlCategory, urlSubCategory, urlItemType, urlQuery]);

  const apiFilters = useMemo(() => ({
    page,
    limit: ITEMS_PER_PAGE,
    status: "active" as const,
    sort: SORT_MAP[sort],
    q: urlQuery || undefined,
    category: filters.categories.length === 1 ? filters.categories[0] : urlCategory || undefined,
    subCategory: urlSubCategory || undefined,
    itemType: urlItemType || undefined,
    condition: filters.conditions.length === 1 ? filters.conditions[0] : undefined,
    size: filters.sizes.length === 1 ? filters.sizes[0] : undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  }), [filters, sort, page, urlCategory, urlSubCategory, urlItemType, urlQuery]);

  const { data, isLoading } = useArticles(apiFilters);

  const articles = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  let filteredArticles = articles;

  // Client-side multi-filter when sidebar has multiple selections
  if (filters.categories.length > 1) {
    filteredArticles = filteredArticles.filter((a: any) =>
      filters.categories.some(
        (c) =>
          a.rootCategory === c ||
          a.subCategory === c ||
          String(a.category ?? "").startsWith(c)
      )
    );
  }
  if (filters.conditions.length > 1) {
    filteredArticles = filteredArticles.filter((a: any) =>
      filters.conditions.includes(a.condition)
    );
  }
  if (filters.sizes.length > 1) {
    filteredArticles = filteredArticles.filter((a: any) =>
      a.size
        ? filters.sizes.some((s) => String(a.size).toUpperCase().includes(s))
        : false
    );
  }

  const products = filteredArticles.map(mapArticleToProduct);

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setSortOpen(false);
    setPage(1);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.conditions.length +
    filters.sizes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            {urlCategory ? (
              <>
                <Link href="/produits" className="hover:text-primary transition-colors">Produits</Link>
                <span>/</span>
                {urlSubCategory ? (
                  <>
                    <Link href={`/produits?category=${encodeURIComponent(urlCategory)}`} className="hover:text-primary transition-colors">{urlCategory}</Link>
                    <span>/</span>
                    {urlItemType ? (
                      <>
                        <Link href={`/produits?category=${encodeURIComponent(urlCategory)}&subCategory=${encodeURIComponent(urlSubCategory)}`} className="hover:text-primary transition-colors">{urlSubCategory}</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{urlItemType}</span>
                      </>
                    ) : (
                      <span className="text-foreground font-medium">{urlSubCategory}</span>
                    )}
                  </>
                ) : (
                  <span className="text-foreground font-medium">{urlCategory}</span>
                )}
              </>
            ) : (
              <span className="text-foreground font-medium">Produits</span>
            )}
          </nav>

          {urlQuery && (
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm text-muted-foreground">
                Résultats pour <span className="font-semibold text-foreground">&quot;{urlQuery}&quot;</span>
              </p>
              <Link href="/produits" className="text-xs text-primary hover:underline">Effacer</Link>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Filtres
                </h3>
                <ProductFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-2">
                <p className="text-sm whitespace-nowrap">
                  <span className="font-bold text-primary">
                    {total}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    article{total !== 1 ? "s" : ""}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setFilterSheetOpen(true)}
                    className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0"
                  >
                    <FiSliders className="h-4 w-4" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <span className="hidden sm:inline">Trier :</span>{" "}
                    {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                    <FiChevronDown className="h-4 w-4 shrink-0" />
                  </button>

                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-background border border-border rounded-lg shadow-lg z-50 py-1">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSortChange(opt.value)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              sort === opt.value
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-64 h-64 mb-4">
                    <EmptyStateLottie />
                  </div>
                  <p className="text-lg font-semibold text-primary mb-1">
                    Aucun article trouvé
                  </p>
                  <p className="text-sm text-primary mb-4">
                    Essaie de modifier tes filtres pour trouver ce que tu
                    cherches.
                  </p>
                  <button
                    onClick={() => handleFiltersChange(defaultFilters)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Page précédente"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                        page === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-muted text-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Page suivante"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile filter sheet */}
      <Sheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
      >
        <SheetContent side="left" className="w-full max-w-sm p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription className="sr-only">
              Filtrer les produits
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductFilters
              filters={filters}
              onChange={handleFiltersChange}
              showApply
              onApply={() => setFilterSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
