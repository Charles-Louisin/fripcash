"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { CartSheet } from "@/components/cart-sheet";
import {
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiChevronRight,
  FiGlobe,
  FiBell,
  FiHeart,
  FiShoppingBag,
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

/* ─── Category data with subcategories ─── */

type SubGroup = { label: string; items: { label: string; href: string }[] };
type Category = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subGroups: SubGroup[];
};

const categories: Category[] = [
  {
    label: "Femme",
    href: "/femme",
    icon: GiDress,
    subGroups: [
      {
        label: "Vêtements",
        items: [
          { label: "Voir tout", href: "/femme/vetements" },
          { label: "Robes", href: "/femme/robes" },
          { label: "Hauts et t-shirts", href: "/femme/hauts" },
          { label: "Pantalons et leggings", href: "/femme/pantalons" },
          { label: "Jupes", href: "/femme/jupes" },
          { label: "Jeans", href: "/femme/jeans" },
          { label: "Sweats et sweats à capuche", href: "/femme/sweats" },
          { label: "Manteaux et vestes", href: "/femme/manteaux" },
          { label: "Blazers et tailleurs", href: "/femme/blazers" },
          { label: "Shorts", href: "/femme/shorts" },
          { label: "Maillots de bain", href: "/femme/maillots" },
          { label: "Lingerie et pyjamas", href: "/femme/lingerie" },
          { label: "Vêtements de sport", href: "/femme/sport" },
          { label: "Maternité", href: "/femme/maternite" },
        ],
      },
      {
        label: "Chaussures",
        items: [
          { label: "Voir tout", href: "/femme/chaussures" },
          { label: "Baskets", href: "/femme/baskets" },
          { label: "Sandales", href: "/femme/sandales" },
          { label: "Talons", href: "/femme/talons" },
          { label: "Bottes", href: "/femme/bottes" },
        ],
      },
      {
        label: "Sacs",
        items: [
          { label: "Voir tout", href: "/femme/sacs" },
          { label: "Sacs à main", href: "/femme/sacs-a-main" },
          { label: "Sacs à dos", href: "/femme/sacs-a-dos" },
        ],
      },
      {
        label: "Accessoires",
        items: [
          { label: "Voir tout", href: "/femme/accessoires" },
          { label: "Bijoux", href: "/femme/bijoux" },
          { label: "Ceintures", href: "/femme/ceintures" },
          { label: "Lunettes", href: "/femme/lunettes" },
        ],
      },
      {
        label: "Beauté",
        items: [
          { label: "Voir tout", href: "/femme/beaute" },
          { label: "Maquillage", href: "/femme/maquillage" },
          { label: "Soins", href: "/femme/soins" },
          { label: "Parfums", href: "/femme/parfums" },
        ],
      },
    ],
  },
  {
    label: "Homme",
    href: "/homme",
    icon: GiPoloShirt,
    subGroups: [
      {
        label: "Vêtements",
        items: [
          { label: "Voir tout", href: "/homme/vetements" },
          { label: "T-shirts et polos", href: "/homme/tshirts" },
          { label: "Chemises", href: "/homme/chemises" },
          { label: "Pantalons", href: "/homme/pantalons" },
          { label: "Jeans", href: "/homme/jeans" },
          { label: "Sweats et hoodies", href: "/homme/sweats" },
          { label: "Vestes et manteaux", href: "/homme/vestes" },
          { label: "Costumes", href: "/homme/costumes" },
          { label: "Shorts", href: "/homme/shorts" },
        ],
      },
      {
        label: "Chaussures",
        items: [
          { label: "Voir tout", href: "/homme/chaussures" },
          { label: "Baskets", href: "/homme/baskets" },
          { label: "Chaussures de ville", href: "/homme/ville" },
          { label: "Bottes", href: "/homme/bottes" },
        ],
      },
      {
        label: "Accessoires",
        items: [
          { label: "Voir tout", href: "/homme/accessoires" },
          { label: "Montres", href: "/homme/montres" },
          { label: "Ceintures", href: "/homme/ceintures" },
          { label: "Sacs", href: "/homme/sacs" },
        ],
      },
    ],
  },
  {
    label: "Enfant",
    href: "/enfant",
    icon: GiBabyFace,
    subGroups: [
      {
        label: "Fille",
        items: [
          { label: "Voir tout", href: "/enfant/fille" },
          { label: "Robes", href: "/enfant/fille/robes" },
          { label: "Hauts", href: "/enfant/fille/hauts" },
          { label: "Pantalons", href: "/enfant/fille/pantalons" },
        ],
      },
      {
        label: "Garçon",
        items: [
          { label: "Voir tout", href: "/enfant/garcon" },
          { label: "T-shirts", href: "/enfant/garcon/tshirts" },
          { label: "Pantalons", href: "/enfant/garcon/pantalons" },
          { label: "Sweats", href: "/enfant/garcon/sweats" },
        ],
      },
      {
        label: "Bébé",
        items: [
          { label: "Voir tout", href: "/enfant/bebe" },
          { label: "Bodies", href: "/enfant/bebe/bodies" },
          { label: "Pyjamas", href: "/enfant/bebe/pyjamas" },
        ],
      },
      {
        label: "Chaussures",
        items: [
          { label: "Voir tout", href: "/enfant/chaussures" },
        ],
      },
    ],
  },
  {
    label: "Maison",
    href: "/maison",
    icon: GiSofa,
    subGroups: [
      {
        label: "Décoration",
        items: [
          { label: "Voir tout", href: "/maison/decoration" },
          { label: "Coussins", href: "/maison/coussins" },
          { label: "Cadres", href: "/maison/cadres" },
          { label: "Bougies", href: "/maison/bougies" },
        ],
      },
      {
        label: "Linge de maison",
        items: [
          { label: "Voir tout", href: "/maison/linge" },
          { label: "Draps", href: "/maison/draps" },
          { label: "Serviettes", href: "/maison/serviettes" },
        ],
      },
      {
        label: "Cuisine",
        items: [
          { label: "Voir tout", href: "/maison/cuisine" },
          { label: "Vaisselle", href: "/maison/vaisselle" },
          { label: "Ustensiles", href: "/maison/ustensiles" },
        ],
      },
    ],
  },
  {
    label: "Électronique",
    href: "/electronique",
    icon: GiCircuitry,
    subGroups: [
      {
        label: "Téléphones",
        items: [
          { label: "Voir tout", href: "/electronique/telephones" },
          { label: "Smartphones", href: "/electronique/smartphones" },
          { label: "Coques et accessoires", href: "/electronique/coques" },
        ],
      },
      {
        label: "Informatique",
        items: [
          { label: "Voir tout", href: "/electronique/informatique" },
          { label: "Ordinateurs portables", href: "/electronique/portables" },
          { label: "Tablettes", href: "/electronique/tablettes" },
          { label: "Accessoires", href: "/electronique/accessoires" },
        ],
      },
      {
        label: "Audio & Photo",
        items: [
          { label: "Voir tout", href: "/electronique/audio" },
          { label: "Écouteurs", href: "/electronique/ecouteurs" },
          { label: "Enceintes", href: "/electronique/enceintes" },
          { label: "Appareils photo", href: "/electronique/photo" },
        ],
      },
    ],
  },
  {
    label: "Loisirs",
    href: "/loisirs",
    icon: GiBookshelf,
    subGroups: [
      {
        label: "Jeux & Jouets",
        items: [
          { label: "Voir tout", href: "/loisirs/jeux" },
          { label: "Jeux de société", href: "/loisirs/jeux-societe" },
          { label: "Puzzles", href: "/loisirs/puzzles" },
          { label: "Figurines", href: "/loisirs/figurines" },
        ],
      },
      {
        label: "Collections",
        items: [
          { label: "Voir tout", href: "/loisirs/collections" },
          { label: "Vinyles", href: "/loisirs/vinyles" },
          { label: "Cartes", href: "/loisirs/cartes" },
        ],
      },
      {
        label: "Loisirs créatifs",
        items: [
          { label: "Voir tout", href: "/loisirs/creatifs" },
        ],
      },
    ],
  },
  {
    label: "Sport",
    href: "/sport",
    icon: GiTennisBall,
    subGroups: [
      {
        label: "Vêtements de sport",
        items: [
          { label: "Voir tout", href: "/sport/vetements" },
          { label: "Running", href: "/sport/running" },
          { label: "Fitness", href: "/sport/fitness" },
          { label: "Football", href: "/sport/football" },
        ],
      },
      {
        label: "Chaussures de sport",
        items: [
          { label: "Voir tout", href: "/sport/chaussures" },
        ],
      },
      {
        label: "Équipement",
        items: [
          { label: "Voir tout", href: "/sport/equipement" },
          { label: "Vélos", href: "/sport/velos" },
          { label: "Accessoires", href: "/sport/accessoires" },
        ],
      },
    ],
  },
  {
    label: "Divertissement",
    href: "/divertissement",
    icon: GiGamepad,
    subGroups: [
      {
        label: "Livres",
        items: [
          { label: "Voir tout", href: "/divertissement/livres" },
          { label: "Romans", href: "/divertissement/romans" },
          { label: "BD & Mangas", href: "/divertissement/bd-mangas" },
          { label: "Manuels scolaires", href: "/divertissement/manuels" },
        ],
      },
      {
        label: "Musique & Films",
        items: [
          { label: "Voir tout", href: "/divertissement/musique-films" },
          { label: "CD & Vinyles", href: "/divertissement/cd-vinyles" },
          { label: "DVD & Blu-ray", href: "/divertissement/dvd" },
        ],
      },
      {
        label: "Jeux vidéo",
        items: [
          { label: "Voir tout", href: "/divertissement/jeux-video" },
          { label: "Consoles", href: "/divertissement/consoles" },
          { label: "Jeux", href: "/divertissement/jeux" },
        ],
      },
    ],
  },
];

/* ─── Simple nav list for pills ─── */
const navCategories = categories.map((c) => ({ label: c.label, href: c.href }));

export function Header() {
  const openSheet = useUIStore((state) => state.openSheet);
  const { openCart, itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? itemCount() : 0;
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeSubGroup, setActiveSubGroup] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={500}
              height={500}
              className="h-28 w-auto"
              priority
            />
          </Link>

          {/* Articles link + Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <Link
              href="/produits"
              className="inline-flex items-center gap-1 shrink-0 text-sm font-medium h-9 px-3 rounded-md border border-input bg-background hover:bg-muted transition-colors"
            >
              Articles
              <FiChevronDown className="h-4 w-4" />
            </Link>

            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des articles"
                className="pl-9 h-9 bg-muted/50 border-input"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
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

            <Button
              variant="ghost"
              size="sm"
              className="items-center gap-1 text-sm"
            >
              <FiGlobe className="h-4 w-4" />
              FR
              <FiChevronDown className="h-3 w-3" />
            </Button>
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
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo.png"
              alt="FripCash"
              width={500}
              height={500}
              className="h-24 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <FiBell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <Button variant="ghost" size="icon">
              <FiHeart className="h-5 w-5" />
              <span className="sr-only">Favoris</span>
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => openSheet("menu")}
            >
              <FiMenu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Articles link + Search bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Link
            href="/produits"
            className="inline-flex items-center gap-1 shrink-0 text-sm font-medium h-9 px-3 rounded-md border border-input bg-background hover:bg-muted transition-colors"
          >
            Articles
            <FiChevronDown className="h-4 w-4" />
          </Link>

          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des articles"
              className="pl-9 h-9 bg-muted/50 border-input"
            />
          </div>
        </div>

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
