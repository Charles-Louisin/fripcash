"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fetchPayment } from "@/lib/api";
import { FiLock } from "react-icons/fi";

function PaiementSuccesInner() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const { toast } = useToast();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");

  useEffect(() => {
    if (!ref) {
      setStatus("failed");
      toast("Référence de paiement manquante.", "error");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        for (let i = 0; i < 20; i += 1) {
          const data = await fetchPayment(ref);
          if (cancelled) return;
          if (data.payment.status === "success") {
            setStatus("success");
            toast("Paiement confirmé. Les fonds sont bloqués en séquestre.", "success");
            return;
          }
          if (data.payment.status === "failed" || data.payment.status === "expired") {
            setStatus("failed");
            toast(data.payment.message || "Le paiement n'a pas abouti.", "error");
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
        setStatus("pending");
        toast("Paiement encore en cours. Vérifie tes commandes dans un instant.", "warning");
      } catch (err: any) {
        if (!cancelled) {
          setStatus("failed");
          toast(err?.message || "Impossible de vérifier le paiement.", "error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="container mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mx-auto mb-4">
          <FiLock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {status === "success"
            ? "Paiement en séquestre"
            : status === "failed"
              ? "Paiement non confirmé"
              : "Vérification du paiement…"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {status === "success"
            ? "L'argent reste bloqué jusqu'à confirmation de réception."
            : status === "failed"
              ? "Aucun débit définitif n'a été enregistré. Tu peux réessayer depuis le panier."
              : "Nous interrogeons CinetPay pour confirmer la transaction."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/commandes">Voir mes commandes</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/">Continuer mes achats</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaiementSuccesPage() {
  return (
    <Suspense>
      <PaiementSuccesInner />
    </Suspense>
  );
}
