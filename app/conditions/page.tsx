"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { FiHome } from "react-icons/fi";

const sections = [
  {
    title: "1. Objet",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme FripCash, accessible via le site web et l'application mobile.

En t'inscrivant sur FripCash, tu acceptes sans réserve l'intégralité de ces conditions.`,
  },
  {
    title: "2. Inscription et compte",
    content: `Pour utiliser FripCash, tu dois créer un compte en fournissant :

• Ton nom et prénom
• Un pseudo unique
• Un numéro de téléphone valide

La vérification par code SMS est obligatoire. Tu es responsable de la confidentialité de tes identifiants de connexion. Toute activité sur ton compte est réputée avoir été effectuée par toi.

FripCash se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions.`,
  },
  {
    title: "3. Mise en vente d'articles",
    content: `En tant que vendeur sur FripCash, tu t'engages à :

• Décrire l'article de manière exacte et honnête (état, taille, marque, défauts éventuels)
• Publier des photos réelles de l'article
• Fixer un prix raisonnable
• Expédier l'article dans un délai de 5 jours ouvrés après la vente

Sont interdits : les articles contrefaits, volés, dangereux, ou contraires à la loi. FripCash se réserve le droit de retirer toute annonce non conforme.`,
  },
  {
    title: "4. Achat et paiement",
    content: `Lorsque tu achètes un article :

• Le paiement est sécurisé et traité via notre plateforme
• L'argent est bloqué jusqu'à confirmation de la réception par l'acheteur
• Les frais de port sont calculés lors du paiement et à la charge de l'acheteur, sauf accord contraire

Tu disposes d'un délai de 48 heures après réception pour signaler un problème (article non conforme, endommagé, etc.).`,
  },
  {
    title: "5. Commission",
    content: `FripCash prélève une commission sur chaque vente réalisée. Cette commission couvre :

• Les frais de traitement du paiement
• La protection acheteur
• Le fonctionnement et la maintenance de la plateforme

Le montant exact de la commission est affiché avant la confirmation de chaque transaction. Le vendeur reçoit le montant de la vente moins la commission.`,
  },
  {
    title: "6. Livraison",
    content: `Le vendeur est responsable de l'expédition de l'article dans les délais impartis. FripCash fournit les outils de suivi des colis.

• Le vendeur doit fournir un numéro de suivi valide
• L'acheteur est notifié à chaque étape de la livraison
• En cas de perte du colis, FripCash interviendra pour résoudre le litige

Les délais de livraison varient selon la méthode d'envoi choisie et la localisation géographique.`,
  },
  {
    title: "7. Litiges et remboursements",
    content: `En cas de litige entre un acheteur et un vendeur :

• L'acheteur peut ouvrir un litige dans les 48 heures suivant la réception
• FripCash examine le dossier et peut demander des preuves aux deux parties
• Si le litige est fondé, l'acheteur est remboursé intégralement

Le remboursement est effectué via le même moyen de paiement utilisé lors de l'achat.`,
  },
  {
    title: "8. Comportement des utilisateurs",
    content: `En utilisant FripCash, tu t'engages à :

• Respecter les autres utilisateurs
• Ne pas publier de contenu offensant, discriminatoire ou illégal
• Ne pas tenter de contourner le système de paiement sécurisé
• Ne pas créer plusieurs comptes
• Ne pas utiliser la plateforme à des fins commerciales non autorisées

Tout comportement abusif peut entraîner la suspension ou la suppression définitive de ton compte.`,
  },
  {
    title: "9. Propriété intellectuelle",
    content: `Le contenu de la plateforme FripCash (logo, design, textes, fonctionnalités) est protégé par le droit de la propriété intellectuelle.

Les photos et descriptions publiées par les utilisateurs restent leur propriété, mais en les publiant sur FripCash, tu nous accordes une licence non exclusive pour les afficher sur la plateforme.`,
  },
  {
    title: "10. Modification des CGU",
    content: `FripCash se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification significative par notification dans l'application.

La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles conditions.`,
  },
  {
    title: "11. Contact",
    content: `Pour toute question relative aux présentes Conditions Générales, tu peux nous contacter via notre page de contact ou par les coordonnées indiquées sur la plateforme.`,
  },
];

export default function ConditionsPage() {
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
            <span className="text-foreground font-medium">Conditions générales</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Conditions <span className="text-primary">générales</span> d&apos;utilisation
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              En utilisant FripCash, tu acceptes les conditions suivantes. Prends le temps
              de les lire pour comprendre tes droits et obligations.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Dernière mise à jour : 13 février 2026
            </p>
          </div>

          {/* Table of contents */}
          <div className="max-w-3xl mx-auto mb-12 bg-muted/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">Sommaire</h3>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {sections.map((s) => (
                <button
                  key={s.title}
                  onClick={() => {
                    const el = document.getElementById(s.title);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-left text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section) => (
              <div key={section.title} id={section.title} className="border-b border-border pb-8 last:border-b-0 scroll-mt-24">
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
              Tu as des questions ?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si tu as besoin d&apos;éclaircissements sur nos conditions, n&apos;hésite pas.
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
