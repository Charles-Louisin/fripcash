"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import {
  ApiError,
  requestPasswordReset,
  resetPassword,
} from "@/lib/api";
import {
  AUTH_COUNTRIES,
  AUTH_COUNTRY_OPTIONS,
  type AuthCountryId,
  isValidEmail,
} from "@/lib/auth-country";

function MotDePasseOublieInner() {
  const params = useSearchParams();
  const tokenFromUrl = params.get("token") || "";
  const { toast } = useToast();

  const [countryId, setCountryId] = useState<AuthCountryId>("FR");
  const country = AUTH_COUNTRIES[countryId];
  const [step, setStep] = useState<"request" | "sent" | "reset">(
    tokenFromUrl ? "reset" : "request"
  );
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (country.authMethod !== "email") {
      toast(
        "Réinitialisation email disponible pour la France. Guinée : utilise l’OTP SMS sur Connexion.",
        "info"
      );
      return;
    }
    if (!isValidEmail(email)) {
      toast("Adresse email invalide.", "error");
      return;
    }
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/mot-de-passe-oublie`
          : undefined;
      await requestPasswordReset(email.trim(), redirectTo);
      setStep("sent");
      toast("Si un compte existe, un email a été envoyé.", "success");
    } catch (err) {
      const code =
        err instanceof ApiError
          ? String(err.body.code || err.body.message || "")
          : "";
      if (
        code.includes("NOT_ENABLED") ||
        code.includes("Invalid") ||
        code.includes("INVALID")
      ) {
        toast(
          "Reset email non activé côté serveur — demande au BE d’activer request-password-reset.",
          "warning"
        );
      } else {
        toast(
          err instanceof ApiError
            ? err.body.message
            : "Impossible d’envoyer l’email.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast("Token manquant.", "error");
      return;
    }
    if (password.length < 8) {
      toast("Mot de passe : 8 caractères minimum.", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), newPassword: password });
      toast("Mot de passe mis à jour.", "success");
      setStep("request");
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.body.message
          : "Lien invalide ou expiré.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {step === "reset" ? "Nouveau mot de passe" : "Mot de passe oublié"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "sent"
            ? "Vérifie ta boîte mail."
            : step === "reset"
              ? "Choisis un nouveau mot de passe."
              : "Réinitialisation par email — comptes France."}
        </p>
      </div>

      {step === "request" && (
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Adresse email
              </label>
              <Select
                value={countryId}
                onValueChange={(v) => setCountryId(v as AuthCountryId)}
              >
                <SelectTrigger className="h-8 w-auto gap-1.5 border-0 bg-transparent px-1.5 shadow-none focus:ring-0 [&>svg]:h-3.5 [&>svg]:opacity-50">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectTrigger>
                <SelectContent align="end">
                  {AUTH_COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="toi@exemple.fr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>
      )}

      {step === "sent" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3">
            Si un compte existe pour <strong>{email}</strong>, tu recevras un
            lien. Ouvre-le pour choisir un nouveau mot de passe.
          </p>
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => setStep("request")}
          >
            Renvoyer
          </Button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={handleReset} className="space-y-4">
          {!tokenFromUrl && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Token</label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-11 h-11"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <FiEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/connexion" className="font-semibold text-primary">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

export default function MotDePasseOubliePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <MotDePasseOublieInner />
    </Suspense>
  );
}
