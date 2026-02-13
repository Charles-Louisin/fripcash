"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
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
}

const initialReviews: Review[] = [
  {
    id: 1,
    author: "Jean-Paul M.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Article conforme à la description, envoi rapide et bien emballé. Je recommande ce vendeur !",
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
  },
];

/* ─── Page ─── */

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const product = mockProducts[id] ?? { ...fallbackProduct, id: Number(id) || 0 };
  const { toast } = useToast();

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

  const handlePostReview = () => {
    if (!reviewText.trim() || reviewRating === 0) return;
    const newReview: Review = {
      id: Date.now(),
      author: "Toi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      rating: reviewRating,
      date: "À l'instant",
      comment: reviewText.trim(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReviewRating(0);
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
                  onClick={() => toast("Redirection vers le paiement...", "info")}
                  className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
                >
                  Acheter
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Avis ({reviews.length})
              </h2>
              <div className="flex items-center gap-1.5">
                <IoStarSharp className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">
                  {reviews.length > 0
                    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                    : "—"}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
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
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none pr-12"
                />
                <button
                  onClick={handlePostReview}
                  disabled={!reviewText.trim() || reviewRating === 0}
                  className="absolute right-3 bottom-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
              {reviewRating === 0 && reviewText.trim() && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Sélectionne une note pour publier ton avis
                </p>
              )}
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border rounded-xl p-4"
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
                    </div>
                  </div>
                </div>
              ))}
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
          onClick={() => toast("Redirection vers le paiement...", "info")}
          className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Acheter
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
