import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";

export default function CommissionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-16 space-y-4">
        <h1 className="text-3xl font-bold">Commissions</h1>
        <p className="text-muted-foreground leading-relaxed">
          Le vendeur saisit le prix net (ce qu&apos;il reçoit). FripCash ajoute la commission
          pour l&apos;acheteur : <strong>8 %</strong> (particulier, boutique, enseigne) ou
          <strong> 5 %</strong> (proximité). Les taux sont réglables dans l&apos;admin.
        </p>
      </main>
      <Footer />
    </div>
  );
}
