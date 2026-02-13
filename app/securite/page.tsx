import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { FiHome, FiShield, FiLock, FiUserCheck, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function SecuritePage() {
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
            <span className="text-foreground font-medium">Sécurité & Confiance</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
              <FiShield className="h-3.5 w-3.5" />
              Sécurité
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Sécurité & <span className="text-primary">Confiance</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Chez FripCash, ta sécurité est notre priorité absolue. Découvre les mesures
              que nous mettons en place pour protéger chaque transaction.
            </p>
          </div>

          {/* Security Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: FiLock,
                title: "Paiement sécurisé",
                desc: "Toutes les transactions passent par notre système de paiement sécurisé. L'argent est bloqué jusqu'à la confirmation de réception par l'acheteur.",
              },
              {
                icon: FiShield,
                title: "Protection acheteur",
                desc: "Si l'article reçu ne correspond pas à la description, tu es remboursé. Notre équipe est là pour intervenir en cas de litige.",
              },
              {
                icon: FiUserCheck,
                title: "Vérification des comptes",
                desc: "Chaque utilisateur est vérifié par son numéro de téléphone avec un code SMS pour garantir l'authenticité des profils.",
              },
              {
                icon: FiAlertCircle,
                title: "Signalement facile",
                desc: "Tu peux signaler un comportement suspect ou une annonce frauduleuse à tout moment. Notre équipe réagit rapidement.",
              },
              {
                icon: FiCheckCircle,
                title: "Évaluations transparentes",
                desc: "Les avis et notes des utilisateurs sont visibles par tous. Choisis des vendeurs de confiance grâce aux retours de la communauté.",
              },
              {
                icon: FiLock,
                title: "Données protégées",
                desc: "Tes données personnelles sont chiffrées et ne sont jamais partagées avec des tiers. Nous respectons les normes de protection des données.",
              },
            ].map((f) => (
              <div key={f.title} className="border border-border rounded-xl p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-primary/5 rounded-2xl p-8 sm:p-12 mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Comment fonctionne la protection ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Achat sécurisé", desc: "Le paiement est bloqué sur notre plateforme. Le vendeur ne reçoit l'argent qu'après ta confirmation." },
                { step: "2", title: "Livraison suivie", desc: "Chaque colis est suivi. Tu reçois des mises à jour en temps réel sur l'état de ta commande." },
                { step: "3", title: "Garantie satisfait", desc: "Si l'article ne te convient pas, ouvre un litige sous 48h. Nous arbitrons et te remboursons si nécessaire." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">
              Tu as une question sur la sécurité ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Notre équipe est disponible pour t&apos;aider à tout moment.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
