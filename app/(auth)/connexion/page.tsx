"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { authApi, setToken } from "@/lib/api";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// ─── Country config: uncomment Guinea and comment Cameroon for production ───
// const COUNTRY = { code: "+224", flag: "🇬🇳", label: "+224", placeholder: "6XX XXX XXX" };
const COUNTRY = { code: "+237", flag: "🇨🇲", label: "+237", placeholder: "6XX XXX XXX" };

export default function ConnexionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [localPhone, setLocalPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fullPhone = `${COUNTRY.code}${localPhone.replace(/\s/g, "")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localPhone.trim() || !password) {
      toast("Remplis tous les champs.", "error");
      return;
    }

    if (localPhone.replace(/\s/g, "").length < 9) {
      toast("Numéro de téléphone invalide.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ phone: fullPhone, password });
      setToken(res.token);
      toast("Connexion réussie ! Bienvenue.");
      router.push("/");
    } catch (err: any) {
      toast(err?.message || "Identifiants incorrects.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connecte-toi à ton compte pour continuer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Numéro de téléphone with country prefix */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Numéro de téléphone
          </label>
          <div className="relative flex">
            <div className="flex items-center gap-1.5 px-3 h-11 rounded-l-md border border-r-0 border-input bg-muted text-sm font-medium text-foreground shrink-0 select-none">
              <span className="text-base leading-none">{COUNTRY.flag}</span>
              <span>{COUNTRY.label}</span>
            </div>
            <div className="relative flex-1">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={COUNTRY.placeholder}
                required
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                maxLength={12}
                className="pl-9 h-11 rounded-l-none"
              />
            </div>
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">
              Mot de passe
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs font-medium text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Ton mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <FiEyeOff className="h-4 w-4" />
              ) : (
                <FiEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Connexion...
            </span>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Tu n&apos;as pas de compte ?{" "}
        <Link
          href="/inscription"
          className="font-semibold text-primary hover:underline"
        >
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
