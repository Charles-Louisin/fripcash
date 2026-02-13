"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { ProductCard, type Product } from "@/components/product-card";
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

/* ─── Mock data (30 products) ─── */

const allProducts: Product[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", brand: "Nike", condition: "Neuf sans étiquette", price: 43, priceWithShipping: 45.85, favorites: 19, href: "/article/1", category: "Sport", size: "M" },
  { id: 2, image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=400&fit=crop", brand: "Hipsline", condition: "Très bon état", price: 15, priceWithShipping: 16.45, favorites: 15, href: "/article/2", category: "Femme", size: "S" },
  { id: 3, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop", brand: "Lefties", condition: "Très bon état", size: "14 ans / 164 cm", price: 25, priceWithShipping: 26.95, favorites: 15, href: "/article/3", category: "Enfant" },
  { id: 4, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", brand: "H&M", condition: "Neuf avec étiquette", price: 39, priceWithShipping: 41.65, favorites: 25, href: "/article/4", category: "Femme", size: "M" },
  { id: 5, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", brand: "Everybodys golf", condition: "Très bon état", price: 8, priceWithShipping: 9.1, favorites: 21, href: "/article/5", category: "Sport" },
  { id: 6, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", brand: "Zara", condition: "Bon état", size: "L", price: 12, priceWithShipping: 13.45, favorites: 8, href: "/article/6", category: "Homme" },
  { id: 7, image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop", brand: "Adidas", condition: "Très bon état", size: "M", price: 22, priceWithShipping: 24.5, favorites: 32, href: "/article/7", category: "Sport" },
  { id: 8, image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=400&h=400&fit=crop", brand: "Pull & Bear", condition: "Neuf sans étiquette", price: 18, priceWithShipping: 19.95, favorites: 11, href: "/article/8", category: "Homme", size: "M" },
  { id: 9, image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=400&fit=crop", brand: "Mango", condition: "Bon état", size: "S", price: 14, priceWithShipping: 15.85, favorites: 6, href: "/article/9", category: "Femme" },
  { id: 10, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop", brand: "Levi's", condition: "Très bon état", price: 35, priceWithShipping: 37.45, favorites: 42, href: "/article/10", category: "Homme", size: "L" },
  { id: 11, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", brand: "Lacoste", condition: "Très bon état", size: "M", price: 30, priceWithShipping: 32.95, favorites: 18, href: "/article/11", category: "Homme" },
  { id: 12, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop", brand: "Reebok", condition: "Neuf sans étiquette", size: "42", price: 55, priceWithShipping: 58.45, favorites: 14, href: "/article/12", category: "Sport" },
  { id: 13, image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=400&fit=crop", brand: "Bershka", condition: "Bon état", size: "S", price: 10, priceWithShipping: 12.45, favorites: 4, href: "/article/13", category: "Femme" },
  { id: 14, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", brand: "Puma", condition: "Neuf avec étiquette", size: "44", price: 75, priceWithShipping: 78.5, favorites: 27, href: "/article/14", category: "Sport" },
  { id: 15, image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop", brand: "Diesel", condition: "Très bon état", size: "L", price: 48, priceWithShipping: 51.45, favorites: 20, href: "/article/15", category: "Homme" },
  { id: 16, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop", brand: "Ralph Lauren", condition: "Neuf sans étiquette", size: "M", price: 65, priceWithShipping: 68.5, favorites: 33, href: "/article/16", category: "Homme" },
  { id: 17, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop", brand: "Gap", condition: "Bon état", price: 16, priceWithShipping: 18.45, favorites: 9, href: "/article/17", category: "Enfant" },
  { id: 18, image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=400&h=400&fit=crop", brand: "Gucci", condition: "Très bon état", price: 180, priceWithShipping: 184.5, favorites: 56, href: "/article/18", category: "Femme" },
  { id: 19, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", brand: "ASOS", condition: "Neuf avec étiquette", size: "S", price: 24, priceWithShipping: 26.95, favorites: 12, href: "/article/19", category: "Femme" },
  { id: 20, image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop", brand: "The North Face", condition: "Très bon état", size: "XL", price: 95, priceWithShipping: 98.5, favorites: 38, href: "/article/20", category: "Sport" },
  { id: 21, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", brand: "Sony", condition: "Bon état", price: 45, priceWithShipping: 48.5, favorites: 22, href: "/article/21", category: "Électronique" },
  { id: 22, image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=400&fit=crop", brand: "IKEA", condition: "Très bon état", price: 28, priceWithShipping: 32.45, favorites: 7, href: "/article/22", category: "Maison" },
  { id: 23, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop", brand: "Samsung", condition: "Neuf sans étiquette", price: 120, priceWithShipping: 124.5, favorites: 31, href: "/article/23", category: "Électronique" },
  { id: 24, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", brand: "Monopoly", condition: "Très bon état", price: 12, priceWithShipping: 15.95, favorites: 5, href: "/article/24", category: "Loisirs" },
  { id: 25, image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=400&fit=crop", brand: "Petit Bateau", condition: "Neuf avec étiquette", size: "4 ans", price: 15, priceWithShipping: 18.45, favorites: 10, href: "/article/25", category: "Enfant" },
  { id: 26, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", brand: "Gallimard", condition: "Bon état", price: 6, priceWithShipping: 9.5, favorites: 3, href: "/article/26", category: "Divertissement" },
  { id: 27, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop", brand: "Apple", condition: "Très bon état", price: 250, priceWithShipping: 255, favorites: 48, href: "/article/27", category: "Électronique" },
  { id: 28, image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&h=400&fit=crop", brand: "Maisons du Monde", condition: "Bon état", price: 55, priceWithShipping: 62.5, favorites: 13, href: "/article/28", category: "Maison" },
  { id: 29, image: "https://images.unsplash.com/photo-1461896836934-bd45ba9b64f0?w=400&h=400&fit=crop", brand: "Decathlon", condition: "Neuf sans étiquette", size: "L", price: 20, priceWithShipping: 23.95, favorites: 16, href: "/article/29", category: "Sport" },
  { id: 30, image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop", brand: "PlayStation", condition: "Très bon état", price: 35, priceWithShipping: 39.5, favorites: 24, href: "/article/30", category: "Divertissement" },
];

/* ─── Sorting ─── */

type SortOption = "recent" | "price_asc" | "price_desc" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Plus récent" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "popular", label: "Popularité" },
];

const ITEMS_PER_PAGE = 12;

/* ─── Page ─── */

export default function ProduitsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Filter
  const filtered = useMemo(() => {
    let items = [...allProducts];

    if (filters.categories.length > 0) {
      items = items.filter((p) =>
        filters.categories.includes(p.category ?? "")
      );
    }
    if (filters.conditions.length > 0) {
      items = items.filter((p) => filters.conditions.includes(p.condition));
    }
    if (filters.sizes.length > 0) {
      items = items.filter((p) =>
        p.size ? filters.sizes.some((s) => p.size!.toUpperCase().includes(s)) : false
      );
    }
    if (filters.minPrice) {
      items = items.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      items = items.filter((p) => p.price <= Number(filters.maxPrice));
    }

    return items;
  }, [filters]);

  // Sort
  const sorted = useMemo(() => {
    const items = [...filtered];
    switch (sort) {
      case "price_asc":
        return items.sort((a, b) => a.price - b.price);
      case "price_desc":
        return items.sort((a, b) => b.price - a.price);
      case "popular":
        return items.sort((a, b) => b.favorites - a.favorites);
      default:
        return items;
    }
  }, [filtered, sort]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentProducts = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters/sort change
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
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Produits</span>
          </nav>

          <div className="flex gap-8">
            {/* ─── Desktop sidebar ─── */}
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

            {/* ─── Main content ─── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar: count left, sort right */}
              <div className="flex items-center justify-between mb-6 gap-2">
                {/* Article count in green */}
                <p className="text-sm whitespace-nowrap">
                  <span className="font-bold text-primary">
                    {sorted.length}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    article{sorted.length !== 1 ? "s" : ""}
                  </span>
                </p>

                {/* Filter + Sort (right side) */}
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
              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    Aucun article trouvé
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
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
