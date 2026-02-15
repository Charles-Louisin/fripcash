"use client";

import { useState } from "react";
import { FiHeart, FiX } from "react-icons/fi";
import { mockUserFavorites, type UserFavorite } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function FavoritesPage() {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<UserFavorite[]>(mockUserFavorites);
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">("recent");

  const sorted = [...favorites].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
  });

  const handleRemove = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    showToast("Retiré des favoris", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes favoris</h1>
          <p className="text-sm text-muted-foreground mt-1">{favorites.length} article{favorites.length !== 1 ? "s" : ""} sauvegardé{favorites.length !== 1 ? "s" : ""}</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="recent">Plus récent</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Vous n&apos;avez pas encore de favoris</p>
          <p className="text-sm text-muted-foreground mt-1">Explorez les articles et ajoutez vos coups de coeur</p>
          <Link href="/produits" className="inline-block mt-4 h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors leading-10">
            Parcourir les articles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/article/${item.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground shadow-sm">
                    <FiHeart className="h-3.5 w-3.5" />
                    <span>{item.favorites}</span>
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{item.brand} <span className="text-muted-foreground font-normal"> · {item.condition}</span></p>
                  {item.size && <p className="text-xs text-muted-foreground">{item.size}</p>}
                  <p className="text-sm font-bold text-foreground">{item.price.toLocaleString("fr-FR")} GNF</p>
                </div>
              </Link>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                title="Retirer des favoris"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
