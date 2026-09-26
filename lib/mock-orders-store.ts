/**
 * Demo order lifecycle for web dashboard (buyer + seller).
 * Local-only until Nest order tracking / escrow release is fully wired.
 */

const STORAGE_KEY = "fripcash_mock_orders_v1";

export type MockEscrowStatus = "blocked" | "released" | "refunded";

export type MockOrderRole = "buyer" | "seller";

export type MockDeliveryMode =
  | "main-propre"
  | "buyer-delivery"
  | "seller-delivery";

export type MockOrder = {
  _id: string;
  article: { title: string; images?: string[]; _id?: string };
  buyer: { pseudo: string; _id?: string };
  seller: { pseudo: string; _id?: string };
  amount: number;
  shippingCost: number;
  commission: number;
  status: string;
  escrowStatus: MockEscrowStatus;
  deliveryMode: MockDeliveryMode;
  fulfillmentMode: string;
  paymentMethod: "mobile-money" | "card" | "wallet";
  courierName?: string | null;
  pickupCode?: string;
  disputeReason?: string;
  timeline: { at: string; label: string }[];
  createdAt: string;
  role: MockOrderRole;
};

const COURIERS = ["Amadou Diallo", "Fatoumata Camara", "Ibrahima Sow"];

function nowIso() {
  return new Date().toISOString();
}

function seedOrders(): MockOrder[] {
  const t0 = "2026-09-24T10:00:00Z";
  const t1 = "2026-09-25T09:00:00Z";
  const t2 = "2026-09-25T14:00:00Z";
  const img =
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop";
  const img2 =
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop";
  const img3 =
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop";

  return [
    {
      _id: "ord_demo_buy_escrow",
      article: {
        title: "Numeris Atelier - Cloud",
        images: [img],
        _id: "art_demo_1",
      },
      buyer: { pseudo: "toi", _id: "me" },
      seller: { pseudo: "Test Seller", _id: "seller_1" },
      amount: 1350000,
      shippingCost: 0,
      commission: 108000,
      status: "paid",
      escrowStatus: "blocked",
      deliveryMode: "buyer-delivery",
      fulfillmentMode: "courier",
      paymentMethod: "mobile-money",
      courierName: null,
      timeline: [
        { at: t1, label: "Commande payée — fonds bloqués en séquestre" },
        { at: t1, label: "Vendeur notifié" },
      ],
      createdAt: t1,
      role: "buyer",
    },
    {
      _id: "ord_demo_buy_transit",
      article: {
        title: "Montre élégante boîtier argenté",
        images: [img2],
        _id: "art_demo_2",
      },
      buyer: { pseudo: "toi", _id: "me" },
      seller: { pseudo: "Aminata Mode", _id: "seller_2" },
      amount: 450000,
      shippingCost: 15000,
      commission: 36000,
      status: "inTransit",
      escrowStatus: "blocked",
      deliveryMode: "buyer-delivery",
      fulfillmentMode: "courier",
      paymentMethod: "wallet",
      courierName: "Amadou Diallo",
      timeline: [
        { at: t0, label: "Paiement reçu — séquestre FripCash" },
        { at: t0, label: "Vendeur prépare la commande" },
        { at: t1, label: "Livreur assigné — Amadou Diallo" },
        { at: t2, label: "Colis en cours de livraison" },
      ],
      createdAt: t0,
      role: "buyer",
    },
    {
      _id: "ord_demo_buy_done",
      article: {
        title: "Robe wax brodée",
        images: [img3],
        _id: "art_demo_3",
      },
      buyer: { pseudo: "toi", _id: "me" },
      seller: { pseudo: "Fatou Styles", _id: "seller_3" },
      amount: 180000,
      shippingCost: 5000,
      commission: 14400,
      status: "fundsReleased",
      escrowStatus: "released",
      deliveryMode: "main-propre",
      fulfillmentMode: "pickup",
      paymentMethod: "card",
      timeline: [
        { at: "2026-09-20T10:00:00Z", label: "Paiement en séquestre" },
        { at: "2026-09-21T11:00:00Z", label: "Remise en main propre" },
        {
          at: "2026-09-21T11:05:00Z",
          label: "Réception confirmée — paiement libéré au vendeur",
        },
      ],
      createdAt: "2026-09-20T10:00:00Z",
      role: "buyer",
    },
    {
      _id: "ord_demo_sell_new",
      article: {
        title: "Sac en cuir marron",
        images: [img2],
        _id: "art_demo_4",
      },
      buyer: { pseudo: "Moussa B.", _id: "buyer_1" },
      seller: { pseudo: "toi", _id: "me" },
      amount: 95000,
      shippingCost: 5000,
      commission: 7600,
      status: "paid",
      escrowStatus: "blocked",
      deliveryMode: "buyer-delivery",
      fulfillmentMode: "courier",
      paymentMethod: "mobile-money",
      courierName: null,
      timeline: [
        { at: t1, label: "Nouvelle commande — paiement en séquestre" },
        { at: t1, label: "En attente de préparation / assignation livreur" },
      ],
      createdAt: t1,
      role: "seller",
    },
    {
      _id: "ord_demo_sell_ready",
      article: {
        title: "Vase céramique décoratif",
        images: [img3],
        _id: "art_demo_5",
      },
      buyer: { pseudo: "Aïssatou K.", _id: "buyer_2" },
      seller: { pseudo: "toi", _id: "me" },
      amount: 220000,
      shippingCost: 10000,
      commission: 17600,
      status: "preparing",
      escrowStatus: "blocked",
      deliveryMode: "seller-delivery",
      fulfillmentMode: "shopLocalDelivery",
      paymentMethod: "wallet",
      courierName: null,
      timeline: [
        { at: t0, label: "Paiement bloqué en séquestre" },
        { at: t1, label: "Préparation en cours" },
      ],
      createdAt: t0,
      role: "seller",
    },
    {
      _id: "ord_demo_sell_transit",
      article: {
        title: "Baskets blanches Nike Air",
        images: [img],
        _id: "art_demo_6",
      },
      buyer: { pseudo: "Ibrahim D.", _id: "buyer_3" },
      seller: { pseudo: "toi", _id: "me" },
      amount: 320000,
      shippingCost: 12000,
      commission: 25600,
      status: "inTransit",
      escrowStatus: "blocked",
      deliveryMode: "buyer-delivery",
      fulfillmentMode: "courier",
      paymentMethod: "mobile-money",
      courierName: "Fatoumata Camara",
      timeline: [
        { at: t0, label: "Paiement en séquestre" },
        { at: t1, label: "Livreur assigné — Fatoumata Camara" },
        { at: t2, label: "En livraison — en attente de confirmation acheteur" },
      ],
      createdAt: t0,
      role: "seller",
    },
    {
      _id: "ord_demo_buy_dispute",
      article: {
        title: "Casque Bluetooth",
        images: [img],
        _id: "art_demo_7",
      },
      buyer: { pseudo: "toi", _id: "me" },
      seller: { pseudo: "Electro GN", _id: "seller_4" },
      amount: 275000,
      shippingCost: 8000,
      commission: 22000,
      status: "disputed",
      escrowStatus: "blocked",
      deliveryMode: "buyer-delivery",
      fulfillmentMode: "courier",
      paymentMethod: "card",
      courierName: "Ibrahima Sow",
      disputeReason: "Article endommagé à la réception",
      timeline: [
        { at: t0, label: "Paiement en séquestre" },
        { at: t1, label: "Livraison effectuée" },
        {
          at: t2,
          label: "Litige ouvert — fonds toujours bloqués",
        },
      ],
      createdAt: t0,
      role: "buyer",
    },
  ];
}

function readStore(): MockOrder[] {
  if (typeof window === "undefined") return seedOrders();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as MockOrder[];
  } catch {
    return seedOrders();
  }
}

function writeStore(orders: MockOrder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function listMockOrders(params?: {
  type?: "buy" | "sell" | string;
  status?: string;
}): MockOrder[] {
  let list = readStore();
  if (params?.type === "buy" || params?.type === "purchase") {
    list = list.filter((o) => o.role === "buyer");
  } else if (params?.type === "sell" || params?.type === "sale") {
    list = list.filter((o) => o.role === "seller");
  }
  if (params?.status) {
    list = list.filter((o) => o.status === params.status);
  }
  return list.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function patchOrder(
  id: string,
  updater: (order: MockOrder) => MockOrder
): MockOrder {
  const orders = readStore();
  const idx = orders.findIndex((o) => o._id === id);
  if (idx < 0) throw new Error("Commande introuvable (démo).");
  const next = updater(orders[idx]);
  orders[idx] = next;
  writeStore(orders);
  return next;
}

export function mockPrepareOrder(id: string) {
  return patchOrder(id, (o) => ({
    ...o,
    status: "preparing",
    timeline: [
      ...o.timeline,
      { at: nowIso(), label: "Commande en préparation" },
    ],
  }));
}

export function mockAssignCourier(id: string, courierName?: string) {
  const name =
    courierName || COURIERS[Math.floor(Math.random() * COURIERS.length)];
  return patchOrder(id, (o) => ({
    ...o,
    status: "courierAssigned",
    courierName: name,
    timeline: [
      ...o.timeline,
      { at: nowIso(), label: `Livreur assigné — ${name}` },
    ],
  }));
}

export function mockMarkShipped(id: string) {
  return patchOrder(id, (o) => ({
    ...o,
    status: "inTransit",
    timeline: [
      ...o.timeline,
      { at: nowIso(), label: "Colis en cours de livraison" },
    ],
  }));
}

export function mockConfirmReception(id: string) {
  return patchOrder(id, (o) => ({
    ...o,
    status: "fundsReleased",
    escrowStatus: "released",
    timeline: [
      ...o.timeline,
      {
        at: nowIso(),
        label: "Réception confirmée — paiement libéré au vendeur",
      },
    ],
  }));
}

export function mockOpenDispute(id: string, reason: string) {
  return patchOrder(id, (o) => ({
    ...o,
    status: "disputed",
    escrowStatus: "blocked",
    disputeReason: reason,
    timeline: [
      ...o.timeline,
      {
        at: nowIso(),
        label: `Litige ouvert — ${reason} (fonds toujours en séquestre)`,
      },
    ],
  }));
}

export function mockSellerRefund(id: string) {
  return patchOrder(id, (o) => ({
    ...o,
    status: "refunded",
    escrowStatus: "refunded",
    timeline: [
      ...o.timeline,
      {
        at: nowIso(),
        label: "Remboursement vendeur — fonds rendus à l'acheteur",
      },
    ],
  }));
}

export function resetMockOrders() {
  const seed = seedOrders();
  writeStore(seed);
  return seed;
}

export const MOCK_COURIER_OPTIONS = COURIERS;
