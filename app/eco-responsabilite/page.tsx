import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { FiHome, FiDroplet, FiTrendingDown, FiRefreshCw, FiHeart } from "react-icons/fi";

export default function EcoResponsabilitePage() {
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
            <span className="text-foreground font-medium">Éco-Responsabilité</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              🌿 Engagement vert
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Notre engagement <span className="text-primary">éco-responsable</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              L&apos;industrie textile est l&apos;une des plus polluantes au monde. Chez FripCash,
              nous agissons concrètement pour réduire son impact en donnant une seconde vie
              à chaque vêtement.
            </p>
          </div>

          {/* Impact Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="rounded-2xl overflow-hidden bg-muted min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop"
                alt="Eco-responsabilité"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Pourquoi la seconde main ?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Chaque année, des millions de tonnes de vêtements finissent dans les décharges.
                En achetant de seconde main sur FripCash, tu contribues à réduire ce gaspillage
                tout en accédant à des articles de qualité à petit prix.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Un seul article revendu permet d&apos;économiser en moyenne 3 000 litres d&apos;eau
                et 5 kg de CO₂. Imagine l&apos;impact de toute notre communauté !
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-primary/5 rounded-2xl p-8 sm:p-12 mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Notre impact environnemental
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FiDroplet, value: "15M L", label: "d'eau économisée" },
                { icon: FiTrendingDown, value: "25T", label: "de CO₂ évitées" },
                { icon: FiRefreshCw, value: "50K+", label: "articles sauvés des décharges" },
                { icon: FiHeart, value: "10K+", label: "acheteurs éco-responsables" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">
              Comment agir avec nous ?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Vends au lieu de jeter",
                  desc: "Tes vêtements que tu ne portes plus peuvent faire le bonheur de quelqu'un d'autre. Publie-les sur FripCash en quelques clics.",
                },
                {
                  title: "Achète de seconde main",
                  desc: "Avant d'acheter neuf, vérifie sur FripCash. Tu y trouveras souvent la même pièce, en bon état, à une fraction du prix.",
                },
                {
                  title: "Prends soin de tes achats",
                  desc: "Un vêtement bien entretenu dure plus longtemps et garde sa valeur. Tu pourras le revendre quand tu en auras assez !",
                },
                {
                  title: "Privilégie les envois groupés",
                  desc: "Quand c'est possible, achète plusieurs articles au même vendeur pour réduire l'empreinte carbone du transport.",
                },
                {
                  title: "Réutilise les emballages",
                  desc: "Pas besoin d'un carton neuf ! Réutilise les emballages que tu as déjà chez toi pour expédier tes ventes.",
                },
                {
                  title: "Partage le mouvement",
                  desc: "Invite tes amis à rejoindre FripCash. Plus nous sommes nombreux, plus notre impact positif grandit.",
                },
              ].map((tip) => (
                <div key={tip.title} className="border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-primary rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl font-bold mb-3">
              Rejoins le mouvement
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Chaque achat et chaque vente sur FripCash est un geste pour la planète.
              Commence dès maintenant.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-primary font-medium px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Commencer à vendre
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
