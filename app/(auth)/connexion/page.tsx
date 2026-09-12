"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setToken } from "@/lib/api";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { mockMe, mockMeExtras } from "@/lib/consumer-mock-data";
import { recordLoginSession } from "@/lib/admin-session-tracker";
import {
  AUTH_COUNTRY,
  fullPhoneFromLocal,
  isValidLocalPhone,
} from "@/lib/auth-country";

export default function ConnexionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [localPhone, setLocalPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localPhone.trim() || !password) {
      toast("Remplis tous les champs.", "error");
      return;
    }

    if (!isValidLocalPhone(localPhone)) {
      toast(
        `Numéro invalide — entre ${AUTH_COUNTRY.minLocalDigits}–${AUTH_COUNTRY.maxLocalDigits} chiffres (ex. 621112233).`,
        "error"
      );
      return;
    }

    // Local demo auth — no backend call until the API is wired.
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const fullPhone = fullPhoneFromLocal(localPhone);
    setToken("mock-token");
    queryClient.setQueryData(["me"], {
      ...mockMe,
      ...mockMeExtras,
      phone: fullPhone,
    });
    recordLoginSession({
      email: mockMe.email ?? fullPhone,
      displayName: mockMe.pseudo,
      role: "acheteur",
    });
    toast("Connexion réussie ! Bienvenue (démo).");
    router.push("/dashboard");
    setLoading(false);
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
              <span className="text-base leading-none">{AUTH_COUNTRY.flag}</span>
              <span>{AUTH_COUNTRY.label}</span>
            </div>
            <div className="relative flex-1">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={AUTH_COUNTRY.placeholder}
                required
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                maxLength={12}
                className="pl-9 h-11 rounded-l-none"
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Démo : n&apos;importe quel numéro Guinée ({AUTH_COUNTRY.minLocalDigits}
            –{AUTH_COUNTRY.maxLocalDigits} chiffres) + mot de passe — pas d&apos;API.
          </p>
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
