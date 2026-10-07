"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { ProductCard, ProductCardSkeleton, mapArticleToProduct } from "@/components/product-card";
import { fetchPublicSeller, toggleSellerLike } from "@/lib/api";
import { listingToArticle } from "@/hooks/use-articles";
import { useMe } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FiHeart, FiStar, FiHome } from "react-icons/fi";

export default function BoutiquePublicPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { data: user } = useMe();
  const qc = useQueryClient();

  const { data: shop, isLoading } = useQuery({
    queryKey: ["public-shop", id],
    queryFn: () => fetchPublicSeller(id),
    enabled: !!id,
  });

  const likeMut = useMutation({
    mutationFn: () => toggleSellerLike(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public-shop", id] }),
  });

  const listings = (shop?.listings || []).map((l: any) =>
    mapArticleToProduct(listingToArticle(l))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : !shop ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="font-semibold">Boutique introuvable</p>
            <Link href="/" className="text-primary text-sm underline mt-2 inline-block">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            <div className="relative h-40 sm:h-56 bg-muted">
              {shop.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground pt-4">
                <Link href="/" className="flex items-center gap-1 hover:text-primary">
                  <FiHome className="h-3.5 w-3.5" /> Accueil
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{shop.shopName}</span>
              </nav>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 pb-8">
                <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-muted shrink-0">
                  {shop.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shop.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                      {(shop.shopName || "B")[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold">{shop.shopName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {shop.bio || "Cette boutique n'a pas encore de description."}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <FiStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {shop.rating || 0} ({shop.reviewsCount || 0} avis)
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <FiHeart className="h-4 w-4" />
                      {shop.likesCount || 0}
                    </span>
                  </div>
                </div>
                <Button
                  className="rounded-full"
                  variant={shop.likedByMe ? "default" : "outline"}
                  disabled={likeMut.isPending}
                  onClick={() => {
                    if (!user) {
                      toast("Connecte-toi pour aimer cette boutique.", "info");
                      router.push("/connexion");
                      return;
                    }
                    likeMut.mutate();
                  }}
                >
                  <FiHeart className={`mr-2 h-4 w-4 ${shop.likedByMe ? "fill-current" : ""}`} />
                  {shop.likedByMe ? "Aimée" : "Aimer"}
                </Button>
              </div>

              <h2 className="text-lg font-bold mb-4">Articles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-16">
                {listings.length === 0
                  ? Array.from({ length: isLoading ? 5 : 0 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))
                  : listings.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                {listings.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground py-8">
                    Aucun article pour le moment.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
