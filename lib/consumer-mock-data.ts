/**
 * Dummy data for the public website / seller dashboard.
 * No backend calls until the new API is ready.
 */

import type { ListingDestination } from "@/lib/seller-domain";

export type MockConsumerUser = {
  _id: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  phone: string;
  email?: string;
  role: string;
  avatar?: string;
  zoneId?: string;
  address?: string;
  shopName?: string;
  shopKind?: string | null;
  walletBalance?: number;
  createdAt: string;
  seller?: {
    kind: string;
    shopKind: string | null;
    verificationStatus: string;
    listingDestination: string | null;
    capabilities: {
      createListing: boolean;
      excelImport: boolean;
      productLibrary: boolean;
      sellerDashboard: boolean;
    };
  };
};

export type MockConsumerArticle = {
  _id: string;
  title: string;
  brand?: string;
  description: string;
  images: string[];
  category: string;
  categoryId: string;
  subCategory?: string;
  price: number;
  shippingCost: number;
  condition: string;
  size?: string;
  stock: number;
  status: "active" | "pending" | "sold" | "rejected" | "flagged";
  seller: {
    _id: string;
    pseudo: string;
    firstName?: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    reviewsCount?: number;
  };
  favoritesCount: number;
  listingDestination: ListingDestination;
  negotiable?: boolean;
  colors?: string[];
  color?: string;
  createdAt: string;
};

export type MockConsumerCategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  enabled: boolean;
  subGroups: {
    name: string;
    items: { name: string }[];
  }[];
};

export type MockConsumerOrder = {
  _id: string;
  article: { title: string; images?: string[]; _id?: string };
  buyer: { pseudo: string; _id?: string };
  seller: { pseudo: string; _id?: string };
  amount: number;
  shippingCost: number;
  commission: number;
  status: string;
  fulfillmentMode: string;
  pickupCode?: string;
  createdAt: string;
  role?: "buyer" | "seller";
};

export type MockReview = {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  articleId?: string;
  createdAt: string;
};

export type MockConversation = {
  _id: string;
  participant: { pseudo: string; avatar?: string };
  lastMessage: string;
  updatedAt: string;
  unread: number;
};

export type MockMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type MockNotification = {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type?: string;
};

export type MockWalletTx = {
  _id: string;
  type: string;
  amount: number;
  label: string;
  isCredit: boolean;
  createdAt: string;
};

export const mockMe: MockConsumerUser = {
  _id: "u_demo",
  firstName: "Aminata",
  lastName: "Sy",
  pseudo: "aminata_v",
  phone: "+224621112233",
  email: "aminata@exemple.gn",
  /** Default buyer — upgrade via Paramètres → Devenir vendeur (particulier). */
  role: "acheteur",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
  zoneId: "zone_1",
  address: "Dixinn, Conakry",
  shopName: undefined,
  shopKind: null,
  walletBalance: 45000,
  createdAt: "2025-09-01T08:20:00Z",
};

/** Extra fields used by dashboard / profile UIs (kept loose for demo). */
export const mockMeExtras = {
  id: "u_demo",
  rating: 4.9,
  reviewsCount: 12,
  salesCount: 0,
  purchasesCount: 12,
  articlesCount: 0,
};

/** Browse categories for header / home grid (website UX). */
export const mockBrowseCategories: MockConsumerCategory[] = [
  {
    _id: "cat_femme",
    name: "Femme",
    slug: "femme",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Vêtements",
        items: [
          { name: "Robes" },
          { name: "Tops" },
          { name: "Pantalons" },
          { name: "Manteaux" },
        ],
      },
      {
        name: "Chaussures",
        items: [{ name: "Baskets" }, { name: "Talons" }, { name: "Sandales" }],
      },
      {
        name: "Accessoires",
        items: [{ name: "Sacs" }, { name: "Bijoux" }, { name: "Écharpes" }],
      },
    ],
  },
  {
    _id: "cat_homme",
    name: "Homme",
    slug: "homme",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Vêtements",
        items: [
          { name: "T-shirts" },
          { name: "Chemises" },
          { name: "Pantalons" },
          { name: "Vestes" },
        ],
      },
      {
        name: "Chaussures",
        items: [{ name: "Baskets" }, { name: "Ville" }, { name: "Sandales" }],
      },
    ],
  },
  {
    _id: "cat_enfant",
    name: "Enfant",
    slug: "enfant",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=400&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Fille",
        items: [{ name: "Robes" }, { name: "Ensembles" }],
      },
      {
        name: "Garçon",
        items: [{ name: "T-shirts" }, { name: "Shorts" }],
      },
    ],
  },
  {
    _id: "cat_maison",
    name: "Maison",
    slug: "maison",
    image:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=500&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Décoration",
        items: [{ name: "Cadres" }, { name: "Vases" }],
      },
      {
        name: "Cuisine",
        items: [{ name: "Ustensiles" }, { name: "Vaisselle" }],
      },
    ],
  },
  {
    _id: "cat_elec",
    name: "Électronique",
    slug: "electronique",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Téléphones",
        items: [{ name: "Smartphones" }, { name: "Accessoires" }],
      },
      {
        name: "Audio",
        items: [{ name: "Écouteurs" }, { name: "Enceintes" }],
      },
    ],
  },
  {
    _id: "cat_sport",
    name: "Sport",
    slug: "sport",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=600&h=400&fit=crop",
    enabled: true,
    subGroups: [
      {
        name: "Fitness",
        items: [{ name: "Vêtements" }, { name: "Équipement" }],
      },
    ],
  },
];

export const mockArticles: MockConsumerArticle[] = [
  {
    _id: "art_mock_1",
    title: "Baskets blanches Nike Air",
    brand: "Nike",
    description:
      "Baskets Nike Air blanches, portées deux fois. Boîte d'origine disponible. Pointure 42.",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
    ],
    category: "Homme",
    categoryId: "shoes",
    subCategory: "Baskets",
    price: 85000,
    shippingCost: 5000,
    condition: "Neuf",
    size: "42",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_mock_1",
      pseudo: "ibrahim_shop",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      rating: 4.8,
      reviewCount: 56,
    },
    favoritesCount: 24,
    listingDestination: "articlesNeufs",
    negotiable: true,
    colors: ["Blanc"],
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    _id: "art_mock_2",
    title: "Robe wax premium",
    brand: "Wax Maison",
    description:
      "Robe wax authentique, coupe évasée. Idéale cérémonies. Taille M.",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
    ],
    category: "Femme",
    categoryId: "mode",
    subCategory: "Robes",
    price: 120000,
    shippingCost: 5000,
    condition: "Très bon état",
    size: "M",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_mock_2",
      pseudo: "mariam_mode",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
      rating: 4.6,
      reviewCount: 41,
    },
    favoritesCount: 38,
    listingDestination: "secondeMain",
    negotiable: true,
    createdAt: "2026-06-22T14:30:00Z",
  },
  {
    _id: "art_mock_3",
    title: "Sac en cuir marron",
    brand: "Artisanat GN",
    description: "Sac bandoulière en cuir véritable, finitions soignées.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
    ],
    category: "Femme",
    categoryId: "mode",
    subCategory: "Sacs",
    price: 95000,
    shippingCost: 5000,
    condition: "Bon état",
    size: "Unique",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_demo",
      pseudo: "aminata_v",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
      rating: 4.9,
      reviewCount: 33,
    },
    favoritesCount: 17,
    listingDestination: "secondeMain",
    createdAt: "2026-06-10T09:00:00Z",
  },
  {
    _id: "art_mock_4",
    title: "Écouteurs Bluetooth JBL",
    brand: "JBL",
    description: "Écouteurs sans fil JBL, autonomie 24h, état neuf.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    ],
    category: "Électronique",
    categoryId: "electronics",
    subCategory: "Audio",
    price: 65000,
    shippingCost: 5000,
    condition: "Neuf",
    size: "Unique",
    stock: 3,
    status: "active",
    seller: {
      _id: "u_mock_1",
      pseudo: "ibrahim_shop",
      rating: 4.8,
      reviewCount: 56,
    },
    favoritesCount: 12,
    listingDestination: "articlesNeufs",
    createdAt: "2026-05-28T11:00:00Z",
  },
  {
    _id: "art_mock_5",
    title: "Chemise homme slim",
    brand: "Zara",
    description: "Chemise slim blanche, coton. Taille L.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
    ],
    category: "Homme",
    categoryId: "mode",
    subCategory: "Chemises",
    price: 35000,
    shippingCost: 5000,
    condition: "Bon état",
    size: "L",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_mock_5",
      pseudo: "vendeur_xyz",
      rating: 3.9,
      reviewCount: 8,
    },
    favoritesCount: 5,
    listingDestination: "secondeMain",
    createdAt: "2026-06-18T16:45:00Z",
  },
  {
    _id: "art_mock_6",
    title: "Montre vintage Casio",
    brand: "Casio",
    description: "Montre Casio vintage, fonctionne parfaitement.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    ],
    category: "Homme",
    categoryId: "mode",
    subCategory: "Accessoires",
    price: 42000,
    shippingCost: 5000,
    condition: "Bon état",
    size: "Unique",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_demo",
      pseudo: "aminata_v",
      rating: 4.9,
      reviewCount: 33,
    },
    favoritesCount: 21,
    listingDestination: "secondeMain",
    createdAt: "2026-06-25T08:30:00Z",
  },
  {
    _id: "art_mock_7",
    title: "Riz parfumé 25 kg",
    brand: "Local",
    description: "Sac de riz parfumé 25 kg — commerce de proximité.",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop",
    ],
    category: "Maison",
    categoryId: "grocery",
    price: 280000,
    shippingCost: 0,
    condition: "Neuf",
    stock: 20,
    status: "active",
    seller: {
      _id: "u_mock_3",
      pseudo: "fatou_styles",
      rating: 4.5,
      reviewCount: 12,
    },
    favoritesCount: 4,
    listingDestination: "quartierBoutiques",
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    _id: "art_mock_8",
    title: 'Téléviseur LED 43"',
    brand: "Samsung",
    description: "TV LED 43 pouces, Smart TV. Garantie enseigne.",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop",
    ],
    category: "Électronique",
    categoryId: "electronics",
    subCategory: "Téléviseurs",
    price: 4500000,
    shippingCost: 12000,
    condition: "Neuf",
    size: '43"',
    stock: 5,
    status: "active",
    seller: {
      _id: "u_mock_7",
      pseudo: "superette_kaloum",
      rating: 4.7,
      reviewCount: 90,
    },
    favoritesCount: 9,
    listingDestination: "enseignes",
    createdAt: "2026-07-03T12:00:00Z",
  },
  {
    _id: "art_mock_9",
    title: "Ensemble sport femme",
    brand: "Adidas",
    description: "Survêtement Adidas, très bon état. Taille S.",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop",
    ],
    category: "Sport",
    categoryId: "mode",
    price: 55000,
    shippingCost: 5000,
    condition: "Très bon état",
    size: "S",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_mock_2",
      pseudo: "mariam_mode",
      rating: 4.6,
      reviewCount: 41,
    },
    favoritesCount: 14,
    listingDestination: "secondeMain",
    createdAt: "2026-07-05T09:00:00Z",
  },
  {
    _id: "art_mock_10",
    title: "Canapé 2 places",
    brand: "Maison",
    description: "Canapé compact 2 places, tissu gris. À récupérer zone 1.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop",
    ],
    category: "Maison",
    categoryId: "home",
    price: 450000,
    shippingCost: 15000,
    condition: "Bon état",
    size: "Unique",
    stock: 1,
    status: "active",
    seller: {
      _id: "u_demo",
      pseudo: "aminata_v",
      rating: 4.9,
      reviewCount: 33,
    },
    favoritesCount: 7,
    listingDestination: "secondeMain",
    createdAt: "2026-07-06T15:00:00Z",
  },
];

export const mockOrders: MockConsumerOrder[] = [
  {
    _id: "ord_mock_1001",
    article: {
      title: "Baskets blanches Nike Air",
      images: mockArticles[0].images,
      _id: "art_mock_1",
    },
    buyer: { pseudo: "moussa_gn", _id: "u_mock_4" },
    seller: { pseudo: "ibrahim_shop", _id: "u_mock_1" },
    amount: 85000,
    shippingCost: 5000,
    commission: 6800,
    status: "fundsReleased",
    fulfillmentMode: "courier",
    createdAt: "2026-06-20T15:30:00Z",
    role: "buyer",
  },
  {
    _id: "ord_mock_1003",
    article: {
      title: "Sac en cuir marron",
      images: mockArticles[2].images,
      _id: "art_mock_3",
    },
    buyer: { pseudo: "moussa_gn", _id: "u_mock_4" },
    seller: { pseudo: "aminata_v", _id: "u_demo" },
    amount: 95000,
    shippingCost: 5000,
    commission: 7600,
    status: "paid",
    fulfillmentMode: "courier",
    createdAt: "2026-06-25T09:15:00Z",
    role: "seller",
  },
  {
    _id: "ord_mock_1007",
    article: {
      title: "Riz parfumé 25 kg",
      images: mockArticles[6].images,
      _id: "art_mock_7",
    },
    buyer: { pseudo: "aminata_v", _id: "u_demo" },
    seller: { pseudo: "fatou_styles", _id: "u_mock_3" },
    amount: 280000,
    shippingCost: 0,
    commission: 14000,
    status: "readyForPickup",
    fulfillmentMode: "pickup",
    pickupCode: "482913",
    createdAt: "2026-07-02T16:00:00Z",
    role: "buyer",
  },
];

export const mockReviews: MockReview[] = [
  {
    _id: "rev_1",
    author: "Moussa B.",
    rating: 5,
    comment: "Livraison rapide et article conforme. Super plateforme !",
    articleId: "art_mock_1",
    createdAt: "2026-06-21T10:00:00Z",
  },
  {
    _id: "rev_2",
    author: "Fatou C.",
    rating: 5,
    comment: "J'ai vendu mes fripes en deux jours. Très simple.",
    createdAt: "2026-06-18T12:00:00Z",
  },
  {
    _id: "rev_3",
    author: "Ibrahim D.",
    rating: 4,
    comment: "Le paiement Orange Money est pratique. Je recommande.",
    createdAt: "2026-06-12T09:00:00Z",
  },
  {
    _id: "rev_4",
    author: "Aissatou K.",
    rating: 5,
    comment: "Boutique de proximité top — j'ai récupéré mon riz le jour même.",
    articleId: "art_mock_7",
    createdAt: "2026-07-03T14:00:00Z",
  },
];

export const mockConversations: MockConversation[] = [
  {
    _id: "conv_1",
    participant: {
      pseudo: "moussa_gn",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    },
    lastMessage: "Le code de retrait c'est bien 482913 ?",
    updatedAt: "2026-07-02T17:00:00Z",
    unread: 1,
  },
  {
    _id: "conv_2",
    participant: { pseudo: "mariam_mode" },
    lastMessage: "Je peux faire 100 000 F ?",
    updatedAt: "2026-06-23T11:00:00Z",
    unread: 0,
  },
];

export const mockMessages: MockMessage[] = [
  {
    _id: "msg_1",
    conversationId: "conv_1",
    senderId: "u_mock_4",
    text: "Bonjour, mon colis est prêt ?",
    createdAt: "2026-07-02T16:30:00Z",
  },
  {
    _id: "msg_2",
    conversationId: "conv_1",
    senderId: "u_demo",
    text: "Oui, tu peux passer quand tu veux.",
    createdAt: "2026-07-02T16:45:00Z",
  },
  {
    _id: "msg_3",
    conversationId: "conv_1",
    senderId: "u_mock_4",
    text: "Le code de retrait c'est bien 482913 ?",
    createdAt: "2026-07-02T17:00:00Z",
  },
];

export const mockNotifications: MockNotification[] = [
  {
    _id: "notif_1",
    title: "Nouvelle commande",
    body: "Moussa a commandé ton Sac en cuir marron.",
    read: false,
    createdAt: "2026-06-25T09:16:00Z",
    type: "order",
  },
  {
    _id: "notif_2",
    title: "Offre reçue",
    body: "Mariam propose 100 000 F sur ta robe wax.",
    read: false,
    createdAt: "2026-06-23T11:01:00Z",
    type: "offer",
  },
  {
    _id: "notif_3",
    title: "Paiement libéré",
    body: "75 000 GNF ont été crédités sur ton porte-monnaie.",
    read: true,
    createdAt: "2026-06-21T10:00:00Z",
    type: "wallet",
  },
];

export const mockWalletTransactions: MockWalletTx[] = [
  {
    _id: "tx_1",
    type: "saleCredit",
    amount: 87400,
    label: "Vente — Sac en cuir marron",
    isCredit: true,
    createdAt: "2026-06-21T10:00:00Z",
  },
  {
    _id: "tx_2",
    type: "escrowHold",
    amount: 95000,
    label: "Séquestre — commande #1003",
    isCredit: false,
    createdAt: "2026-06-25T09:15:00Z",
  },
  {
    _id: "tx_3",
    type: "withdrawal",
    amount: 50000,
    label: "Retrait Orange Money",
    isCredit: false,
    createdAt: "2026-06-15T14:00:00Z",
  },
];

/** Mutable favorite ids for demo toggles. */
let favoriteIds = new Set<string>(["art_mock_2", "art_mock_3"]);

export function getFavoriteIds() {
  return favoriteIds;
}

export function toggleFavoriteId(id: string) {
  if (favoriteIds.has(id)) favoriteIds.delete(id);
  else favoriteIds.add(id);
  return favoriteIds.has(id);
}

export function filterMockArticles(filters: {
  category?: string;
  subCategory?: string;
  itemType?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...mockArticles];
  if (filters.status) {
    list = list.filter((a) => a.status === filters.status);
  } else {
    list = list.filter((a) => a.status === "active");
  }
  if (filters.category) {
    const c = filters.category.toLowerCase();
    list = list.filter(
      (a) =>
        a.category.toLowerCase() === c ||
        a.categoryId.toLowerCase() === c
    );
  }
  if (filters.subCategory) {
    const s = filters.subCategory.toLowerCase();
    list = list.filter((a) => a.subCategory?.toLowerCase() === s);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.brand?.toLowerCase().includes(q) ||
        a.seller.pseudo.toLowerCase().includes(q)
    );
  }
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  return { data, total: list.length, page, limit };
}

export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
