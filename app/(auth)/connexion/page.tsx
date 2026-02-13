"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function ConnexionPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Connexion réussie ! Bienvenue.");
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
        {/* Numéro de téléphone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Numéro de téléphone
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+237 6XX XXX XXX"
              required
              className="pl-9 h-11"
            />
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
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
        >
          Se connecter
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
