"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { FiHome } from "react-icons/fi";

const sections = [
  {
    title: "1. Collecte des données",
    content: `Lorsque tu t'inscris sur FripCash, nous collectons les informations suivantes :

• Nom et prénom
• Pseudo
• Numéro de téléphone
• Adresse de livraison (lors d'une commande)
• Historique des transactions

Ces données sont nécessaires au bon fonctionnement de la plateforme et à la sécurisation des échanges.`,
  },
  {
    title: "2. Utilisation des données",
    content: `Tes données personnelles sont utilisées pour :

• Créer et gérer ton compte
• Vérifier ton identité par SMS
• Traiter les paiements et livraisons
• Assurer la sécurité des transactions
• Améliorer nos services et ton expérience utilisateur
• T'envoyer des notifications pertinentes (commandes, messages, offres)

Nous ne vendons jamais tes données à des tiers.`,
  },
  {
    title: "3. Protection des données",
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger tes données :

• Chiffrement des données sensibles (mots de passe, informations de paiement)
• Accès restreint aux données personnelles au sein de notre équipe
• Surveillance continue de notre infrastructure
• Mises à jour régulières de nos systèmes de sécurité`,
  },
  {
    title: "4. Cookies et suivi",
    content: `FripCash utilise des cookies pour :

• Maintenir ta session de connexion active
• Mémoriser tes préférences (langue, filtres)
• Analyser le trafic de manière anonyme pour améliorer la plateforme

Tu peux désactiver les cookies dans les paramètres de ton navigateur, mais certaines fonctionnalités pourraient être limitées.`,
  },
  {
    title: "5. Partage des données",
    content: `Tes données peuvent être partagées uniquement dans les cas suivants :

• Avec nos prestataires de paiement pour traiter les transactions
• Avec les services de livraison pour acheminer tes colis
• Avec les autorités compétentes si la loi l'exige

Nous ne partageons jamais tes données à des fins publicitaires avec des tiers.`,
  },
  {
    title: "6. Tes droits",
    content: `Tu disposes des droits suivants concernant tes données :

• Droit d'accès : consulter les données que nous détenons sur toi
• Droit de rectification : corriger des informations inexactes
• Droit de suppression : demander la suppression de ton compte et de tes données
• Droit d'opposition : refuser certains traitements de données

Pour exercer ces droits, contacte-nous à l'adresse indiquée sur notre page de contact.`,
  },
  {
    title: "7. Conservation des données",
    content: `Tes données personnelles sont conservées aussi longtemps que ton compte est actif. En cas de suppression de compte, tes données sont effacées dans un délai de 30 jours, à l'exception des données nécessaires au respect de nos obligations légales (transactions, factures) qui peuvent être conservées jusqu'à 5 ans.`,
  },
  {
    title: "8. Modifications de cette politique",
    content: `Nous pouvons mettre à jour cette politique de confidentialité à tout moment. En cas de modification importante, tu seras informé(e) par notification dans l'application. La date de dernière mise à jour est indiquée en bas de cette page.`,
  },
];

export default function ConfidentialitePage() {
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
            <span className="text-foreground font-medium">Politique de confidentialité</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Politique de <span className="text-primary">confidentialité</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Chez FripCash, nous prenons la protection de tes données personnelles très au sérieux.
              Cette politique explique comment nous collectons, utilisons et protégeons tes informations.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Dernière mise à jour : 13 février 2026
            </p>
          </div>

          {/* Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="max-w-3xl mx-auto mt-12 text-center border border-border rounded-xl p-8">
            <h3 className="font-semibold text-foreground mb-2">
              Des questions sur tes données ?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              N&apos;hésite pas à nous contacter pour toute question relative à ta vie privée.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm"
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
