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
};

const FALLBACK_IMAGES: Record<string, string> = {
  Femme: "/images/woman.png",
  Homme: "/images/man.png",
  Enfant: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=400&fit=crop",
  Maison: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=500&fit=crop",
  Électronique: "/images/electronics.png",
  Sport: "/images/sports.png",
  Loisirs: "/images/hobbies.png",
  Divertissement: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
};

export function CategoriesGrid() {
  const { data: rawCategories = [] } = useCategories();

  const categories = rawCategories.slice(0, 6).map((cat: any) => ({
    label: cat.name,
    href: `/produits?category=${encodeURIComponent(cat.name)}`,
    area: AREA_MAP[cat.name] || cat.slug || cat.name.toLowerCase().replace(/[^a-z]/g, ""),
    image: cat.image || FALLBACK_IMAGES[cat.name] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
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
            "${categories[0]?.area || 'a'} ${categories[1]?.area || 'b'} ${categories[5]?.area || 'f'}"
            "${categories[0]?.area || 'a'} ${categories[2]?.area || 'c'} ${categories[3]?.area || 'd'}"
            "${categories[4]?.area || 'e'} ${categories[2]?.area || 'c'} ${categories[3]?.area || 'd'}"
          `,
        }}
      >
        {categories.map((cat: any) => (
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
            "${categories[0]?.area || 'a'} ${categories[0]?.area || 'a'}"
            "${categories[1]?.area || 'b'} ${categories[5]?.area || 'f'}"
            "${categories[2]?.area || 'c'} ${categories[3]?.area || 'd'}"
            "${categories[4]?.area || 'e'} ${categories[4]?.area || 'e'}"
          `,
        }}
      >
        {categories.map((cat: any) => (
          <CategoryCard key={cat.area} cat={cat} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ cat }: { cat: { label: string; href: string; area: string; image: string } }) {
  return (
    <Link
      href={cat.href}
      className="relative flex items-end overflow-hidden p-4 group"
      style={{ gridArea: cat.area }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${cat.image})` }}
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="relative z-10 text-white font-semibold text-sm sm:text-base md:text-lg drop-shadow-md">
        {cat.label}
      </span>
    </Link>
  );
}
