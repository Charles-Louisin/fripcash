"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { useMe } from "@/hooks/use-auth";
import { CartSheet } from "@/components/cart-sheet";
import {
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  // FiGlobe, // translate button commented
  FiBell,
  FiHeart,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import {
  GiDress,
  GiPoloShirt,
  GiBabyFace,
  GiSofa,
  GiCircuitry,
  GiBookshelf,
  GiTennisBall,
  GiGamepad,
} from "react-icons/gi";
import { useCategories } from "@/hooks/use-categories";
import { useFavorites } from "@/hooks/use-favorites";

/* ─── Category types ─── */

type SubGroup = { label: string; items: { label: string; href: string }[] };
type Category = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subGroups: SubGroup[];
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Femme: GiDress,
  Homme: GiPoloShirt,
  Enfant: GiBabyFace,
  Maison: GiSofa,
  Électronique: GiCircuitry,
  Loisirs: GiBookshelf,
  Sport: GiTennisBall,
  Divertissement: GiGamepad,
};

function buildFilterHref(category: string, subCategory?: string, itemType?: string): string {
  const params = new URLSearchParams();
  params.set("category", category);
  if (subCategory) params.set("subCategory", subCategory);
  if (itemType) params.set("itemType", itemType);
  return `/produits?${params.toString()}`;
}

function mapDbCategories(raw: any[]): Category[] {
  return raw.map((cat: any) => ({
    label: cat.name,
    href: buildFilterHref(cat.name),
    icon: ICON_MAP[cat.name] || GiBookshelf,
    subGroups: (cat.subGroups || []).map((sg: any) => ({
      label: sg.name,
      items: [
        { label: "Voir tout", href: buildFilterHref(cat.name, sg.name) },
        ...(sg.items || []).map((it: any) => ({
          label: it.name,
          href: buildFilterHref(cat.name, sg.name, it.name),
        })),
      ],
    })),
  }));
}

export function Header() {
  const openSheet = useUIStore((state) => state.openSheet);
  const { openCart, itemCount } = useCartStore();
  const { data: user } = useMe();
  const { data: rawCategories = [] } = useCategories();
  const categories = mapDbCategories(rawCategories);
  const navCategories = categories.map((c) => ({ label: c.label, href: c.href }));
  const isLoggedIn = !!user;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? itemCount() : 0;
  const { data: favorites = [] } = useFavorites();
  const favoritesCount = mounted && isLoggedIn ? favorites.length : 0;
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeSubGroup, setActiveSubGroup] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"articles" | "membres">("articles");
  const [searchDropOpen, setSearchDropOpen] = useState(false);
  const searchDropRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (searchMode === "articles") {
      router.push(`/produits?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/produits?q=${encodeURIComponent(q)}&type=membres`);
    }
    setSearchQuery("");
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchDropRef.current && !searchDropRef.current.contains(e.target as Node)) {
        setSearchDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMega = (catLabel: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveCat(catLabel);
    const cat = categories.find((c) => c.label === catLabel);
    if (cat && cat.subGroups.length > 0) {
      setActiveSubGroup(cat.subGroups[0].label);
    }
  };

  const closeMega = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveCat(null);
      setActiveSubGroup(null);
    }, 150);
  };

  const keepOpen = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  const currentCat = categories.find((c) => c.label === activeCat);
  const currentSubGroup = currentCat?.subGroups.find(
    (sg) => sg.label === activeSubGroup
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      {/* ═══════════════════════════════════════════
          DESKTOP top bar (lg+)
          ═══════════════════════════════════════════ */}
      <div className="hidden lg:block border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 -my-12">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={500}
              height={500}
              className="h-36 w-auto"
              priority
            />
          </Link>

          {/* Search mode dropdown + Search bar */}
          <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-2xl">
            <div ref={searchDropRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSearchDropOpen(!searchDropOpen)}
                className="inline-flex items-center gap-1.5 text-sm font-medium h-9 px-3 rounded-l-md border border-r-0 border-input bg-background hover:bg-muted transition-colors"
              >
                {searchMode === "articles" ? "Articles" : "Membres"}
                <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${searchDropOpen ? "rotate-180" : ""}`} />
              </button>
              {searchDropOpen && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => { setSearchMode("articles"); setSearchDropOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${searchMode === "articles" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    Articles
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchMode("membres"); setSearchDropOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${searchMode === "membres" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    Membres
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode === "articles" ? "Rechercher des articles" : "Rechercher des membres"}
                className="pl-9 h-9 bg-muted/50 border-input rounded-l-none"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {isLoggedIn ? (
              <>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm"
                  asChild
                >
                  <Link href="/dashboard/articles">Vends tes articles</Link>
                </Button>

                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href="/dashboard/messages">
                    <FiBell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="icon-sm" className="relative" asChild>
                  <Link href="/dashboard/favoris">
                    <FiHeart className="h-5 w-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {favoritesCount > 99 ? "99+" : favoritesCount}
                      </span>
                    )}
                    <span className="sr-only">Favoris</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                  onClick={openCart}
                >
                  <FiShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                  <span className="sr-only">Panier</span>
                </Button>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground overflow-hidden"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.pseudo || user.firstName || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser className="h-4 w-4" />
                  )}
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium"
                  asChild
                >
                  <Link href="/connexion">S&apos;inscrire | Se connecter</Link>
                </Button>

                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm"
                  asChild
                >
                  <Link href="/inscription">Vends tes articles</Link>
                </Button>

                <Button variant="ghost" size="icon-sm" className="relative" asChild>
                  <Link href="/dashboard/favoris">
                    <FiHeart className="h-5 w-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {favoritesCount > 99 ? "99+" : favoritesCount}
                      </span>
                    )}
                    <span className="sr-only">Favoris</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                  onClick={openCart}
                >
                  <FiShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                  <span className="sr-only">Panier</span>
                </Button>
              </>
            )}

            {/* Translate button - commented for now
            <Button
              variant="ghost"
              size="sm"
              className="items-center gap-1 text-sm"
            >
              <FiGlobe className="h-4 w-4" />
              FR
              <FiChevronDown className="h-3 w-3" />
            </Button>
            */}
          </div>
        </div>
      </div>

      {/* Desktop category bar with hover mega menu */}
      <div className="hidden lg:block border-b relative">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {categories.map((cat) => (
              <button
                key={cat.href}
                onMouseEnter={() => openMega(cat.label)}
                onMouseLeave={closeMega}
                className={`whitespace-nowrap px-3 py-1.5 text-sm transition-colors rounded-md ${
                  activeCat === cat.label
                    ? "text-foreground font-medium underline underline-offset-[6px] decoration-primary decoration-2"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mega dropdown */}
        {activeCat && currentCat && (
          <div
            className="absolute left-0 right-0 top-full bg-background border-b shadow-lg z-50"
            onMouseEnter={keepOpen}
            onMouseLeave={closeMega}
          >
            <div className="container mx-auto px-4 py-6 flex gap-0 min-h-[300px]">
              {/* Left: sub-group sidebar */}
              <div className="w-56 border-r pr-4 shrink-0 space-y-0.5">
                <Link
                  href={currentCat.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors mb-1"
                >
                  Voir tout
                </Link>
                {currentCat.subGroups.map((sg) => {
                  const isActive = activeSubGroup === sg.label;
                  return (
                    <button
                      key={sg.label}
                      onMouseEnter={() => setActiveSubGroup(sg.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {sg.label}
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Right: items grid for active sub-group */}
              <div className="flex-1 pl-8">
                {currentSubGroup && (
                  <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                    {currentSubGroup.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline py-1.5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE / TABLET top bar (<lg)
          ═══════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Row 1: Logo left, icons right */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/" className="shrink-0 -my-10">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={500}
              height={500}
              className="h-32 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <FiBell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/dashboard/favoris">
                <FiHeart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
                <span className="sr-only">Favoris</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <FiShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground overflow-hidden"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.pseudo || user.firstName || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUser className="h-4 w-4" />
                )}
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openSheet("menu")}
              >
                <FiMenu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Search mode dropdown + Search bar */}
        <form onSubmit={handleSearch} className="flex items-center px-4 py-2 border-b">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSearchDropOpen(!searchDropOpen)}
              className="inline-flex items-center gap-1 text-sm font-medium h-9 px-3 rounded-l-md border border-r-0 border-input bg-background hover:bg-muted transition-colors"
            >
              {searchMode === "articles" ? "Articles" : "Membres"}
              <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${searchDropOpen ? "rotate-180" : ""}`} />
            </button>
            {searchDropOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => { setSearchMode("articles"); setSearchDropOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${searchMode === "articles" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  Articles
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchMode("membres"); setSearchDropOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${searchMode === "membres" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  Membres
                </button>
              </div>
            )}
          </div>

          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === "articles" ? "Rechercher des articles" : "Rechercher des membres"}
              className="pl-9 h-9 bg-muted/50 border-input rounded-l-none"
            />
          </div>
        </form>

        {/* Row 3: Horizontal scrollable category pills */}
        <div className="border-b">
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
            <Link
              href="/voir-tout"
              className="whitespace-nowrap px-3 py-1.5 text-sm rounded-full border border-primary text-primary font-medium transition-colors"
            >
              Voir tout
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="whitespace-nowrap px-3 py-1.5 text-sm rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Cart drawer */}
      <CartSheet />
    </header>
  );
}
