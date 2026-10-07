import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";

export default function PaiementBloquePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Paiement bloqué (séquestre)</h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Après le paiement (simulé pour l&apos;instant), l&apos;argent est retenu par FripCash.
          Le vendeur ne peut pas le retirer tant que tu n&apos;as pas confirmé la réception,
          ou qu&apos;un litige n&apos;a pas été tranché.
        </p>
        <Link href="/securite" className="text-primary underline">En savoir plus sur la sécurité</Link>
      </main>
      <Footer />
    </div>
  );
}
