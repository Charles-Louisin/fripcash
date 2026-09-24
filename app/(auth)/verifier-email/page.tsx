"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiError, verifyEmail } from "@/lib/api";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide — token manquant.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (cancelled) return;
        setStatus("ok");
        setMessage("Email confirmé ! Tu peux te connecter.");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof ApiError
            ? err.body.message
            : "Lien invalide ou expiré."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Vérification email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      )}

      {status === "ok" && (
        <div className="space-y-3">
          <Button
            className="w-full h-11"
            onClick={() => router.push("/connexion")}
          >
            Se connecter
          </Button>
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => router.push("/dashboard")}
          >
            Aller au tableau de bord
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <Button
            className="w-full h-11"
            onClick={() => router.push("/inscription")}
          >
            Réessayer l’inscription
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ou{" "}
            <Link href="/connexion" className="text-primary font-semibold">
              se connecter
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifierEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
