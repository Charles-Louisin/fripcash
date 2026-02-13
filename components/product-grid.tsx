"use client";

import { useState } from "react";
import {
  ProductCard,
  ProductCardSkeleton,
  type Product,
} from "@/components/product-card";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

// Mock products with real clothing images
const allProducts: Product[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    brand: "Nike",
    condition: "Neuf sans étiquette",
    price: 43.0,
    priceWithShipping: 45.85,
    favorites: 19,
    href: "/article/1",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=400&fit=crop",
    brand: "Hipsline",
    condition: "Très bon état",
    price: 15.0,
    priceWithShipping: 16.45,
    favorites: 15,
    href: "/article/2",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
    brand: "Lefties",
    condition: "Très bon état",
    size: "14 ans / 164 cm",
    price: 25.0,
    priceWithShipping: 26.95,
    favorites: 15,
    href: "/article/3",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    brand: "H&M",
    condition: "Neuf avec étiquette",
    price: 39.0,
    priceWithShipping: 41.65,
    favorites: 25,
    href: "/article/4",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    brand: "Everybodys golf",
    condition: "Très bon état",
    price: 8.0,
    priceWithShipping: 9.1,
    favorites: 21,
    href: "/article/5",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    brand: "Zara",
    condition: "Bon état",
    size: "L / 42",
    price: 12.0,
    priceWithShipping: 13.45,
    favorites: 8,
    href: "/article/6",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop",
    brand: "Adidas",
    condition: "Très bon état",
    size: "M / 38",
    price: 22.0,
    priceWithShipping: 24.5,
    favorites: 32,
    href: "/article/7",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=400&h=400&fit=crop",
    brand: "Pull & Bear",
    condition: "Neuf sans étiquette",
    price: 18.0,
    priceWithShipping: 19.95,
    favorites: 11,
    href: "/article/8",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=400&fit=crop",
    brand: "Mango",
    condition: "Bon état",
    size: "S / 36",
    price: 14.0,
    priceWithShipping: 15.85,
    favorites: 6,
    href: "/article/9",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
    brand: "Levi's",
    condition: "Très bon état",
    price: 35.0,
    priceWithShipping: 37.45,
    favorites: 42,
    href: "/article/10",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    brand: "Lacoste",
    condition: "Très bon état",
    size: "M / 38",
    price: 30.0,
    priceWithShipping: 32.95,
    favorites: 18,
    href: "/article/11",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop",
    brand: "Reebok",
    condition: "Neuf sans étiquette",
    size: "42",
    price: 55.0,
    priceWithShipping: 58.45,
    favorites: 14,
    href: "/article/12",
  },
  {
    id: 13,
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=400&fit=crop",
    brand: "Bershka",
    condition: "Bon état",
    size: "S / 36",
    price: 10.0,
    priceWithShipping: 12.45,
    favorites: 4,
    href: "/article/13",
  },
  {
    id: 14,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    brand: "Puma",
    condition: "Neuf avec étiquette",
    size: "44",
    price: 75.0,
    priceWithShipping: 78.5,
    favorites: 27,
    href: "/article/14",
  },
  {
    id: 15,
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop",
    brand: "Diesel",
    condition: "Très bon état",
    size: "L / 42",
    price: 48.0,
    priceWithShipping: 51.45,
    favorites: 20,
    href: "/article/15",
  },
  {
    id: 16,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop",
    brand: "Ralph Lauren",
    condition: "Neuf sans étiquette",
    size: "M / 38",
    price: 65.0,
    priceWithShipping: 68.5,
    favorites: 33,
    href: "/article/16",
  },
  {
    id: 17,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop",
    brand: "Gap",
    condition: "Bon état",
    price: 16.0,
    priceWithShipping: 18.45,
    favorites: 9,
    href: "/article/17",
  },
  {
    id: 18,
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=400&h=400&fit=crop",
    brand: "Gucci",
    condition: "Très bon état",
    price: 180.0,
    priceWithShipping: 184.5,
    favorites: 56,
    href: "/article/18",
  },
  {
    id: 19,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
    brand: "ASOS",
    condition: "Neuf avec étiquette",
    size: "S / 36",
    price: 24.0,
    priceWithShipping: 26.95,
    favorites: 12,
    href: "/article/19",
  },
  {
    id: 20,
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop",
    brand: "The North Face",
    condition: "Très bon état",
    size: "XL / 44",
    price: 95.0,
    priceWithShipping: 98.5,
    favorites: 38,
    href: "/article/20",
  },
];

export function ProductGrid() {
  const [page, setPage] = useState(1);
  const isLoading = false;

  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentProducts = allProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Pagination */}
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
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Page suivante"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
