"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fetchPayment } from "@/lib/api";

function PaiementEchecInner() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const { toast } = useToast();

  useEffect(() => {
    toast("Le paiement a échoué ou a été annulé.", "error");
    if (!ref) return;
    void fetchPayment(ref).catch(() => undefined);
  }, [ref, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="container mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Paiement échoué</h1>
        <p className="text-muted-foreground mb-8">
          Aucune commande n&apos;a été débité définitivement. Vérifie ton solde Mobile Money ou réessaie avec CinetPay.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full">
            <Link href="/checkout">Réessayer</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaiementEchecPage() {
  return (
    <Suspense>
      <PaiementEchecInner />
    </Suspense>
  );
}
