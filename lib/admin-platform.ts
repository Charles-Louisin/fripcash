export type AdminZone = {
  id: string;
  name: string;
  quartiers: string[];
};

export type MaritalStatus = "celibataire" | "marie" | "divorce" | "veuf";

export type AdminCourier = {
  id: string;
  name: string;
  phone: string;
  zoneId: string;
  active: boolean;
  age?: number;
  maritalStatus?: MaritalStatus;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  registeredAtLabel?: string;
  /** Flutter CourierProfileDetails */
  vehicleType?: string;
  plateNumber?: string;
  isVerified?: boolean;
};

export type AdminPartner = {
  id: string;
  name: string;
  sla: string;
  zoneId: string;
  logoInitials: string;
  contactEmail?: string;
  active?: boolean;
};

export type SessionRole =
  | "admin"
  | "acheteur"
  | "particulier"
  | "boutique"
  | "commerceLocal"
  | "grandeSurface"
  | "livreur";

/** @deprecated use SessionRole seller subtypes — kept for older persisted sessions */
export type LegacySessionRole = "vendeur";

export const sessionRoleLabels: Record<SessionRole | LegacySessionRole, string> = {
  admin: "Admin",
  acheteur: "Acheteur",
  particulier: "Particulier",
  boutique: "Boutique",
  commerceLocal: "Commerce local",
  grandeSurface: "Grande surface",
  livreur: "Livreur",
  vendeur: "Vendeur",
};

export type SessionStatus = "active" | "idle" | "ended";

export type AdminUserSession = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: SessionRole | LegacySessionRole;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ip: string;
  location: string;
  startedAtIso: string;
  startedAtLabel: string;
  lastSeenLabel: string;
  status: SessionStatus;
};

export type AdminWallet = {
  id: string;
  sellerName: string;
  balanceGnf: number;
  escrowGnf: number;
  lastReleaseLabel: string;
};

export type AdminReport = {
  id: string;
  type: "article" | "user" | "message";
  target: string;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  createdAtLabel: string;
};

export type AdminStuckOrder = {
  id: string;
  buyerName: string;
  sellerName: string;
  status: string;
  zoneLabel: string;
  courierId?: string;
};

export type ActivityEvent = {
  id: string;
  type: "signup" | "sale" | "dispute" | "article" | "delivery";
  message: string;
  time: string;
};

export const initialZones: AdminZone[] = [
  {
    id: "zone_1",
    name: "Zone 1",
    quartiers: ["Kipé", "Lambanyi", "Dixinn", "Kaloum"],
  },
  {
    id: "zone_2",
    name: "Zone 2",
    quartiers: ["Madina", "Matoto", "Ratoma", "Sonfonia"],
  },
];

export const initialShippingRates: Record<string, number> = {
  zone_1_zone_1: 5000,
  zone_1_zone_2: 8000,
  zone_2_zone_1: 8000,
  zone_2_zone_2: 5000,
};

export const initialCouriers: AdminCourier[] = [
  {
    id: "courier_a",
    name: "Mamadou K.",
    phone: "+224 628 88 99 00",
    zoneId: "zone_1",
    active: true,
    age: 28,
    maritalStatus: "marie",
    idCardFrontUrl: "https://images.unsplash.com/photo-1563013547-824ae1b704d3?w=200&h=120&fit=crop",
    idCardBackUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=120&fit=crop",
    registeredAtLabel: "12 mars 2025",
    vehicleType: "Moto",
    plateNumber: "GN-4821-KA",
    isVerified: true,
  },
  {
    id: "courier_b",
    name: "Alpha B.",
    phone: "+224 629 11 22 33",
    zoneId: "zone_1",
    active: true,
    age: 24,
    maritalStatus: "celibataire",
    registeredAtLabel: "5 avril 2025",
    vehicleType: "Moto",
    plateNumber: "GN-1190-DX",
    isVerified: true,
  },
  {
    id: "courier_c",
    name: "Ibrahima D.",
    phone: "+224 630 44 55 66",
    zoneId: "zone_1",
    active: false,
    age: 32,
    maritalStatus: "marie",
    registeredAtLabel: "18 janv. 2025",
    vehicleType: "Vélo",
    plateNumber: "—",
    isVerified: false,
  },
  {
    id: "courier_d",
    name: "Ousmane T.",
    phone: "+224 631 77 88 99",
    zoneId: "zone_2",
    active: true,
    age: 26,
    maritalStatus: "celibataire",
    registeredAtLabel: "2 juin 2025",
    vehicleType: "Moto",
    plateNumber: "GN-3302-RT",
    isVerified: true,
  },
];

export const initialPartners: AdminPartner[] = [
  {
    id: "partner_carrefour",
    name: "Carrefour Market",
    sla: "2h",
    zoneId: "zone_1",
    logoInitials: "CM",
    contactEmail: "partenaires@carrefour.gn",
    active: true,
  },
  {
    id: "partner_imperial",
    name: "Imperial Plus",
    sla: "4h",
    zoneId: "zone_2",
    logoInitials: "IP",
    contactEmail: "contact@imperialplus.gn",
    active: true,
  },
];

export const initialUserSessions: AdminUserSession[] = [
  {
    id: "sess_1",
    userId: "admin_1",
    displayName: "Super Admin",
    email: "admin@fripcash.com",
    role: "admin",
    device: "desktop",
    browser: "Chrome 125",
    os: "Windows 11",
    ip: "196.158.42.18",
    location: "Conakry, GN",
    startedAtIso: new Date(new Date().setHours(9, 14, 0, 0)).toISOString(),
    startedAtLabel: "Aujourd'hui, 09:14",
    lastSeenLabel: "À l'instant",
    status: "active",
  },
  {
    id: "sess_2",
    userId: "u_ibrahim",
    displayName: "Ibrahim Diallo",
    email: "ibrahim@exemple.gn",
    role: "boutique",
    device: "mobile",
    browser: "Safari 17",
    os: "iOS 17",
    ip: "41.242.88.12",
    location: "Conakry, GN",
    startedAtIso: new Date(new Date().setHours(8, 42, 0, 0)).toISOString(),
    startedAtLabel: "Aujourd'hui, 08:42",
    lastSeenLabel: "Il y a 3 min",
    status: "active",
  },
  {
    id: "sess_3",
    userId: "u_fatou",
    displayName: "Fatou Camara",
    email: "fatou.c@exemple.gn",
    role: "commerceLocal",
    device: "mobile",
    browser: "Chrome Mobile",
    os: "Android 14",
    ip: "197.149.23.55",
    location: "Ratoma, GN",
    startedAtIso: new Date(new Date().setHours(10, 5, 0, 0)).toISOString(),
    startedAtLabel: "Aujourd'hui, 10:05",
    lastSeenLabel: "Il y a 12 min",
    status: "idle",
  },
  {
    id: "sess_4",
    userId: "courier_a",
    displayName: "Mamadou K.",
    email: "mamadou.k@fripcash.gn",
    role: "livreur",
    device: "mobile",
    browser: "Chrome Mobile",
    os: "Android 13",
    ip: "196.201.44.90",
    location: "Kaloum, GN",
    startedAtIso: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    startedAtLabel: "Aujourd'hui, 07:30",
    lastSeenLabel: "Il y a 1 min",
    status: "active",
  },
  {
    id: "sess_5",
    userId: "u_aminata",
    displayName: "Aminata Sy",
    email: "aminata@exemple.gn",
    role: "particulier",
    device: "desktop",
    browser: "Firefox 126",
    os: "macOS 14",
    ip: "154.72.18.33",
    location: "Dixinn, GN",
    startedAtIso: new Date(Date.now() - 86_400_000).toISOString(),
    startedAtLabel: "Hier, 18:22",
    lastSeenLabel: "Hier, 21:45",
    status: "ended",
  },
  {
    id: "sess_6",
    userId: "u_moussa",
    displayName: "Moussa Bah",
    email: "moussa@exemple.gn",
    role: "acheteur",
    device: "tablet",
    browser: "Safari 17",
    os: "iPadOS 17",
    ip: "41.191.77.44",
    location: "Matoto, GN",
    startedAtIso: new Date(Date.now() - 86_400_000).toISOString(),
    startedAtLabel: "Hier, 14:10",
    lastSeenLabel: "Hier, 16:30",
    status: "ended",
  },
  {
    id: "sess_7",
    userId: "u_kaloum",
    displayName: "Superette Kaloum",
    email: "kaloum@exemple.gn",
    role: "grandeSurface",
    device: "desktop",
    browser: "Chrome 125",
    os: "Windows 11",
    ip: "41.207.12.88",
    location: "Kaloum, GN",
    startedAtIso: new Date(new Date().setHours(11, 20, 0, 0)).toISOString(),
    startedAtLabel: "Aujourd'hui, 11:20",
    lastSeenLabel: "Il y a 8 min",
    status: "active",
  },
];

export const initialWallets: AdminWallet[] = [
  {
    id: "w_aminata",
    sellerName: "aminata_v",
    balanceGnf: 250000,
    escrowGnf: 75000,
    lastReleaseLabel: "Hier",
  },
  {
    id: "w_ibrahim",
    sellerName: "ibrahim_shop",
    balanceGnf: 890000,
    escrowGnf: 205000,
    lastReleaseLabel: "Aujourd'hui",
  },
  {
    id: "w_mariam",
    sellerName: "mariam_mode",
    balanceGnf: 120000,
    escrowGnf: 0,
    lastReleaseLabel: "12 juin",
  },
];

export const initialReports: AdminReport[] = [
  {
    id: "rep_1",
    type: "article",
    target: "Sac en cuir marron",
    reason: "Contrefaçon suspectée",
    status: "open",
    createdAtLabel: "Il y a 2 h",
  },
  {
    id: "rep_2",
    type: "user",
    target: "vendeur_xyz",
    reason: "Harcèlement en message",
    status: "open",
    createdAtLabel: "Il y a 5 h",
  },
  {
    id: "rep_3",
    type: "message",
    target: "Conversation #4421",
    reason: "Tentative de paiement hors plateforme",
    status: "reviewed",
    createdAtLabel: "Hier",
  },
];

export const initialStuckOrders: AdminStuckOrder[] = [
  {
    id: "ord_1002",
    buyerName: "Ibrahima",
    sellerName: "ibrahim_shop",
    status: "Colis prêt",
    zoneLabel: "Zone 2 → Zone 2",
    courierId: undefined,
  },
  {
    id: "ord_1005",
    buyerName: "Moussa",
    sellerName: "mariam_mode",
    status: "En route",
    zoneLabel: "Zone 1 → Zone 1",
    courierId: "courier_a",
  },
];

export const initialActivity: ActivityEvent[] = [
  {
    id: "act_1",
    type: "sale",
    message: "Nouvelle commande #ord_1005 — 120 000 GNF",
    time: "À l'instant",
  },
  {
    id: "act_2",
    type: "delivery",
    message: "Livraison confirmée #ord_1003 — Mamadou K.",
    time: "Il y a 12 min",
  },
  {
    id: "act_3",
    type: "signup",
    message: "Inscription commerce local (quartier) : fatou_styles — validation requise",
    time: "Il y a 28 min",
  },
  {
    id: "act_4",
    type: "article",
    message: "Article Seconde main en attente : Robe wax premium",
    time: "Il y a 1 h",
  },
  {
    id: "act_4b",
    type: "signup",
    message: "Inscription grande surface : superette_kaloum — validation requise",
    time: "Il y a 45 min",
  },
  {
    id: "act_5",
    type: "dispute",
    message: "Litige ouvert — article non conforme",
    time: "Il y a 2 h",
  },
];

export const analyticsMock = {
  topProducts: [
    { name: "Baskets blanches", sales: 42, gmv: 3360000 },
    { name: "Robe fleurie vintage", sales: 38, gmv: 1710000 },
    { name: "Sac en cuir marron", sales: 21, gmv: 2520000 },
  ],
  topShops: [
    { name: "ibrahim_shop", orders: 56, rating: 4.7 },
    { name: "mariam_mode", orders: 41, rating: 5.0 },
    { name: "aminata_v", orders: 33, rating: 4.9 },
  ],
  courierPerf: [
    { name: "Mamadou K.", deliveries: 18, avgMinutes: 42 },
    { name: "Alpha B.", deliveries: 14, avgMinutes: 51 },
    { name: "Ousmane T.", deliveries: 11, avgMinutes: 38 },
  ],
};

export const dashboardMock = {
  pendingArticles: [
    {
      _id: "mock_art_1",
      title: "Robe wax premium",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop",
      ],
      seller: { pseudo: "mariam_mode" },
    },
    {
      _id: "mock_art_2",
      title: "Baskets blanches Nike",
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&h=120&fit=crop",
      ],
      seller: { pseudo: "ibrahim_shop" },
    },
    {
      _id: "mock_art_3",
      title: "Sac en cuir marron",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop",
      ],
      seller: { pseudo: "aminata_v" },
    },
  ],
  recentDisputes: [
    {
      _id: "mock_disp_1",
      reason: "Article non conforme à la description",
      status: "open",
      buyer: { pseudo: "ibrahima_gn" },
      seller: { pseudo: "vendeur_xyz" },
    },
    {
      _id: "mock_disp_2",
      reason: "Colis endommagé à la réception",
      status: "open",
      buyer: { pseudo: "fatou_styles" },
      seller: { pseudo: "mariam_mode" },
    },
  ],
};

export function shippingKey(from: string, to: string) {
  return `${from}_${to}`;
}

export function formatGnf(amount: number) {
  return `${amount.toLocaleString("fr-FR")} GNF`;
}
