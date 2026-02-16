"use client";

import { useRef } from "react";
import { ProductCard, ProductCardSkeleton, type Product } from "@/components/product-card";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useArticles } from "@/hooks/use-articles";

function mapArticleToProduct(article: any): Product {
  return {
    id: article._id,
    image: article.images?.[0] || "",
    brand: article.brand || article.title || "Article",
    condition: article.condition || "",
    size: article.size,
    price: article.price || 0,
    priceWithShipping: (article.price || 0) + (article.shippingCost || 0),
    favorites: article.favoritesCount || 0,
    href: `/article/${article._id}`,
    category: article.category,
  };
}

export function NewProductsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useArticles({
    sort: "-createdAt",
    limit: 12,
    status: "active",
  });

  const newProducts = (data?.data || []).map(mapArticleToProduct);

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
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0 snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : newProducts.length > 0
            ? newProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))
            : (
              <p className="text-sm text-muted-foreground py-8 w-full text-center">
                Aucun nouvel article pour le moment.
              </p>
            )
        }
      </div>
    </section>
  );
}
