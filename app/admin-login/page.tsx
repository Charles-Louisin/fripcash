"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { useAdminLogin } from "@/hooks/use-auth";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from "react-icons/fi";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const adminLogin = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }
    adminLogin.mutate(
      { email, password },
      {
        onSuccess: () => {
          showToast("Connexion réussie ! Bienvenue, Admin.", "success");
          router.push("/admin");
        },
        onError: (error: any) => {
          showToast(
            error?.message || "Identifiants incorrects.",
            "error"
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-background w-full">
          {/* Logo */}
          <div className="overflow-hidden">
            <Link href="/" className="inline-block -my-6">
              <Image
                src="/images/logo.png"
                alt="FripCash"
                width={500}
                height={500}
                className="h-28 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          {/* Center content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium">
              <FiShield className="h-4 w-4" />
              Espace administrateur
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Gérez votre<br />
              plateforme<br />
              <span className="text-primary">en toute sécurité.</span>
            </h1>
            <p className="text-background/60 text-lg max-w-md">
              Accédez au tableau de bord d&apos;administration pour gérer les utilisateurs, les articles, les commandes et bien plus.
            </p>
          </div>

          {/* Bottom */}
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} FripCash. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-2 text-center overflow-hidden">
            <Link href="/" className="inline-block -my-6">
              <Image
                src="/images/logo.png"
                alt="FripCash"
                width={500}
                height={500}
                className="h-24 w-auto mx-auto"
              />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-foreground text-xs font-medium mb-4">
              <FiShield className="h-3.5 w-3.5" />
              Administration
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Connexion administrateur
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fripcash.com"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Se souvenir de moi
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={adminLogin.isPending}
              className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adminLogin.isPending ? (
                <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <FiArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Cet espace est réservé aux administrateurs autorisés.
              <br />
              <Link href="/" className="text-primary hover:underline font-medium">
                Retour au site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
