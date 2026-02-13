import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { FiHome, FiHeart, FiShield, FiUsers, FiGlobe } from "react-icons/fi";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />

      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiHome className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">À propos</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              Notre histoire
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              À propos de <span className="text-primary">FripCash</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              FripCash est née d&apos;une idée simple : permettre à chacun de donner une seconde vie
              à ses vêtements tout en gagnant de l&apos;argent. Basée au Cameroun, notre plateforme
              connecte vendeurs et acheteurs dans un espace sécurisé et convivial.
            </p>
          </div>

          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="rounded-2xl overflow-hidden bg-muted min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                alt="Shopping"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Notre mission
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous croyons que la mode peut être accessible, durable et responsable.
                FripCash facilite l&apos;achat et la vente d&apos;articles de seconde main
                en toute confiance, avec un paiement sécurisé et une livraison fiable.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notre objectif est de réduire le gaspillage textile tout en permettant
                à nos utilisateurs de renouveler leur garde-robe sans se ruiner.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">
              Nos valeurs
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FiHeart, title: "Communauté", desc: "Une communauté bienveillante de vendeurs et acheteurs qui partagent la même passion." },
                { icon: FiShield, title: "Confiance", desc: "Paiement sécurisé, protection acheteur et vérification des profils pour des transactions fiables." },
                { icon: FiGlobe, title: "Durabilité", desc: "Chaque article revendu, c'est un pas de plus vers une mode plus responsable." },
                { icon: FiUsers, title: "Accessibilité", desc: "Des articles de qualité à des prix abordables, accessibles à tous." },
              ].map((v) => (
                <div key={v.title} className="border border-border rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-primary/5 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              FripCash en chiffres
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: "10K+", label: "Utilisateurs actifs" },
                { value: "50K+", label: "Articles vendus" },
                { value: "4.8/5", label: "Note moyenne" },
                { value: "98%", label: "Clients satisfaits" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
