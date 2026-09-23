"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";

const AREA_MAP: Record<string, string> = {
  Femme: "women",
  Homme: "men",
  Enfant: "kids",
  Maison: "home",
  Électronique: "electronics",
  Sport: "sport",
  Mode: "mode",
  Enseignes: "enseignes",
};

export function CategoriesGrid() {
  const { data: rawCategories = [] } = useCategories();

  // Only categories with a seeded Cloudinary imageUrl from the API.
  const categories = rawCategories
    .filter((cat: { image?: string }) => !!cat.image)
    .slice(0, 6)
    .map((cat: { name: string; slug?: string; image?: string }) => ({
      label: cat.name,
      href: `/produits?category=${encodeURIComponent(cat.name)}`,
      area:
        AREA_MAP[cat.name] ||
        cat.slug ||
        cat.name.toLowerCase().replace(/[^a-z]/g, ""),
      image: cat.image as string,
    }));

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Explorer les catégories
      </h2>

      {/* Desktop grid */}
      <div
        className="hidden sm:grid gap-3"
        style={{
          gridTemplateColumns: "2fr 1fr 1fr",
          gridTemplateRows: "260px 180px 180px",
          gridTemplateAreas: `
            "${categories[0]?.area || "a"} ${categories[1]?.area || "b"} ${categories[5]?.area || "f"}"
            "${categories[0]?.area || "a"} ${categories[2]?.area || "c"} ${categories[3]?.area || "d"}"
            "${categories[4]?.area || "e"} ${categories[2]?.area || "c"} ${categories[3]?.area || "d"}"
          `,
        }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.area} cat={cat} />
        ))}
      </div>

      {/* Mobile grid */}
      <div
        className="grid sm:hidden gap-3"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "200px 140px 140px 140px",
          gridTemplateAreas: `
            "${categories[0]?.area || "a"} ${categories[0]?.area || "a"}"
            "${categories[1]?.area || "b"} ${categories[5]?.area || "f"}"
            "${categories[2]?.area || "c"} ${categories[3]?.area || "d"}"
            "${categories[4]?.area || "e"} ${categories[4]?.area || "e"}"
          `,
        }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.area} cat={cat} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({
  cat,
}: {
  cat: { label: string; href: string; area: string; image: string };
}) {
  return (
    <Link
      href={cat.href}
      className="relative overflow-hidden rounded-xl group"
      style={{ gridArea: cat.area }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cat.image}
        alt={cat.label}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <span className="absolute bottom-3 left-3 text-white font-semibold text-lg drop-shadow">
        {cat.label}
      </span>
    </Link>
  );
}
