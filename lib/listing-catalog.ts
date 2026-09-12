/**
 * Platform listing catalog — mirrors Flutter `listing_catalog.dart`.
 * Admins manage this; sellers only pick from it.
 */

export type ListingSizeSchema =
  | "clothing"
  | "shoeEu"
  | "babyAge"
  | "oneSize"
  | "tvInches"
  | "phoneStorage"
  | "none";

export type ListingSubcategory = {
  id: string;
  label: string;
  sizeSchema: ListingSizeSchema;
};

export type ListingCategory = {
  id: string;
  label: string;
  enabled: boolean;
  defaultSizeSchema: ListingSizeSchema;
  subcategories: ListingSubcategory[];
};

export const sizeSchemaLabels: Record<ListingSizeSchema, string> = {
  clothing: "Tailles vêtements",
  shoeEu: "Pointures EU",
  babyAge: "Âge bébé",
  oneSize: "Taille unique",
  tvInches: "Pouces TV",
  phoneStorage: "Stockage",
  none: "Aucune",
};

export const SIZE_SCHEMAS: ListingSizeSchema[] = [
  "clothing",
  "shoeEu",
  "babyAge",
  "oneSize",
  "tvInches",
  "phoneStorage",
  "none",
];

/** Size option lists — same as Flutter. */
export const sizeOptions: Record<Exclude<ListingSizeSchema, "none">, string[]> = {
  clothing: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  shoeEu: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  babyAge: ["0-3 m", "3-6 m", "6-12 m", "12-18 m", "18-24 m", "2-3 ans", "3-4 ans"],
  oneSize: ["Unique"],
  tvInches: ["32\"", "40\"", "43\"", "50\"", "55\"", "65\"", "75\""],
  phoneStorage: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"],
};

const labels: Record<string, string> = {
  mode: "Mode & Accessoires",
  shoes: "Chaussures",
  electronics: "Électronique",
  beauty: "Beauté & Cosmétique",
  baby: "Bébé & Maternité",
  grocery: "Épicerie",
  home: "Maison & Décoration",
  secondhand: "Seconde main",
  women: "Femme",
  men: "Homme",
  kids: "Enfant",
  accessories: "Accessoires",
  phones: "Téléphones",
  tvs: "Téléviseurs",
  computers: "Ordinateurs",
  appliances: "Électroménager",
  baby_clothes: "Vêtements bébé",
  maternity: "Maternité",
  baby_gear: "Puériculture",
  furniture: "Meubles",
  decor: "Décoration",
  kitchen: "Cuisine",
  other: "Autre",
};

export function catalogLabel(id: string): string {
  return labels[id] ?? id;
}

export const initialListingCatalog: ListingCategory[] = [
  {
    id: "mode",
    label: "Mode & Accessoires",
    enabled: true,
    defaultSizeSchema: "clothing",
    subcategories: [
      { id: "women", label: "Femme", sizeSchema: "clothing" },
      { id: "men", label: "Homme", sizeSchema: "clothing" },
      { id: "kids", label: "Enfant", sizeSchema: "clothing" },
      { id: "accessories", label: "Accessoires", sizeSchema: "oneSize" },
    ],
  },
  {
    id: "shoes",
    label: "Chaussures",
    enabled: true,
    defaultSizeSchema: "shoeEu",
    subcategories: [
      { id: "women", label: "Femme", sizeSchema: "shoeEu" },
      { id: "men", label: "Homme", sizeSchema: "shoeEu" },
      { id: "kids", label: "Enfant", sizeSchema: "shoeEu" },
    ],
  },
  {
    id: "electronics",
    label: "Électronique",
    enabled: true,
    defaultSizeSchema: "none",
    subcategories: [
      { id: "phones", label: "Téléphones", sizeSchema: "phoneStorage" },
      { id: "tvs", label: "Téléviseurs", sizeSchema: "tvInches" },
      { id: "computers", label: "Ordinateurs", sizeSchema: "phoneStorage" },
      { id: "appliances", label: "Électroménager", sizeSchema: "none" },
      { id: "accessories", label: "Accessoires", sizeSchema: "oneSize" },
    ],
  },
  {
    id: "beauty",
    label: "Beauté & Cosmétique",
    enabled: true,
    defaultSizeSchema: "oneSize",
    subcategories: [],
  },
  {
    id: "baby",
    label: "Bébé & Maternité",
    enabled: true,
    defaultSizeSchema: "babyAge",
    subcategories: [
      { id: "baby_clothes", label: "Vêtements bébé", sizeSchema: "babyAge" },
      { id: "maternity", label: "Maternité", sizeSchema: "clothing" },
      { id: "baby_gear", label: "Puériculture", sizeSchema: "oneSize" },
    ],
  },
  {
    id: "grocery",
    label: "Épicerie",
    enabled: true,
    defaultSizeSchema: "none",
    subcategories: [],
  },
  {
    id: "home",
    label: "Maison & Décoration",
    enabled: true,
    defaultSizeSchema: "oneSize",
    subcategories: [
      { id: "furniture", label: "Meubles", sizeSchema: "oneSize" },
      { id: "decor", label: "Décoration", sizeSchema: "oneSize" },
      { id: "kitchen", label: "Cuisine", sizeSchema: "oneSize" },
    ],
  },
  {
    id: "secondhand",
    label: "Seconde main",
    enabled: true,
    defaultSizeSchema: "clothing",
    subcategories: [
      { id: "women", label: "Femme", sizeSchema: "clothing" },
      { id: "men", label: "Homme", sizeSchema: "clothing" },
      { id: "kids", label: "Enfant", sizeSchema: "clothing" },
      { id: "other", label: "Autre", sizeSchema: "oneSize" },
    ],
  },
];
