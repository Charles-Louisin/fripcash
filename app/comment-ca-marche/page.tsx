import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import {
  FiHome,
  FiDollarSign,
  FiShoppingCart,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              Comment ça marche
            </span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              💡 Guide
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              FripCash, la plateforme qui donne une{" "}
              <span className="text-primary">seconde vie</span> à tes vêtements
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Une communauté, des milliers de marques et de styles de seconde
              main. Prêt à te lancer ? Découvre comment ça marche !
            </p>
          </div>

          {/* ─── SELL SECTION ─── */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <FiDollarSign className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Vendre, c&apos;est simple
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/how-to-sell-step1.png"
                    alt="Prendre une photo d'un vêtement"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 1
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Mets en ligne gratuitement
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Télécharge gratuitement l&apos;appli FripCash. Prends ton
                    article en photo, décris-le et fixe ton prix. Appuie sur
                    &quot;Ajouter&quot; et ton annonce est en ligne !
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/how-to-sell-step2.png"
                    alt="Emballer et envoyer un colis"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 2
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Vends et envoie facilement
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Vendu ! Emballe ton article et imprime le bordereau
                    d&apos;envoi. Tu as 5 jours pour le déposer au point relais
                    le plus proche de chez toi.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/how-to-sell-step3.png"
                    alt="Recevoir de l'argent"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    3
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 3
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Jour de paie !
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Il y a 0 frais de vente, ce que tu gagnes est à toi. Tu
                    recevras l&apos;argent quand l&apos;acheteur aura validé la
                    réception de l&apos;article.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── BUY SECTION ─── */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <FiShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Achète en toute sécurité
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/shopping-step1.png"
                    alt="Parcourir des vêtements"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 1
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Trouve-le
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Télécharge gratuitement l&apos;appli FripCash. Trouve ton
                    bonheur parmi des milliers d&apos;articles et de marques.
                    Filtre par taille, prix, état ou catégorie.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/shopping-step2.png"
                    alt="Payer en ligne en toute sécurité"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 2
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Achète-le
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Échange avec le vendeur et achète en un simple clic. Paie en
                    toute sécurité avec Mobile Money, carte bancaire ou ton
                    porte-monnaie FripCash.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/how-it-works/shopping-step3.png"
                    alt="Recevoir un colis à la maison"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold">
                    3
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                    Étape 3
                  </span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-3">
                    Reçois-le
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Suis l&apos;arrivée de ton article grâce à la date de
                    livraison estimée. Patience, ton article sera bientôt avec
                    toi !
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SAFETY SECTION ─── */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <FiShield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Ta sécurité nous importe
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Buyer protection */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-5">
                  <FiShield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Achète en toute sécurité
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  En tant qu&apos;acheteur, chaque transaction est protégée.
                  Cela permet de protéger ton argent, en ajoutant une protection
                  supplémentaire à tes achats et en gardant tes informations en
                  sécurité.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  En savoir plus
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Refund policy */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-5">
                  <FiRefreshCw className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Politique de remboursement
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Ton achat est protégé quand tu paies sur FripCash. Tu seras
                  remboursé si ton article n&apos;a pas été livré, a été
                  endommagé ou n&apos;est pas tel que décrit. Tu as 2 jours
                  après la livraison pour signaler un problème.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  En savoir plus
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─── FINAL CTA ─── */}
          <section className="relative overflow-hidden bg-primary rounded-2xl px-6 py-16 sm:px-12 sm:py-20 md:px-20 text-center">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Tu es prêt ?
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                Rejoins des milliers de vendeurs et acheteurs sur FripCash.
                C&apos;est gratuit, rapide et sécurisé.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/inscription"
                  className="group flex items-center gap-3 bg-white hover:bg-white/95 text-primary font-semibold text-base pl-7 pr-2 h-13 rounded-full transition-colors"
                >
                  Commencer à vendre
                  <span className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-white transition-transform group-hover:translate-x-0.5">
                    <FiArrowRight className="h-4 w-4" />
                  </span>
                </Link>

                <Link
                  href="/inscription"
                  className="text-white/90 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
                >
                  Créer un compte gratuitement
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
