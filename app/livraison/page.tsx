import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";

export default function LivraisonPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-16 space-y-4">
        <h1 className="text-3xl font-bold">Livraison</h1>
        <p className="text-muted-foreground leading-relaxed">
          Proximité : retrait boutique ou livraison locale, confirmés par les boutons
          du tableau de bord. Autres vendeurs : livreur FripCash (espace /livreur).
          Les tarifs inter-zones sont configurés par l&apos;admin.
        </p>
      </main>
      <Footer />
    </div>
  );
}
