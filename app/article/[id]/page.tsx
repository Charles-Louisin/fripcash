"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart-store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { ProductCard, type Product } from "@/components/product-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FiHome,
  FiHeart,
  FiShare2,
  FiShield,
  FiStar,
  FiCheck,
  FiMessageCircle,
  FiSend,
  FiCamera,
  FiX,
  FiChevronDown,
  FiImage,
} from "react-icons/fi";
import { IoStarSharp, IoStarOutline } from "react-icons/io5";

/* ─── Extended product type for detail view ─── */

interface ProductDetail extends Product {
  images: string[];
  description: string;
  color?: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    memberSince: string;
  };
}

/* ─── Mock products (keyed by id) ─── */

const mockProducts: Record<string, ProductDetail> = {
  "1": {
    id: 1,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
    ],
    brand: "Nike",
    condition: "Neuf sans étiquette",
    size: "M / 38",
    price: 43.0,
    priceWithShipping: 45.85,
    favorites: 19,
    href: "/article/1",
    category: "Sport",
    color: "Noir",
    description:
      "Baskets Nike en excellent état, portées seulement 2 fois. Modèle Air Max 90, couleur noire. Semelle intacte, pas de traces d'usure. Taille 38, correspond bien à la taille.",
    seller: {
      name: "Amina N.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      rating: 4.8,
      reviews: 23,
      memberSince: "Mars 2024",
    },
  },
};

/* Default fallback for any product ID not in the map */
const fallbackProduct: ProductDetail = {
  id: 0,
  image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&h=800&fit=crop",
  ],
  brand: "Domyos",
  condition: "Bon état",
  size: "L / 42",
  price: 8.0,
  priceWithShipping: 10.95,
  favorites: 4,
  href: "/article/0",
  category: "Femme",
  color: "Violet",
  description:
    "Débardeur de sport Domyos, tissu respirant, idéal pour le fitness ou le yoga. Coupe ajustée, légères traces d'usure au niveau du col. Très confortable et léger.",
  seller: {
    name: "Carine F.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    rating: 4.5,
    reviews: 12,
    memberSince: "Janvier 2025",
  },
};

/* Similar products mock */
const similarProducts: Product[] = [
  { id: 101, image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=400&fit=crop", brand: "Hipsline", condition: "Très bon état", price: 15, priceWithShipping: 16.45, favorites: 15, href: "/article/2" },
  { id: 102, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", brand: "H&M", condition: "Neuf avec étiquette", price: 39, priceWithShipping: 41.65, favorites: 25, href: "/article/4" },
  { id: 103, image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop", brand: "Adidas", condition: "Très bon état", size: "M", price: 22, priceWithShipping: 24.5, favorites: 32, href: "/article/7" },
  { id: 104, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop", brand: "Levi's", condition: "Très bon état", price: 35, priceWithShipping: 37.45, favorites: 42, href: "/article/10" },
  { id: 105, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop", brand: "Ralph Lauren", condition: "Neuf sans étiquette", size: "M", price: 65, priceWithShipping: 68.5, favorites: 33, href: "/article/16" },
  { id: 106, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop", brand: "Reebok", condition: "Neuf sans étiquette", price: 55, priceWithShipping: 58.45, favorites: 14, href: "/article/12" },
];

/* ─── Review type + mock reviews ─── */

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
}

const initialReviews: Review[] = [
  {
    id: 1,
    author: "Jean-Paul M.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Article conforme à la description, envoi rapide et bien emballé. Je recommande ce vendeur !",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&fit=crop",
    ],
  },
  {
    id: 2,
    author: "Sophie L.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    rating: 4,
    date: "Il y a 1 semaine",
    comment: "Bon état général, quelques traces d'usure non mentionnées mais rien de grave. Satisfaite de mon achat.",
  },
  {
    id: 3,
    author: "Thierry N.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 2 semaines",
    comment: "Parfait ! Exactement comme sur les photos. Vendeur très réactif.",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop",
    ],
  },
  {
    id: 4,
    author: "Amina B.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 3 semaines",
    comment: "Trop contente de mon achat ! La qualité est au rendez-vous et le vendeur a été super réactif. Je recommande à 100%.",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&h=300&fit=crop",
    ],
  },
  {
    id: 5,
    author: "Fabrice K.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 3,
    date: "Il y a 1 mois",
    comment: "L'article est correct mais la taille ne correspondait pas exactement. Communication un peu lente avec le vendeur.",
  },
  {
    id: 6,
    author: "Marie-Claire D.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 1 mois",
    comment: "Magnifique ! L'article est comme neuf, livraison rapide. Je suis fan de cette plateforme.",
  },
  {
    id: 7,
    author: "Patrick O.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    rating: 4,
    date: "Il y a 1 mois",
    comment: "Très bon rapport qualité/prix. L'emballage était soigné. Petit délai de livraison mais rien de grave.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
    ],
  },
  {
    id: 8,
    author: "Estelle N.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    rating: 2,
    date: "Il y a 2 mois",
    comment: "Déçue, l'article avait une tache non mentionnée dans l'annonce. Le vendeur a quand même été compréhensif pour le remboursement.",
  },
  {
    id: 9,
    author: "Yves T.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 2 mois",
    comment: "Super expérience du début à la fin. L'article est exactement comme décrit. Merci !",
  },
  {
    id: 10,
    author: "Chantal M.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    rating: 4,
    date: "Il y a 3 mois",
    comment: "Bon achat dans l'ensemble. Article propre et bien entretenu. La couleur est légèrement différente de la photo.",
  },
];

/* ─── Page ─── */

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const product = mockProducts[id] ?? { ...fallbackProduct, id: Number(id) || 0 };
  const { toast } = useToast();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      image: product.image,
      brand: product.brand,
      condition: product.condition,
      size: product.size,
      price: product.price,
      priceWithShipping: product.priceWithShipping,
      href: product.href,
    });
    toast("Article ajouté au panier !", "success");
    openCart();
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerSent, setOfferSent] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const reviewImageInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<number>(0); // 0 = all, 1-5 = star filter
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const REVIEWS_PER_PAGE = 3;

  // Computed: rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const photosCount = reviews.filter((r) => r.images && r.images.length > 0).length;

  // Computed: filtered + paginated reviews
  const filteredReviews = reviewFilter === 0
    ? reviews
    : reviewFilter === -1
      ? reviews.filter((r) => r.images && r.images.length > 0)
      : reviews.filter((r) => r.rating === reviewFilter);
  const paginatedReviews = filteredReviews.slice(0, reviewsToShow);
  const hasMoreReviews = filteredReviews.length > reviewsToShow;

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 4 - reviewImages.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReviewImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostReview = () => {
    if (!reviewText.trim() || reviewRating === 0) return;
    const newReview: Review = {
      id: Date.now(),
      author: "Toi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      rating: reviewRating,
      date: "À l'instant",
      comment: reviewText.trim(),
      images: reviewImages.length > 0 ? [...reviewImages] : undefined,
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReviewRating(0);
    setReviewImages([]);
    toast("Ton avis a été publié !");
  };

  const handleSendOffer = () => {
    if (!offerPrice || Number(offerPrice) <= 0) return;
    setOfferSent(true);
    toast("Offre envoyée ! Le vendeur a été notifié.");
  };

  const handleCloseOffer = () => {
    setOfferOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setOfferSent(false);
      setOfferPrice("");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-28 lg:pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 overflow-x-auto">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors shrink-0">
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/produits`} className="hover:text-primary transition-colors shrink-0">
                  {product.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate">
              {product.brand}
            </span>
          </nav>

          {/* Desktop: 2 columns / Mobile: stacked */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* ─── Image Gallery ─── */}
            <div>
              {/* Main + thumbnails grid (Vinted-style) */}
              <div className="grid grid-cols-3 grid-rows-2 gap-2 rounded-lg overflow-hidden">
                {/* Main image — spans 2 rows on left */}
                <div className="col-span-2 row-span-2 relative aspect-[3/4] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[selectedImage]}
                    alt={product.brand}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />
                </div>

                {/* Thumbnails — stacked on right */}
                {product.images.slice(0, 3).map((img, i) => (
                  i > 0 && (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square bg-muted overflow-hidden ${
                        selectedImage === i ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.brand} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  )
                ))}
              </div>

              {/* Extra thumbnail strip if more than 3 images */}
              {product.images.length > 3 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden shrink-0 ${
                        selectedImage === i
                          ? "ring-2 ring-primary"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Favorite + Share row */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setLiked(!liked);
                    toast(
                      !liked ? "Article ajouté aux favoris." : "Article retiré des favoris.",
                      !liked ? "success" : "info"
                    );
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FiHeart
                    className={`h-5 w-5 ${liked ? "fill-primary text-primary" : ""}`}
                  />
                  <span>
                    {product.favorites + (liked ? 1 : 0)} favori
                    {product.favorites + (liked ? 1 : 0) !== 1 ? "s" : ""}
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast("Lien copié !", "info");
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FiShare2 className="h-4.5 w-4.5" />
                  Partager
                </button>
              </div>
            </div>

            {/* ─── Product Info ─── */}
            <div>
              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-foreground">
                  {product.price.toFixed(2)} &euro;
                </p>
                <p className="text-sm text-primary font-medium mt-0.5">
                  {product.priceWithShipping.toFixed(2)} &euro; frais de port inclus
                </p>
              </div>

              {/* Details */}
              <div className="border-t border-border pt-4 mb-4 space-y-3">
                <DetailRow label="Marque" value={product.brand} />
                <DetailRow label="État" value={product.condition} />
                {product.size && (
                  <DetailRow label="Taille" value={product.size} />
                )}
                {product.color && (
                  <DetailRow label="Couleur" value={product.color} />
                )}
                {product.category && (
                  <DetailRow label="Catégorie" value={product.category} />
                )}
              </div>

              {/* Posted time */}
              <div className="border-t border-border pt-4 mb-4">
                <p className="text-xs text-muted-foreground">
                  Ajouté &middot; Il y a une heure
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-border pt-4 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Seller card */}
              <div className="border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {product.seller.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiStar className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-foreground">
                        {product.seller.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({product.seller.reviews} avis)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Membre depuis {product.seller.memberSince}
                    </p>
                  </div>
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>

              {/* Protection badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                <FiShield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Protection acheteur
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paiement sécurisé et remboursement garanti
                  </p>
                </div>
              </div>

              {/* Desktop action buttons (hidden on mobile, shown on lg+) */}
              <div className="hidden lg:flex gap-3">
                <button
                  onClick={() => setOfferOpen(true)}
                  className="flex-1 h-12 rounded-full border-2 border-primary text-primary font-semibold text-base hover:bg-primary/5 transition-colors"
                >
                  Faire une offre
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
                >
                  Ajouter au panier
                </button>
              </div>

              {/* Message seller */}
              <button className="hidden lg:flex items-center justify-center gap-2 w-full mt-3 h-10 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <FiMessageCircle className="h-4 w-4" />
                Envoyer un message
              </button>
            </div>
          </div>

          {/* ─── Reviews ─── */}
          <section className="mt-16">
            {/* Header with rating summary */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
              {/* Left: big average score */}
              <div className="flex flex-col items-center sm:items-start shrink-0">
                <div className="text-5xl font-bold text-foreground tabular-nums">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IoStarSharp
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted-foreground/20 text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reviews.length} avis
                </p>
              </div>

              {/* Right: rating breakdown bars */}
              <div className="flex-1 space-y-1.5">
                {ratingCounts.map(({ star, count }) => {
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setReviewFilter(reviewFilter === star ? 0 : star);
                        setReviewsToShow(REVIEWS_PER_PAGE);
                      }}
                      className={`flex items-center gap-2 w-full group text-left transition-opacity ${
                        reviewFilter !== 0 && reviewFilter !== star && reviewFilter !== -1 ? "opacity-40" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground w-3 tabular-nums shrink-0">{star}</span>
                      <IoStarSharp className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right tabular-nums shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setReviewFilter(0); setReviewsToShow(REVIEWS_PER_PAGE); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  reviewFilter === 0
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Tous ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const cnt = ratingCounts.find((r) => r.star === star)?.count ?? 0;
                if (cnt === 0) return null;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { setReviewFilter(reviewFilter === star ? 0 : star); setReviewsToShow(REVIEWS_PER_PAGE); }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      reviewFilter === star
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {star} <IoStarSharp className="h-3 w-3 fill-yellow-400 text-yellow-400" /> ({cnt})
                  </button>
                );
              })}
              {photosCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setReviewFilter(reviewFilter === -1 ? 0 : -1); setReviewsToShow(REVIEWS_PER_PAGE); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    reviewFilter === -1
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <FiImage className="h-3 w-3" /> Avec photos ({photosCount})
                </button>
              )}
            </div>

            {/* Write a review */}
            <div className="border border-border rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Laisser un avis
              </h3>

              {/* Star picker */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || reviewRating) ? (
                      <IoStarSharp className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <IoStarOutline className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </button>
                ))}
                {reviewRating > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {reviewRating}/5
                  </span>
                )}
              </div>

              {/* Comment input */}
              <div className="relative">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Partage ton expérience avec cet article..."
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {/* Image upload for review */}
              <div className="mt-3">
                {/* Image previews */}
                {reviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reviewImages.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <FiX className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Add photo button */}
                  <button
                    type="button"
                    onClick={() => reviewImageInputRef.current?.click()}
                    disabled={reviewImages.length >= 4}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiCamera className="h-4 w-4" />
                    <span>Ajouter une photo ({reviewImages.length}/4)</span>
                  </button>
                  <input
                    ref={reviewImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReviewImageUpload}
                    className="hidden"
                  />

                  {/* Submit button */}
                  <button
                    onClick={handlePostReview}
                    disabled={!reviewText.trim() || reviewRating === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiSend className="h-3.5 w-3.5" />
                    <span>Publier</span>
                  </button>
                </div>
              </div>

              {reviewRating === 0 && reviewText.trim() && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Sélectionne une note pour publier ton avis
                </p>
              )}
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground">
                    Aucun avis pour ce filtre.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setReviewFilter(0); setReviewsToShow(REVIEWS_PER_PAGE); }}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Voir tous les avis
                  </button>
                </div>
              ) : (
                <>
                  {paginatedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-border rounded-xl p-4 transition-colors hover:border-border/80"
                    >
                      <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {review.author}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <IoStarSharp
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted-foreground/20 text-muted-foreground/20"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                          {/* Review images */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {review.images.map((img, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setLightboxImage(img)}
                                  className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt={`Photo avis ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show more / show less */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {hasMoreReviews && (
                      <button
                        type="button"
                        onClick={() => setReviewsToShow((prev) => prev + REVIEWS_PER_PAGE)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <FiChevronDown className="h-4 w-4" />
                        Voir plus d&apos;avis ({filteredReviews.length - reviewsToShow} restants)
                      </button>
                    )}
                    {reviewsToShow > REVIEWS_PER_PAGE && (
                      <button
                        type="button"
                        onClick={() => setReviewsToShow(REVIEWS_PER_PAGE)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Réduire
                      </button>
                    )}
                  </div>

                  {/* Showing count */}
                  <p className="text-center text-xs text-muted-foreground pt-1">
                    {Math.min(reviewsToShow, filteredReviews.length)} sur {filteredReviews.length} avis
                    {reviewFilter !== 0 && (
                      <> · <button type="button" onClick={() => { setReviewFilter(0); setReviewsToShow(REVIEWS_PER_PAGE); }} className="text-primary hover:underline">Effacer le filtre</button></>
                    )}
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ─── Similar Products ─── */}
          <section className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Articles similaires
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ─── Mobile sticky bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3 flex gap-3 lg:hidden">
        <button
          onClick={() => setOfferOpen(true)}
          className="flex-1 h-12 rounded-full border-2 border-primary text-primary font-semibold text-base hover:bg-primary/5 transition-colors"
        >
          Faire une offre
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Ajouter au panier
        </button>
      </div>

      {/* ─── Offer Dialog ─── */}
      <Dialog open={offerOpen} onOpenChange={(open) => !open && handleCloseOffer()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {offerSent ? "Offre envoyée !" : "Faire une offre"}
            </DialogTitle>
            <DialogDescription>
              {offerSent
                ? "Le vendeur a été notifié et te répondra bientôt."
                : `Prix actuel : ${product.price.toFixed(2)} €. Propose ton prix.`}
            </DialogDescription>
          </DialogHeader>

          {offerSent ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <FiCheck className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Ton offre de <span className="font-semibold text-foreground">{Number(offerPrice).toFixed(2)} €</span> a
                été envoyée à <span className="font-semibold text-foreground">{product.seller.name}</span>
              </p>
              <button
                onClick={handleCloseOffer}
                className="mt-2 h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Ton prix (€)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder={`ex: ${(product.price * 0.8).toFixed(0)}`}
                  min="1"
                  step="0.01"
                  className="w-full h-11 rounded-lg border border-input bg-background px-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  autoFocus
                />
                {offerPrice && Number(offerPrice) >= product.price && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ton offre est égale ou supérieure au prix demandé. Tu peux acheter directement !
                  </p>
                )}
              </div>

              <button
                onClick={handleSendOffer}
                disabled={!offerPrice || Number(offerPrice) <= 0}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Envoyer l&apos;offre
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image lightbox for review photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FiX className="h-5 w-5 text-white" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Photo agrandie"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ─── Helper component ─── */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
