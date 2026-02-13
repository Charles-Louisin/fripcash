"use client";

import { useRef } from "react";
import { ProductCard, type Product } from "@/components/product-card";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const newProducts: Product[] = [
  {
    id: 101,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    brand: "Calvin Klein",
    condition: "Neuf avec étiquette",
    price: 55.0,
    priceWithShipping: 57.95,
    favorites: 3,
    href: "/article/101",
  },
  {
    id: 102,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
    brand: "Uniqlo",
    condition: "Neuf sans étiquette",
    size: "M / 38",
    price: 19.0,
    priceWithShipping: 21.45,
    favorites: 1,
    href: "/article/102",
  },
  {
    id: 103,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    brand: "New Balance",
    condition: "Neuf avec étiquette",
    size: "43",
    price: 89.0,
    priceWithShipping: 92.5,
    favorites: 7,
    href: "/article/103",
  },
  {
    id: 104,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop",
    brand: "Guess",
    condition: "Neuf sans étiquette",
    price: 34.0,
    priceWithShipping: 36.85,
    favorites: 2,
    href: "/article/104",
  },
  {
    id: 105,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    brand: "Champion",
    condition: "Neuf avec étiquette",
    size: "L / 42",
    price: 28.0,
    priceWithShipping: 30.45,
    favorites: 5,
    href: "/article/105",
  },
  {
    id: 106,
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
    brand: "Converse",
    condition: "Neuf avec étiquette",
    size: "41",
    price: 62.0,
    priceWithShipping: 65.5,
    favorites: 4,
    href: "/article/106",
  },
  {
    id: 107,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
    brand: "Tommy Hilfiger",
    condition: "Neuf sans étiquette",
    size: "S / 36",
    price: 45.0,
    priceWithShipping: 47.95,
    favorites: 6,
    href: "/article/107",
  },
  {
    id: 108,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    brand: "Michael Kors",
    condition: "Neuf avec étiquette",
    price: 120.0,
    priceWithShipping: 123.5,
    favorites: 9,
    href: "/article/108",
  },
];

export function NewProductsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header with arrows */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Nouveautés
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Les derniers articles ajoutés sur FripCash
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Précédent"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Suivant"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {newProducts.map((product) => (
          <div
            key={product.id}
            className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
