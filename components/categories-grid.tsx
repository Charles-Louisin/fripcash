"use client";

import Link from "next/link";

const categories = [
  {
    label: "Femme",
    href: "/femme",
    area: "women",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=800&fit=crop",
  },
  {
    label: "Homme",
    href: "/homme",
    area: "men",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
  },
  {
    label: "Enfant",
    href: "/enfant",
    area: "kids",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=400&fit=crop",
  },
  {
    label: "Maison",
    href: "/maison",
    area: "home",
    image:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=500&fit=crop",
  },
  {
    label: "Électronique",
    href: "/electronique",
    area: "electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
  },
  {
    label: "Sport",
    href: "/sport",
    area: "sport",
    image:
      "https://images.unsplash.com/photo-1461896836934-bd45ba9b64f0?w=600&h=400&fit=crop",
  },
];

export function CategoriesGrid() {
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
            "women men sport"
            "women kids home"
            "electronics kids home"
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
            "women women"
            "men sport"
            "kids home"
            "electronics electronics"
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
  cat: (typeof categories)[number];
}) {
  return (
    <Link
      href={cat.href}
      className="relative flex items-end overflow-hidden p-4 bg-cover bg-center group"
      style={{
        gridArea: cat.area,
        backgroundImage: `url(${cat.image})`,
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      {/* Label */}
      <span className="relative z-10 text-white font-semibold text-sm sm:text-base md:text-lg drop-shadow-md">
        {cat.label}
      </span>
    </Link>
  );
}
