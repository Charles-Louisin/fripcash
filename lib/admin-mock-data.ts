import type {
  AccountRole,
  FulfillmentMode,
  ListingDestination,
  OrderStatus,
  ShopKind,
  SignUpRole,
} from "@/lib/seller-domain";
import {
  commissionRateForShopKind,
  listingDestinationForSignUpRole,
  shopKindFor,
} from "@/lib/seller-domain";

export type MockAdminUser = {
  _id: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  phone: string;
  status: "active" | "pending" | "banned";
  avatar?: string;
  articlesCount: number;
  salesCount: number;
  walletBalance: number;
  createdAt: string;
  /** Account role — SignUpRole or livreur (Flutter UserRole.livreur). */
  role: AccountRole;
  shopKind?: ShopKind | null;
  listingDestination?: ListingDestination;
  shopName?: string;
  /** True when commerce local / grande surface awaits team review. */
  shopPendingVerification?: boolean;
  /** Courier zone when role === livreur */
  zoneId?: string;
};

export type MockAdminArticle = {
  _id: string;
  title: string;
  brand?: string;
  description?: string;
  images: string[];
  category: string;
  categoryId?: string;
  price: number;
  shippingCost?: number;
  condition: string;
  size?: string;
  stock?: number;
  status: string;
  seller: { pseudo: string };
  favoritesCount?: number;
  createdAt: string;
  listingDestination: ListingDestination;
};

export type MockAdminOrder = {
  _id: string;
  article: { title: string };
  buyer: { pseudo: string };
  seller: { pseudo: string };
  amount: number;
  commission: number;
  status: OrderStatus;
  fulfillmentMode: FulfillmentMode;
  createdAt: string;
  pickupCode?: string;
  courierId?: string;
  courierName?: string;
  buyerZoneId?: string;
  sellerZoneId?: string;
  deliveryFeeGnf?: number;
  buyerAddress?: string;
  buyerPhone?: string;
};

export const mockAdminUsers: MockAdminUser[] = [
  {
    _id: "u_mock_1",
    firstName: "Ibrahim",
    lastName: "Diallo",
    pseudo: "ibrahim_shop",
    phone: "+224 628 12 34 56",
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    articlesCount: 24,
    salesCount: 56,
    walletBalance: 890000,
    createdAt: "2025-11-12T10:00:00Z",
    role: "boutique",
    shopKind: "standard",
    listingDestination: "articlesNeufs",
    shopName: "Ibrahim Shop",
  },
  {
    _id: "u_mock_2",
    firstName: "Mariam",
    lastName: "Bah",
    pseudo: "mariam_mode",
    phone: "+224 629 98 76 54",
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    articlesCount: 18,
    salesCount: 41,
    walletBalance: 120000,
    createdAt: "2025-10-05T14:30:00Z",
    role: "particulier",
    shopKind: null,
    listingDestination: "secondeMain",
  },
  {
    _id: "u_mock_3",
    firstName: "Fatou",
    lastName: "Camara",
    pseudo: "fatou_styles",
    phone: "+224 630 44 22 11",
    status: "pending",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    articlesCount: 3,
    salesCount: 0,
    walletBalance: 0,
    createdAt: "2026-06-20T09:15:00Z",
    role: "commerceLocal",
    shopKind: "proximite",
    listingDestination: "quartierBoutiques",
    shopName: "Épicerie Fatou",
    shopPendingVerification: true,
  },
  {
    _id: "u_mock_4",
    firstName: "Moussa",
    lastName: "Sylla",
    pseudo: "moussa_gn",
    phone: "+224 631 55 66 77",
    status: "active",
    articlesCount: 0,
    salesCount: 0,
    walletBalance: 45000,
    createdAt: "2026-01-18T16:00:00Z",
    role: "acheteur",
    shopKind: null,
    listingDestination: "secondeMain",
  },
  {
    _id: "u_mock_5",
    firstName: "Ousmane",
    lastName: "Barry",
    pseudo: "vendeur_xyz",
    phone: "+224 632 11 22 33",
    status: "banned",
    articlesCount: 7,
    salesCount: 2,
    walletBalance: 0,
    createdAt: "2025-08-22T11:45:00Z",
    role: "particulier",
    shopKind: null,
    listingDestination: "secondeMain",
  },
  {
    _id: "u_mock_6",
    firstName: "Aminata",
    lastName: "Sy",
    pseudo: "aminata_v",
    phone: "+224 633 77 88 99",
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    articlesCount: 31,
    salesCount: 33,
    walletBalance: 250000,
    createdAt: "2025-09-01T08:20:00Z",
    role: "particulier",
    shopKind: null,
    listingDestination: "secondeMain",
  },
  {
    _id: "u_mock_7",
    firstName: "Aissatou",
    lastName: "Keita",
    pseudo: "superette_kaloum",
    phone: "+224 634 10 20 30",
    status: "pending",
    articlesCount: 0,
    salesCount: 0,
    walletBalance: 0,
    createdAt: "2026-07-02T11:00:00Z",
    role: "grandeSurface",
    shopKind: "enseigne",
    listingDestination: "enseignes",
    shopName: "Superette Kaloum",
    shopPendingVerification: true,
  },
  {
    _id: "u_mock_8",
    firstName: "Souleymane",
    lastName: "Condé",
    pseudo: "soule_neuf",
    phone: "+224 635 40 50 60",
    status: "active",
    articlesCount: 12,
    salesCount: 9,
    walletBalance: 175000,
    createdAt: "2026-03-14T09:00:00Z",
    role: "boutique",
    shopKind: "standard",
    listingDestination: "articlesNeufs",
    shopName: "Soule Neuf",
  },
  {
    _id: "u_mock_9",
    firstName: "Mamadou",
    lastName: "Keita",
    pseudo: "mamadou_livreur",
    phone: "+224 628 88 99 00",
    status: "active",
    articlesCount: 0,
    salesCount: 0,
    walletBalance: 0,
    createdAt: "2025-03-12T08:00:00Z",
    role: "livreur",
    shopKind: null,
    zoneId: "zone_1",
  },
  {
    _id: "u_mock_10",
    firstName: "Ousmane",
    lastName: "Touré",
    pseudo: "ousmane_livreur",
    phone: "+224 631 77 88 99",
    status: "active",
    articlesCount: 0,
    salesCount: 0,
    walletBalance: 0,
    createdAt: "2025-06-02T10:00:00Z",
    role: "livreur",
    shopKind: null,
    zoneId: "zone_2",
  },
];

export const mockAdminArticles: MockAdminArticle[] = [
  {
    _id: "art_mock_1",
    title: "Baskets blanches Nike Air",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&h=120&fit=crop",
    ],
    category: "Chaussures",
    price: 85000,
    condition: "Neuf",
    status: "active",
    seller: { pseudo: "ibrahim_shop" },
    createdAt: "2026-06-15T10:00:00Z",
    listingDestination: "articlesNeufs",
  },
  {
    _id: "art_mock_2",
    title: "Robe wax premium",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop",
    ],
    category: "Mode",
    price: 120000,
    condition: "Très bon état",
    status: "pending",
    seller: { pseudo: "mariam_mode" },
    createdAt: "2026-06-22T14:30:00Z",
    listingDestination: "secondeMain",
  },
  {
    _id: "art_mock_3",
    title: "Sac en cuir marron",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop",
    ],
    category: "Accessoires",
    price: 95000,
    condition: "Bon état",
    status: "active",
    seller: { pseudo: "aminata_v" },
    createdAt: "2026-06-10T09:00:00Z",
    listingDestination: "secondeMain",
  },
  {
    _id: "art_mock_4",
    title: "Écouteurs Bluetooth JBL",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop",
    ],
    category: "Électronique",
    price: 65000,
    condition: "Neuf",
    status: "sold",
    seller: { pseudo: "ibrahim_shop" },
    createdAt: "2026-05-28T11:00:00Z",
    listingDestination: "articlesNeufs",
  },
  {
    _id: "art_mock_5",
    title: "Chemise homme slim",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120&h=120&fit=crop",
    ],
    category: "Mode",
    price: 35000,
    condition: "Bon état",
    status: "flagged",
    seller: { pseudo: "vendeur_xyz" },
    createdAt: "2026-06-18T16:45:00Z",
    listingDestination: "secondeMain",
  },
  {
    _id: "art_mock_6",
    title: "Montre vintage Casio",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop",
    ],
    category: "Accessoires",
    price: 42000,
    condition: "Bon état",
    status: "rejected",
    seller: { pseudo: "fatou_styles" },
    createdAt: "2026-06-25T08:30:00Z",
    listingDestination: "quartierBoutiques",
  },
  {
    _id: "art_mock_7",
    title: "Riz parfumé 25 kg",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop",
    ],
    category: "Alimentaire",
    price: 280000,
    condition: "Neuf",
    status: "pending",
    seller: { pseudo: "fatou_styles" },
    createdAt: "2026-07-01T10:00:00Z",
    listingDestination: "quartierBoutiques",
  },
  {
    _id: "art_mock_8",
    title: "Téléviseur LED 43\"",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=120&h=120&fit=crop",
    ],
    category: "Électronique",
    price: 4500000,
    condition: "Neuf",
    status: "active",
    seller: { pseudo: "superette_kaloum" },
    createdAt: "2026-07-03T12:00:00Z",
    listingDestination: "enseignes",
  },
];

export const mockAdminOrders: MockAdminOrder[] = [
  {
    _id: "ord_mock_1001",
    article: { title: "Baskets blanches Nike Air" },
    buyer: { pseudo: "moussa_gn" },
    seller: { pseudo: "ibrahim_shop" },
    amount: 85000,
    commission: Math.round(85000 * (commissionRateForShopKind("standard") / 100)),
    status: "fundsReleased",
    fulfillmentMode: "courier",
    courierId: "courier_a",
    courierName: "Mamadou K.",
    buyerZoneId: "zone_1",
    sellerZoneId: "zone_1",
    deliveryFeeGnf: 5000,
    buyerAddress: "Kipé, près du marché",
    buyerPhone: "+224 620 12 34 56",
    createdAt: "2026-06-20T15:30:00Z",
  },
  {
    _id: "ord_mock_1002",
    article: { title: "Robe wax premium" },
    buyer: { pseudo: "fatou_styles" },
    seller: { pseudo: "mariam_mode" },
    amount: 120000,
    commission: Math.round(120000 * 0.08),
    status: "inTransit",
    fulfillmentMode: "courier",
    courierId: "courier_b",
    courierName: "Alpha B.",
    buyerZoneId: "zone_2",
    sellerZoneId: "zone_1",
    deliveryFeeGnf: 8000,
    createdAt: "2026-06-24T10:00:00Z",
  },
  {
    _id: "ord_mock_1003",
    article: { title: "Sac en cuir marron" },
    buyer: { pseudo: "moussa_gn" },
    seller: { pseudo: "aminata_v" },
    amount: 95000,
    commission: Math.round(95000 * 0.08),
    status: "paid",
    fulfillmentMode: "courier",
    buyerZoneId: "zone_1",
    sellerZoneId: "zone_1",
    deliveryFeeGnf: 5000,
    createdAt: "2026-06-25T09:15:00Z",
  },
  {
    _id: "ord_mock_1004",
    article: { title: "Écouteurs Bluetooth JBL" },
    buyer: { pseudo: "ibrahima_gn" },
    seller: { pseudo: "ibrahim_shop" },
    amount: 65000,
    commission: Math.round(65000 * 0.08),
    status: "disputed",
    fulfillmentMode: "courier",
    courierId: "courier_a",
    courierName: "Mamadou K.",
    deliveryFeeGnf: 5000,
    createdAt: "2026-06-18T14:00:00Z",
  },
  {
    _id: "ord_mock_1005",
    article: { title: "Chemise homme slim" },
    buyer: { pseudo: "fatou_styles" },
    seller: { pseudo: "vendeur_xyz" },
    amount: 35000,
    commission: Math.round(35000 * 0.08),
    status: "ordered",
    fulfillmentMode: "courier",
    deliveryFeeGnf: 5000,
    createdAt: "2026-06-26T11:30:00Z",
  },
  {
    _id: "ord_mock_1006",
    article: { title: "Montre vintage Casio" },
    buyer: { pseudo: "moussa_gn" },
    seller: { pseudo: "aminata_v" },
    amount: 42000,
    commission: Math.round(42000 * 0.08),
    status: "delivered",
    fulfillmentMode: "courier",
    courierName: "Mamadou K.",
    deliveryFeeGnf: 5000,
    createdAt: "2026-06-27T08:00:00Z",
  },
  {
    _id: "ord_mock_1007",
    article: { title: "Riz parfumé 25 kg" },
    buyer: { pseudo: "moussa_gn" },
    seller: { pseudo: "fatou_styles" },
    amount: 280000,
    commission: Math.round(280000 * (commissionRateForShopKind("proximite") / 100)),
    status: "readyForPickup",
    fulfillmentMode: "pickup",
    pickupCode: "482913",
    deliveryFeeGnf: 0,
    buyerAddress: "Ratoma",
    createdAt: "2026-07-02T16:00:00Z",
  },
  {
    _id: "ord_mock_1008",
    article: { title: "Huile végétale 5 L" },
    buyer: { pseudo: "aminata_v" },
    seller: { pseudo: "fatou_styles" },
    amount: 95000,
    commission: Math.round(95000 * (commissionRateForShopKind("proximite") / 100)),
    status: "preparing",
    fulfillmentMode: "shopLocalDelivery",
    pickupCode: "119204",
    deliveryFeeGnf: 0,
    createdAt: "2026-07-04T11:00:00Z",
  },
];

export function filterMockUsers(
  users: MockAdminUser[],
  search: string,
  statusFilter: string,
  roleFilter: string = "all"
) {
  return users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.pseudo.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.shopName?.toLowerCase().includes(q) ?? false);
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });
}

export function pendingShopValidations(users: MockAdminUser[] = mockAdminUsers) {
  return users.filter(
    (u) =>
      u.shopPendingVerification ||
      (u.status === "pending" &&
        (u.role === "commerceLocal" || u.role === "grandeSurface"))
  );
}

export function filterMockArticles(
  articles: MockAdminArticle[],
  search: string,
  tab: string,
  destinationFilter: string = "all"
) {
  return articles.filter((a) => {
    const q = search.toLowerCase();
    const seller = typeof a.seller === "object" ? a.seller.pseudo : "";
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      seller.toLowerCase().includes(q);
    const matchesTab = tab === "all" || a.status === tab;
    const matchesDestination =
      destinationFilter === "all" || a.listingDestination === destinationFilter;
    return matchesSearch && matchesTab && matchesDestination;
  });
}

export function filterMockOrders(
  orders: MockAdminOrder[],
  search: string,
  statusFilter: string,
  fulfillmentFilter: string = "all"
) {
  return orders.filter((o) => {
    const q = search.toLowerCase();
    const articleTitle = typeof o.article === "object" ? o.article.title : "";
    const buyer = typeof o.buyer === "object" ? o.buyer.pseudo : "";
    const seller = typeof o.seller === "object" ? o.seller.pseudo : "";
    const matchesSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      articleTitle.toLowerCase().includes(q) ||
      buyer.toLowerCase().includes(q) ||
      seller.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesFulfillment =
      fulfillmentFilter === "all" || o.fulfillmentMode === fulfillmentFilter;
    return matchesSearch && matchesStatus && matchesFulfillment;
  });
}

/** Helper to keep mock users consistent with Flutter routing rules. */
export function enrichUserFromRole(
  role: SignUpRole,
  partial: Partial<MockAdminUser> = {}
): Pick<MockAdminUser, "role" | "shopKind" | "listingDestination"> {
  return {
    role,
    shopKind: shopKindFor(role),
    listingDestination: listingDestinationForSignUpRole(role),
    ...partial,
  };
}
