"use client";

import { useState } from "react";
import {
  ProductCard,
  ProductCardSkeleton,
  type Product,
} from "@/components/product-card";
import { useArticles } from "@/hooks/use-articles";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

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

export function ProductGrid() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useArticles({
    page,
    limit: ITEMS_PER_PAGE,
    status: "active",
  });

  const articles = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const products = articles.map(mapArticleToProduct);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-sm text-muted-foreground">Aucun article disponible pour le moment</p>
              </div>
            )
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Page suivante"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
