// ============== MOCK DATA FOR ADMIN DASHBOARD ==============

export interface MockUser {
  id: number;
  name: string;
  pseudo: string;
  phone: string;
  avatar: string;
  status: "active" | "banned" | "pending";
  joinedDate: string;
  articlesCount: number;
  salesCount: number;
  totalRevenue: number;
}

export interface MockArticle {
  id: number;
  title: string;
  image: string;
  seller: string;
  sellerId: number;
  category: string;
  price: number;
  condition: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  postedDate: string;
}

export type DeliveryMode = "main-propre" | "buyer-delivery" | "seller-delivery";
export type OrderStatus = "pending" | "paid_escrow" | "in_delivery" | "awaiting_confirmation" | "delivered" | "disputed" | "refunded";
export type EscrowStatus = "blocked" | "released";

export interface MockOrder {
  id: string;
  buyer: string;
  buyerId: number;
  seller: string;
  sellerId: number;
  article: string;
  articleId: number;
  amount: number;
  commission: number;
  shippingCost: number;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  confirmationCode: string;
  escrowStatus: EscrowStatus;
  date: string;
}

export interface MockDispute {
  id: string;
  buyer: string;
  buyerId: number;
  seller: string;
  sellerId: number;
  article: string;
  articleId: number;
  reason: string;
  status: "open" | "in-review" | "resolved" | "escalated";
  createdDate: string;
  description: string;
}

export interface MockCategoryItem {
  id: number;
  name: string;
  articlesCount: number;
}

export interface MockSubGroup {
  id: number;
  name: string;
  articlesCount: number;
  items: MockCategoryItem[];
}

export interface MockCategory {
  id: number;
  name: string;
  slug: string;
  articlesCount: number;
  enabled: boolean;
  subGroups: MockSubGroup[];
}

// ---------- USERS ----------
export const mockUsers: MockUser[] = [
  { id: 1, name: "Amina Bello", pseudo: "amina_b", phone: "+224 690 123 456", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-08-15", articlesCount: 24, salesCount: 18, totalRevenue: 156000 },
  { id: 2, name: "Jean-Pierre Fotso", pseudo: "jp_fotso", phone: "+224 677 234 567", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-09-02", articlesCount: 12, salesCount: 8, totalRevenue: 89000 },
  { id: 3, name: "Marie Ndongo", pseudo: "marie_nd", phone: "+224 655 345 678", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", status: "banned", joinedDate: "2025-07-20", articlesCount: 3, salesCount: 1, totalRevenue: 5000 },
  { id: 4, name: "Samuel Ekane", pseudo: "sam_ek", phone: "+224 699 456 789", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-10-11", articlesCount: 45, salesCount: 38, totalRevenue: 420000 },
  { id: 5, name: "Fatou Diallo", pseudo: "fatou_d", phone: "+224 670 567 890", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", status: "pending", joinedDate: "2026-01-05", articlesCount: 0, salesCount: 0, totalRevenue: 0 },
  { id: 6, name: "Paul Mbarga", pseudo: "paul_mb", phone: "+224 681 678 901", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-11-22", articlesCount: 8, salesCount: 5, totalRevenue: 67000 },
  { id: 7, name: "Aisha Njoya", pseudo: "aisha_nj", phone: "+224 692 789 012", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-12-01", articlesCount: 15, salesCount: 11, totalRevenue: 134000 },
  { id: 8, name: "David Tagne", pseudo: "dav_tag", phone: "+224 656 890 123", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", status: "active", joinedDate: "2026-01-15", articlesCount: 6, salesCount: 3, totalRevenue: 28000 },
  { id: 9, name: "Carine Essomba", pseudo: "carine_e", phone: "+224 674 901 234", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop", status: "pending", joinedDate: "2026-02-01", articlesCount: 0, salesCount: 0, totalRevenue: 0 },
  { id: 10, name: "Yves Nkoulou", pseudo: "yves_nk", phone: "+224 698 012 345", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-06-30", articlesCount: 52, salesCount: 45, totalRevenue: 580000 },
  { id: 11, name: "Sandrine Ateba", pseudo: "sand_at", phone: "+224 661 123 456", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", status: "active", joinedDate: "2025-09-18", articlesCount: 19, salesCount: 14, totalRevenue: 175000 },
  { id: 12, name: "Eric Tchinda", pseudo: "eric_tc", phone: "+224 676 234 567", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", status: "banned", joinedDate: "2025-08-05", articlesCount: 2, salesCount: 0, totalRevenue: 0 },
];

// ---------- ARTICLES ----------
export const mockArticles: MockArticle[] = [
  { id: 1, title: "Robe d'été fleurie", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop", seller: "Amina Bello", sellerId: 1, category: "Femme", price: 8500, condition: "Bon état", status: "approved", postedDate: "2026-02-10" },
  { id: 2, title: "Jean Levi's 501", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop", seller: "Samuel Ekane", sellerId: 4, category: "Homme", price: 15000, condition: "Très bon état", status: "approved", postedDate: "2026-02-09" },
  { id: 3, title: "Nike Air Max 90", image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=200&h=200&fit=crop", seller: "Paul Mbarga", sellerId: 6, category: "Sport", price: 25000, condition: "Neuf avec étiquette", status: "pending", postedDate: "2026-02-12" },
  { id: 4, title: "iPhone 13 Pro", image: "https://images.unsplash.com/photo-1632661674596-df8be0860f4c?w=200&h=200&fit=crop", seller: "Yves Nkoulou", sellerId: 10, category: "Électronique", price: 180000, condition: "Bon état", status: "approved", postedDate: "2026-02-08" },
  { id: 5, title: "Sac Louis Vuitton (Suspect)", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop", seller: "Marie Ndongo", sellerId: 3, category: "Femme", price: 45000, condition: "Neuf", status: "flagged", postedDate: "2026-02-11" },
  { id: 6, title: "Veste en cuir vintage", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop", seller: "Jean-Pierre Fotso", sellerId: 2, category: "Homme", price: 22000, condition: "Bon état", status: "approved", postedDate: "2026-02-07" },
  { id: 7, title: "Robe de soirée noire", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop", seller: "Aisha Njoya", sellerId: 7, category: "Femme", price: 12000, condition: "Très bon état", status: "pending", postedDate: "2026-02-13" },
  { id: 8, title: "Console PS5", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop", seller: "David Tagne", sellerId: 8, category: "Divertissement", price: 220000, condition: "Bon état", status: "pending", postedDate: "2026-02-12" },
  { id: 9, title: "Table basse en bois", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=200&h=200&fit=crop", seller: "Sandrine Ateba", sellerId: 11, category: "Maison", price: 35000, condition: "Très bon état", status: "approved", postedDate: "2026-02-06" },
  { id: 10, title: "Lunettes Ray-Ban", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop", seller: "Eric Tchinda", sellerId: 12, category: "Loisirs", price: 18000, condition: "Neuf", status: "flagged", postedDate: "2026-02-10" },
  { id: 11, title: "Pyjama enfant Disney", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200&h=200&fit=crop", seller: "Fatou Diallo", sellerId: 5, category: "Enfant", price: 4500, condition: "Bon état", status: "pending", postedDate: "2026-02-13" },
  { id: 12, title: "Baskets Adidas Yeezy", image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=200&h=200&fit=crop", seller: "Samuel Ekane", sellerId: 4, category: "Sport", price: 55000, condition: "Neuf avec étiquette", status: "approved", postedDate: "2026-02-05" },
];

// ---------- ORDERS ----------
export const mockOrders: MockOrder[] = [
  { id: "CMD-001", buyer: "Fatou Diallo", buyerId: 5, seller: "Amina Bello", sellerId: 1, article: "Robe d'été fleurie", articleId: 1, amount: 8500, commission: 850, shippingCost: 1500, status: "delivered", deliveryMode: "main-propre", confirmationCode: "482917", escrowStatus: "released", date: "2026-02-10" },
  { id: "CMD-002", buyer: "Aisha Njoya", buyerId: 7, seller: "Samuel Ekane", sellerId: 4, article: "Jean Levi's 501", articleId: 2, amount: 15000, commission: 1500, shippingCost: 2000, status: "in_delivery", deliveryMode: "seller-delivery", confirmationCode: "739154", escrowStatus: "blocked", date: "2026-02-11" },
  { id: "CMD-003", buyer: "Paul Mbarga", buyerId: 6, seller: "Yves Nkoulou", sellerId: 10, article: "iPhone 13 Pro", articleId: 4, amount: 180000, commission: 18000, shippingCost: 3000, status: "paid_escrow", deliveryMode: "buyer-delivery", confirmationCode: "516382", escrowStatus: "blocked", date: "2026-02-12" },
  { id: "CMD-004", buyer: "David Tagne", buyerId: 8, seller: "Jean-Pierre Fotso", sellerId: 2, article: "Veste en cuir vintage", articleId: 6, amount: 22000, commission: 2200, shippingCost: 2500, status: "delivered", deliveryMode: "main-propre", confirmationCode: "274619", escrowStatus: "released", date: "2026-02-08" },
  { id: "CMD-005", buyer: "Sandrine Ateba", buyerId: 11, seller: "Aisha Njoya", sellerId: 7, article: "Robe de soirée noire", articleId: 7, amount: 12000, commission: 1200, shippingCost: 1500, status: "pending", deliveryMode: "seller-delivery", confirmationCode: "891043", escrowStatus: "blocked", date: "2026-02-13" },
  { id: "CMD-006", buyer: "Amina Bello", buyerId: 1, seller: "Sandrine Ateba", sellerId: 11, article: "Table basse en bois", articleId: 9, amount: 35000, commission: 3500, shippingCost: 5000, status: "disputed", deliveryMode: "buyer-delivery", confirmationCode: "365728", escrowStatus: "blocked", date: "2026-02-07" },
  { id: "CMD-007", buyer: "Jean-Pierre Fotso", buyerId: 2, seller: "Samuel Ekane", sellerId: 4, article: "Baskets Adidas Yeezy", articleId: 12, amount: 55000, commission: 5500, shippingCost: 2500, status: "delivered", deliveryMode: "seller-delivery", confirmationCode: "648291", escrowStatus: "released", date: "2026-02-06" },
  { id: "CMD-008", buyer: "Carine Essomba", buyerId: 9, seller: "Paul Mbarga", sellerId: 6, article: "Nike Air Max 90", articleId: 3, amount: 25000, commission: 2500, shippingCost: 2000, status: "refunded", deliveryMode: "main-propre", confirmationCode: "173854", escrowStatus: "released", date: "2026-02-09" },
  { id: "CMD-009", buyer: "Eric Tchinda", buyerId: 12, seller: "Amina Bello", sellerId: 1, article: "Robe d'été fleurie", articleId: 1, amount: 8500, commission: 850, shippingCost: 1500, status: "in_delivery", deliveryMode: "buyer-delivery", confirmationCode: "925471", escrowStatus: "blocked", date: "2026-02-12" },
  { id: "CMD-010", buyer: "Yves Nkoulou", buyerId: 10, seller: "David Tagne", sellerId: 8, article: "Console PS5", articleId: 8, amount: 220000, commission: 22000, shippingCost: 4000, status: "paid_escrow", deliveryMode: "seller-delivery", confirmationCode: "418263", escrowStatus: "blocked", date: "2026-02-13" },
];

// ---------- DISPUTES ----------
export const mockDisputes: MockDispute[] = [
  { id: "LIT-001", buyer: "Amina Bello", buyerId: 1, seller: "Sandrine Ateba", sellerId: 11, article: "Table basse en bois", articleId: 9, reason: "Article endommagé à la réception", status: "open", createdDate: "2026-02-08", description: "La table présente des rayures profondes non mentionnées dans l'annonce." },
  { id: "LIT-002", buyer: "Carine Essomba", buyerId: 9, seller: "Paul Mbarga", sellerId: 6, article: "Nike Air Max 90", articleId: 3, reason: "Article non conforme", status: "resolved", createdDate: "2026-02-09", description: "La pointure ne correspond pas. Vendeur a envoyé du 42 au lieu du 44." },
  { id: "LIT-003", buyer: "Fatou Diallo", buyerId: 5, seller: "Marie Ndongo", sellerId: 3, article: "Sac Louis Vuitton (Suspect)", articleId: 5, reason: "Contrefaçon suspectée", status: "escalated", createdDate: "2026-02-11", description: "L'article semble être une contrefaçon. Les coutures et le logo ne correspondent pas à l'original." },
  { id: "LIT-004", buyer: "David Tagne", buyerId: 8, seller: "Eric Tchinda", sellerId: 12, article: "Lunettes Ray-Ban", articleId: 10, reason: "Article jamais reçu", status: "in-review", createdDate: "2026-02-12", description: "Le colis indique livré mais je n'ai rien reçu. Le vendeur ne répond plus." },
  { id: "LIT-005", buyer: "Jean-Pierre Fotso", buyerId: 2, seller: "Yves Nkoulou", sellerId: 10, article: "iPhone 13 Pro", articleId: 4, reason: "Batterie défectueuse", status: "open", createdDate: "2026-02-13", description: "Le téléphone s'éteint à 40% de batterie. Le vendeur a indiqué 'Bon état' mais la batterie est usée." },
];

// ---------- CATEGORIES ----------
export const mockCategories: MockCategory[] = [
  { id: 1, name: "Femme", slug: "femme", articlesCount: 1250, enabled: true, subGroups: [
    { id: 110, name: "Vêtements", articlesCount: 620, items: [
      { id: 111, name: "Robes", articlesCount: 120 },
      { id: 112, name: "Hauts et t-shirts", articlesCount: 95 },
      { id: 113, name: "Pantalons et leggings", articlesCount: 80 },
      { id: 114, name: "Jupes", articlesCount: 55 },
      { id: 115, name: "Jeans", articlesCount: 70 },
      { id: 116, name: "Sweats et sweats à capuche", articlesCount: 45 },
      { id: 117, name: "Manteaux et vestes", articlesCount: 60 },
      { id: 118, name: "Blazers et tailleurs", articlesCount: 30 },
      { id: 119, name: "Shorts", articlesCount: 25 },
      { id: 120, name: "Maillots de bain", articlesCount: 15 },
      { id: 121, name: "Lingerie et pyjamas", articlesCount: 10 },
      { id: 122, name: "Vêtements de sport", articlesCount: 10 },
      { id: 123, name: "Maternité", articlesCount: 5 },
    ]},
    { id: 130, name: "Chaussures", articlesCount: 220, items: [
      { id: 131, name: "Baskets", articlesCount: 80 },
      { id: 132, name: "Sandales", articlesCount: 55 },
      { id: 133, name: "Talons", articlesCount: 50 },
      { id: 134, name: "Bottes", articlesCount: 35 },
    ]},
    { id: 140, name: "Sacs", articlesCount: 195, items: [
      { id: 141, name: "Sacs à main", articlesCount: 130 },
      { id: 142, name: "Sacs à dos", articlesCount: 65 },
    ]},
    { id: 150, name: "Accessoires", articlesCount: 120, items: [
      { id: 151, name: "Bijoux", articlesCount: 50 },
      { id: 152, name: "Ceintures", articlesCount: 35 },
      { id: 153, name: "Lunettes", articlesCount: 35 },
    ]},
    { id: 160, name: "Beauté", articlesCount: 95, items: [
      { id: 161, name: "Maquillage", articlesCount: 40 },
      { id: 162, name: "Soins", articlesCount: 30 },
      { id: 163, name: "Parfums", articlesCount: 25 },
    ]},
  ]},
  { id: 2, name: "Homme", slug: "homme", articlesCount: 980, enabled: true, subGroups: [
    { id: 210, name: "Vêtements", articlesCount: 580, items: [
      { id: 211, name: "T-shirts et polos", articlesCount: 140 },
      { id: 212, name: "Chemises", articlesCount: 80 },
      { id: 213, name: "Pantalons", articlesCount: 90 },
      { id: 214, name: "Jeans", articlesCount: 75 },
      { id: 215, name: "Sweats et hoodies", articlesCount: 65 },
      { id: 216, name: "Vestes et manteaux", articlesCount: 60 },
      { id: 217, name: "Costumes", articlesCount: 40 },
      { id: 218, name: "Shorts", articlesCount: 30 },
    ]},
    { id: 220, name: "Chaussures", articlesCount: 200, items: [
      { id: 221, name: "Baskets", articlesCount: 100 },
      { id: 222, name: "Chaussures de ville", articlesCount: 60 },
      { id: 223, name: "Bottes", articlesCount: 40 },
    ]},
    { id: 230, name: "Accessoires", articlesCount: 200, items: [
      { id: 231, name: "Montres", articlesCount: 80 },
      { id: 232, name: "Ceintures", articlesCount: 60 },
      { id: 233, name: "Sacs", articlesCount: 60 },
    ]},
  ]},
  { id: 3, name: "Enfant", slug: "enfant", articlesCount: 450, enabled: true, subGroups: [
    { id: 310, name: "Fille", articlesCount: 180, items: [
      { id: 311, name: "Robes", articlesCount: 70 },
      { id: 312, name: "Hauts", articlesCount: 60 },
      { id: 313, name: "Pantalons", articlesCount: 50 },
    ]},
    { id: 320, name: "Garçon", articlesCount: 150, items: [
      { id: 321, name: "T-shirts", articlesCount: 60 },
      { id: 322, name: "Pantalons", articlesCount: 50 },
      { id: 323, name: "Sweats", articlesCount: 40 },
    ]},
    { id: 330, name: "Bébé", articlesCount: 80, items: [
      { id: 331, name: "Bodies", articlesCount: 45 },
      { id: 332, name: "Pyjamas", articlesCount: 35 },
    ]},
    { id: 340, name: "Chaussures", articlesCount: 40, items: [] },
  ]},
  { id: 4, name: "Maison", slug: "maison", articlesCount: 320, enabled: true, subGroups: [
    { id: 410, name: "Décoration", articlesCount: 130, items: [
      { id: 411, name: "Coussins", articlesCount: 45 },
      { id: 412, name: "Cadres", articlesCount: 40 },
      { id: 413, name: "Bougies", articlesCount: 45 },
    ]},
    { id: 420, name: "Linge de maison", articlesCount: 90, items: [
      { id: 421, name: "Draps", articlesCount: 50 },
      { id: 422, name: "Serviettes", articlesCount: 40 },
    ]},
    { id: 430, name: "Cuisine", articlesCount: 100, items: [
      { id: 431, name: "Vaisselle", articlesCount: 55 },
      { id: 432, name: "Ustensiles", articlesCount: 45 },
    ]},
  ]},
  { id: 5, name: "Électronique", slug: "electronique", articlesCount: 280, enabled: true, subGroups: [
    { id: 510, name: "Téléphones", articlesCount: 120, items: [
      { id: 511, name: "Smartphones", articlesCount: 90 },
      { id: 512, name: "Coques et accessoires", articlesCount: 30 },
    ]},
    { id: 520, name: "Informatique", articlesCount: 80, items: [
      { id: 521, name: "Ordinateurs portables", articlesCount: 35 },
      { id: 522, name: "Tablettes", articlesCount: 25 },
      { id: 523, name: "Accessoires", articlesCount: 20 },
    ]},
    { id: 530, name: "Audio & Photo", articlesCount: 80, items: [
      { id: 531, name: "Écouteurs", articlesCount: 35 },
      { id: 532, name: "Enceintes", articlesCount: 25 },
      { id: 533, name: "Appareils photo", articlesCount: 20 },
    ]},
  ]},
  { id: 6, name: "Loisirs", slug: "loisirs", articlesCount: 190, enabled: true, subGroups: [
    { id: 610, name: "Jeux & Jouets", articlesCount: 90, items: [
      { id: 611, name: "Jeux de société", articlesCount: 35 },
      { id: 612, name: "Puzzles", articlesCount: 25 },
      { id: 613, name: "Figurines", articlesCount: 30 },
    ]},
    { id: 620, name: "Collections", articlesCount: 50, items: [
      { id: 621, name: "Vinyles", articlesCount: 25 },
      { id: 622, name: "Cartes", articlesCount: 25 },
    ]},
    { id: 630, name: "Loisirs créatifs", articlesCount: 50, items: [] },
  ]},
  { id: 7, name: "Sport", slug: "sport", articlesCount: 210, enabled: true, subGroups: [
    { id: 710, name: "Vêtements de sport", articlesCount: 100, items: [
      { id: 711, name: "Running", articlesCount: 35 },
      { id: 712, name: "Fitness", articlesCount: 35 },
      { id: 713, name: "Football", articlesCount: 30 },
    ]},
    { id: 720, name: "Chaussures de sport", articlesCount: 70, items: [] },
    { id: 730, name: "Équipement", articlesCount: 40, items: [
      { id: 731, name: "Vélos", articlesCount: 20 },
      { id: 732, name: "Accessoires", articlesCount: 20 },
    ]},
  ]},
  { id: 8, name: "Divertissement", slug: "divertissement", articlesCount: 150, enabled: false, subGroups: [
    { id: 810, name: "Livres", articlesCount: 50, items: [
      { id: 811, name: "Romans", articlesCount: 20 },
      { id: 812, name: "BD & Mangas", articlesCount: 15 },
      { id: 813, name: "Manuels scolaires", articlesCount: 15 },
    ]},
    { id: 820, name: "Musique & Films", articlesCount: 40, items: [
      { id: 821, name: "CD & Vinyles", articlesCount: 20 },
      { id: 822, name: "DVD & Blu-ray", articlesCount: 20 },
    ]},
    { id: 830, name: "Jeux vidéo", articlesCount: 60, items: [
      { id: 831, name: "Consoles", articlesCount: 30 },
      { id: 832, name: "Jeux", articlesCount: 30 },
    ]},
  ]},
];

// ---------- REVENUE DATA (for charts) ----------
export const revenueData = [
  { date: "Jan 15", revenue: 125000 },
  { date: "Jan 18", revenue: 89000 },
  { date: "Jan 21", revenue: 156000 },
  { date: "Jan 24", revenue: 210000 },
  { date: "Jan 27", revenue: 178000 },
  { date: "Jan 30", revenue: 245000 },
  { date: "Feb 02", revenue: 198000 },
  { date: "Feb 05", revenue: 312000 },
  { date: "Feb 08", revenue: 267000 },
  { date: "Feb 11", revenue: 389000 },
  { date: "Feb 13", revenue: 420000 },
];

export const usersData = [
  { week: "Sem 1", newUsers: 45 },
  { week: "Sem 2", newUsers: 62 },
  { week: "Sem 3", newUsers: 38 },
  { week: "Sem 4", newUsers: 85 },
  { week: "Sem 5", newUsers: 72 },
  { week: "Sem 6", newUsers: 95 },
];

// ---------- RECENT ACTIVITY ----------
export interface ActivityItem {
  id: number;
  type: "signup" | "sale" | "dispute" | "article";
  message: string;
  time: string;
}

export const recentActivity: ActivityItem[] = [
  { id: 1, type: "signup", message: "Carine Essomba a créé un compte", time: "Il y a 2 min" },
  { id: 2, type: "sale", message: "Commande CMD-010 — Console PS5 (220 000 GNF)", time: "Il y a 15 min" },
  { id: 3, type: "article", message: "Pyjama enfant Disney en attente de validation", time: "Il y a 30 min" },
  { id: 4, type: "dispute", message: "Nouveau litige LIT-005 ouvert — iPhone 13 Pro", time: "Il y a 1h" },
  { id: 5, type: "sale", message: "Commande CMD-009 expédiée — Robe d'été fleurie", time: "Il y a 2h" },
  { id: 6, type: "signup", message: "Fatou Diallo a créé un compte", time: "Il y a 3h" },
  { id: 7, type: "article", message: "Nike Air Max 90 en attente de validation", time: "Il y a 4h" },
  { id: 8, type: "sale", message: "Commande CMD-005 payée — Robe de soirée noire", time: "Il y a 5h" },
];

// ============== MOCK DATA FOR USER DASHBOARD ==============

export interface DashboardUser {
  id: number;
  name: string;
  pseudo: string;
  phone: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  purchasesCount: number;
  articlesCount: number;
  walletBalance: number;
}

export const mockCurrentUser: DashboardUser = {
  id: 1,
  name: "Amina Bello",
  pseudo: "amina_b",
  phone: "+224 690 123 456",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  bio: "Passionnée de mode et de seconde main. Je vends des pièces uniques que je déniche avec soin.",
  joinedDate: "2025-08-15",
  rating: 4.8,
  reviewsCount: 32,
  salesCount: 18,
  purchasesCount: 7,
  articlesCount: 24,
  walletBalance: 45600,
};

export interface UserListing {
  id: number;
  title: string;
  image: string;
  category: string;
  price: number;
  condition: string;
  size?: string;
  description: string;
  status: "active" | "sold" | "draft";
  views: number;
  favorites: number;
  postedDate: string;
}

export const mockUserListings: UserListing[] = [
  { id: 1, title: "Robe d'été fleurie", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop", category: "Femme", price: 8500, condition: "Bon état", size: "M", description: "Belle robe d'été avec motifs floraux, portée 2 fois.", status: "active", views: 124, favorites: 18, postedDate: "2026-02-10" },
  { id: 2, title: "Sac à main cuir marron", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop", category: "Femme", price: 15000, condition: "Très bon état", description: "Sac en cuir véritable, très peu utilisé.", status: "active", views: 89, favorites: 12, postedDate: "2026-02-08" },
  { id: 3, title: "Baskets Nike blanches", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop", category: "Sport", price: 22000, condition: "Neuf avec étiquette", size: "38", description: "Baskets Nike Air Force 1, jamais portées.", status: "active", views: 203, favorites: 34, postedDate: "2026-02-05" },
  { id: 4, title: "Chemisier en soie", image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&h=300&fit=crop", category: "Femme", price: 12000, condition: "Bon état", size: "S", description: "Chemisier élégant en soie, parfait pour le bureau.", status: "sold", views: 156, favorites: 22, postedDate: "2026-01-28" },
  { id: 5, title: "Montre Casio vintage", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=300&fit=crop", category: "Loisirs", price: 18000, condition: "Bon état", description: "Montre Casio des années 90, fonctionne parfaitement.", status: "sold", views: 98, favorites: 15, postedDate: "2026-01-20" },
  { id: 6, title: "Jean taille haute", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop", category: "Femme", price: 9500, condition: "Très bon état", size: "36", description: "Jean taille haute coupe droite.", status: "active", views: 67, favorites: 8, postedDate: "2026-02-12" },
  { id: 7, title: "Lampe de chevet design", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=300&h=300&fit=crop", category: "Maison", price: 7500, condition: "Neuf", description: "Lampe moderne, encore dans son emballage.", status: "draft", views: 0, favorites: 0, postedDate: "2026-02-13" },
  { id: 8, title: "Livre collection Harry Potter", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop", category: "Loisirs", price: 25000, condition: "Très bon état", description: "Collection complète des 7 tomes en français.", status: "active", views: 145, favorites: 27, postedDate: "2026-02-01" },
];

export interface UserOrder {
  id: string;
  type: "purchase" | "sale";
  article: string;
  articleImage: string;
  otherParty: string;
  otherPartyAvatar: string;
  amount: number;
  shippingCost: number;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  confirmationCode: string;
  escrowStatus: EscrowStatus;
  date: string;
  trackingNumber?: string;
}

export const mockUserOrders: UserOrder[] = [
  { id: "CMD-001", type: "sale", article: "Robe d'été fleurie", articleImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&h=100&fit=crop", otherParty: "Fatou Diallo", otherPartyAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", amount: 8500, shippingCost: 1500, status: "delivered", deliveryMode: "main-propre", confirmationCode: "482917", escrowStatus: "released", date: "2026-02-10", trackingNumber: "GN123456789" },
  { id: "CMD-009", type: "sale", article: "Robe d'été fleurie", articleImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&h=100&fit=crop", otherParty: "Eric Tchinda", otherPartyAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", amount: 8500, shippingCost: 1500, status: "in_delivery", deliveryMode: "buyer-delivery", confirmationCode: "925471", escrowStatus: "blocked", date: "2026-02-12", trackingNumber: "GN987654321" },
  { id: "CMD-006", type: "purchase", article: "Table basse en bois", articleImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=100&h=100&fit=crop", otherParty: "Sandrine Ateba", otherPartyAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", amount: 35000, shippingCost: 5000, status: "disputed", deliveryMode: "buyer-delivery", confirmationCode: "365728", escrowStatus: "blocked", date: "2026-02-07" },
  { id: "CMD-015", type: "purchase", article: "Console PS5", articleImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=100&h=100&fit=crop", otherParty: "David Tagne", otherPartyAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", amount: 220000, shippingCost: 4000, status: "paid_escrow", deliveryMode: "seller-delivery", confirmationCode: "418263", escrowStatus: "blocked", date: "2026-02-13" },
  { id: "CMD-012", type: "sale", article: "Chemisier en soie", articleImage: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=100&h=100&fit=crop", otherParty: "Aisha Njoya", otherPartyAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", amount: 12000, shippingCost: 1500, status: "delivered", deliveryMode: "seller-delivery", confirmationCode: "648291", escrowStatus: "released", date: "2026-01-30" },
  { id: "CMD-016", type: "purchase", article: "Baskets Adidas Yeezy", articleImage: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=100&h=100&fit=crop", otherParty: "Samuel Ekane", otherPartyAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", amount: 55000, shippingCost: 2500, status: "delivered", deliveryMode: "main-propre", confirmationCode: "173854", escrowStatus: "released", date: "2026-02-06" },
  { id: "CMD-018", type: "sale", article: "Montre Casio vintage", articleImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop", otherParty: "Paul Mbarga", otherPartyAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop", amount: 18000, shippingCost: 1500, status: "delivered", deliveryMode: "main-propre", confirmationCode: "274619", escrowStatus: "released", date: "2026-01-25" },
  { id: "CMD-020", type: "purchase", article: "Veste en cuir vintage", articleImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop", otherParty: "Jean-Pierre Fotso", otherPartyAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", amount: 22000, shippingCost: 2500, status: "awaiting_confirmation", deliveryMode: "buyer-delivery", confirmationCode: "539182", escrowStatus: "blocked", date: "2026-02-13" },
];

export interface UserTransaction {
  id: string;
  type: "sale" | "withdrawal" | "refund" | "bonus";
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
}

export const mockUserTransactions: UserTransaction[] = [
  { id: "TRX-001", type: "sale", description: "Vente — Robe d'été fleurie", amount: 7650, status: "completed", date: "2026-02-10" },
  { id: "TRX-002", type: "withdrawal", description: "Retrait vers Mobile Money", amount: -30000, status: "completed", date: "2026-02-09" },
  { id: "TRX-003", type: "sale", description: "Vente — Chemisier en soie", amount: 10800, status: "completed", date: "2026-01-30" },
  { id: "TRX-004", type: "sale", description: "Vente — Montre Casio vintage", amount: 16200, status: "completed", date: "2026-01-25" },
  { id: "TRX-005", type: "refund", description: "Remboursement — Litige CMD-006", amount: 35000, status: "pending", date: "2026-02-08" },
  { id: "TRX-006", type: "withdrawal", description: "Retrait vers Mobile Money", amount: -20000, status: "completed", date: "2026-01-20" },
  { id: "TRX-007", type: "bonus", description: "Bonus parrainage — Fatou Diallo", amount: 500, status: "completed", date: "2026-01-18" },
  { id: "TRX-008", type: "sale", description: "Vente — Robe d'été fleurie (2e)", amount: 7650, status: "pending", date: "2026-02-12" },
];

export interface UserFavorite {
  id: number;
  image: string;
  title: string;
  brand: string;
  condition: string;
  size?: string;
  price: number;
  priceWithShipping: number;
  favorites: number;
  seller: string;
  sellerAvatar: string;
  addedDate: string;
}

export const mockUserFavorites: UserFavorite[] = [
  { id: 2, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop", title: "Jean Levi's 501", brand: "Levi's", condition: "Très bon état", size: "32", price: 15000, priceWithShipping: 17000, favorites: 24, seller: "Samuel Ekane", sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", addedDate: "2026-02-12" },
  { id: 4, image: "https://images.unsplash.com/photo-1632661674596-df8be0860f4c?w=300&h=300&fit=crop", title: "iPhone 13 Pro", brand: "Apple", condition: "Bon état", price: 180000, priceWithShipping: 183000, favorites: 56, seller: "Yves Nkoulou", sellerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", addedDate: "2026-02-11" },
  { id: 7, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop", title: "Robe de soirée noire", brand: "Zara", condition: "Très bon état", size: "S", price: 12000, priceWithShipping: 13500, favorites: 19, seller: "Aisha Njoya", sellerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", addedDate: "2026-02-10" },
  { id: 12, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=300&h=300&fit=crop", title: "Baskets Adidas Yeezy", brand: "Adidas", condition: "Neuf avec étiquette", size: "42", price: 55000, priceWithShipping: 57500, favorites: 41, seller: "Samuel Ekane", sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", addedDate: "2026-02-08" },
  { id: 8, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=300&fit=crop", title: "Console PS5", brand: "Sony", condition: "Bon état", price: 220000, priceWithShipping: 224000, favorites: 63, seller: "David Tagne", sellerAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", addedDate: "2026-02-06" },
  { id: 9, image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&h=300&fit=crop", title: "Table basse en bois", brand: "Artisan local", condition: "Très bon état", price: 35000, priceWithShipping: 40000, favorites: 11, seller: "Sandrine Ateba", sellerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", addedDate: "2026-02-03" },
];

export interface Conversation {
  id: number;
  participant: string;
  participantAvatar: string;
  articleTitle: string;
  articleImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
}

export const mockConversations: Conversation[] = [
  {
    id: 1,
    participant: "Fatou Diallo",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    articleTitle: "Robe d'été fleurie",
    articleImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&h=100&fit=crop",
    lastMessage: "Merci beaucoup, j'ai bien reçu la robe !",
    lastMessageTime: "Il y a 2h",
    unread: 0,
    messages: [
      { id: 1, sender: "other", text: "Bonjour ! La robe est-elle toujours disponible ?", time: "10 Fév, 09:00" },
      { id: 2, sender: "me", text: "Bonjour Fatou ! Oui, elle est toujours en vente.", time: "10 Fév, 09:15" },
      { id: 3, sender: "other", text: "Super ! Je l'achète tout de suite.", time: "10 Fév, 09:20" },
      { id: 4, sender: "me", text: "Parfait, je prépare le colis aujourd'hui.", time: "10 Fév, 10:00" },
      { id: 5, sender: "other", text: "Merci beaucoup, j'ai bien reçu la robe !", time: "12 Fév, 14:30" },
    ],
  },
  {
    id: 2,
    participant: "Samuel Ekane",
    participantAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    articleTitle: "Baskets Adidas Yeezy",
    articleImage: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=100&h=100&fit=crop",
    lastMessage: "Est-ce que tu accepterais 50 000 F ?",
    lastMessageTime: "Il y a 30 min",
    unread: 2,
    messages: [
      { id: 1, sender: "me", text: "Salut Samuel ! Les Yeezy sont encore dispo ?", time: "13 Fév, 08:00" },
      { id: 2, sender: "other", text: "Salut ! Oui elles sont disponibles, taille 42.", time: "13 Fév, 08:10" },
      { id: 3, sender: "me", text: "Le prix est négociable ?", time: "13 Fév, 08:15" },
      { id: 4, sender: "other", text: "Est-ce que tu accepterais 50 000 F ?", time: "13 Fév, 08:20" },
    ],
  },
  {
    id: 3,
    participant: "Aisha Njoya",
    participantAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    articleTitle: "Chemisier en soie",
    articleImage: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=100&h=100&fit=crop",
    lastMessage: "Le chemisier est magnifique, merci !",
    lastMessageTime: "Il y a 1 jour",
    unread: 0,
    messages: [
      { id: 1, sender: "other", text: "Bonjour, est-ce que le chemisier taille grand ?", time: "29 Jan, 15:00" },
      { id: 2, sender: "me", text: "Bonjour Aisha ! Il taille normalement, c'est du S classique.", time: "29 Jan, 15:30" },
      { id: 3, sender: "other", text: "Parfait, je le prends !", time: "29 Jan, 16:00" },
      { id: 4, sender: "me", text: "Super ! Envoyé aujourd'hui.", time: "30 Jan, 09:00" },
      { id: 5, sender: "other", text: "Le chemisier est magnifique, merci !", time: "02 Fév, 11:00" },
    ],
  },
  {
    id: 4,
    participant: "Sandrine Ateba",
    participantAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    articleTitle: "Table basse en bois",
    articleImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=100&h=100&fit=crop",
    lastMessage: "J'ai ouvert un litige pour ce problème.",
    lastMessageTime: "Il y a 5 jours",
    unread: 1,
    messages: [
      { id: 1, sender: "me", text: "Bonjour, la table est arrivée mais elle a des rayures.", time: "08 Fév, 10:00" },
      { id: 2, sender: "other", text: "Bonjour, je suis désolée. Elle n'avait pas de rayures quand je l'ai envoyée.", time: "08 Fév, 11:00" },
      { id: 3, sender: "me", text: "J'ai ouvert un litige pour ce problème.", time: "08 Fév, 12:00" },
    ],
  },
  {
    id: 5,
    participant: "Paul Mbarga",
    participantAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
    articleTitle: "Montre Casio vintage",
    articleImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop",
    lastMessage: "Excellente montre, pile changée, fonctionne au top !",
    lastMessageTime: "Il y a 2 sem",
    unread: 0,
    messages: [
      { id: 1, sender: "other", text: "Salut ! La montre fonctionne encore bien ?", time: "20 Jan, 14:00" },
      { id: 2, sender: "me", text: "Oui, elle marche très bien ! Pile récente.", time: "20 Jan, 14:30" },
      { id: 3, sender: "other", text: "OK, j'achète !", time: "20 Jan, 15:00" },
      { id: 4, sender: "other", text: "Excellente montre, pile changée, fonctionne au top !", time: "27 Jan, 10:00" },
    ],
  },
];

export interface UserSalesChartData {
  label: string;
  ventes: number;
  achats: number;
}

export const mockUserSalesChartWeek: UserSalesChartData[] = [
  { label: "Lun", ventes: 1, achats: 0 },
  { label: "Mar", ventes: 0, achats: 1 },
  { label: "Mer", ventes: 2, achats: 0 },
  { label: "Jeu", ventes: 0, achats: 0 },
  { label: "Ven", ventes: 1, achats: 1 },
  { label: "Sam", ventes: 3, achats: 0 },
  { label: "Dim", ventes: 0, achats: 1 },
];

export const mockUserSalesChartMonth: UserSalesChartData[] = [
  { label: "Sem 1", ventes: 3, achats: 1 },
  { label: "Sem 2", ventes: 5, achats: 2 },
  { label: "Sem 3", ventes: 2, achats: 3 },
  { label: "Sem 4", ventes: 4, achats: 1 },
];

export const mockUserSalesChartYear: UserSalesChartData[] = [
  { label: "Sep", ventes: 2, achats: 1 },
  { label: "Oct", ventes: 3, achats: 0 },
  { label: "Nov", ventes: 1, achats: 2 },
  { label: "Déc", ventes: 4, achats: 1 },
  { label: "Jan", ventes: 5, achats: 2 },
  { label: "Fév", ventes: 3, achats: 1 },
];

export interface UserActivityItem {
  id: number;
  type: "sale" | "purchase" | "message" | "favorite" | "listing";
  message: string;
  time: string;
}

export const mockUserActivity: UserActivityItem[] = [
  { id: 1, type: "sale", message: "Vous avez vendu 'Robe d'été fleurie' à Eric Tchinda", time: "Il y a 1 jour" },
  { id: 2, type: "message", message: "Nouveau message de Samuel Ekane", time: "Il y a 30 min" },
  { id: 3, type: "purchase", message: "Commande en cours — Console PS5", time: "Il y a 2h" },
  { id: 4, type: "favorite", message: "'iPhone 13 Pro' ajouté à vos favoris", time: "Il y a 1 jour" },
  { id: 5, type: "listing", message: "Votre article 'Jean taille haute' est en ligne", time: "Il y a 1 jour" },
  { id: 6, type: "sale", message: "Paiement reçu pour 'Chemisier en soie'", time: "Il y a 2 sem" },
  { id: 7, type: "message", message: "Nouveau message de Sandrine Ateba", time: "Il y a 5 jours" },
  { id: 8, type: "purchase", message: "Livraison confirmée — Baskets Adidas Yeezy", time: "Il y a 1 sem" },
];
