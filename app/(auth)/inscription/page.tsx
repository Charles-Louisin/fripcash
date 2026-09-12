"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setToken } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { mockMe, mockMeExtras } from "@/lib/consumer-mock-data";
import {
  FiUser,
  FiPhone,
  FiAtSign,
  FiArrowRight,
  FiRefreshCw,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

// ─── Country config: uncomment Guinea and comment Cameroon for production ───
// const COUNTRY = { code: "+224", flag: "🇬🇳", label: "+224", placeholder: "6XX XXX XXX" };
const COUNTRY = { code: "+237", flag: "🇨🇲", label: "+237", placeholder: "6XX XXX XXX" };

function generatePseudos(firstName: string, lastName: string): string[] {
  const f = firstName.toLowerCase().trim().replace(/\s+/g, "");
  const l = lastName.toLowerCase().trim().replace(/\s+/g, "");
  if (!f && !l) return [];

  const rand2 = () => Math.floor(Math.random() * 90 + 10);
  const rand3 = () => Math.floor(Math.random() * 900 + 100);
  const rand4 = () => Math.floor(Math.random() * 9000 + 1000);

  const suggestions: string[] = [];

  if (f && l) {
    suggestions.push(
      `${f}.${l}`,
      `${f}_${l}`,
      `${f}${l}${rand2()}`,
      `${f}.${l[0]}${rand2()}`,
      `${f[0]}${l}${rand3()}`,
      `${f}_${l}${rand2()}`,
      `${f}${rand4()}`,
      `${l}.${f}${rand2()}`
    );
  } else {
    const name = f || l;
    suggestions.push(
      `${name}${rand3()}`,
      `${name}_${rand2()}`,
      `${name}.shop${rand2()}`,
      `${name}frip${rand2()}`
    );
  }

  const unique = [...new Set(suggestions)];
  return unique.slice(0, 4);
}

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);

  const fullPhone = `${COUNTRY.code}${localPhone.replace(/\s/g, "")}`;

  const suggestions = useMemo(
    () => generatePseudos(firstName, lastName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstName, lastName, suggestionKey]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastName.trim() || !firstName.trim() || !pseudo.trim() || !localPhone.trim() || !password) {
      toast("Remplis tous les champs.", "error");
      return;
    }

    const digits = localPhone.replace(/\s/g, "");
    if (digits.length < 9) {
      toast("Numéro de téléphone invalide (9 chiffres requis).", "error");
      return;
    }

    if (password.length < 6) {
      toast("Le mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }

    if (password !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const user = {
      ...mockMe,
      ...mockMeExtras,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pseudo: pseudo.trim(),
      phone: fullPhone,
      _id: `u_${Date.now()}`,
      id: `u_${Date.now()}`,
    };
    setToken("mock-token");
    queryClient.setQueryData(["me"], user);
    toast("Compte créé ! Bienvenue sur FripCash (démo).");
    router.push("/");
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inscris-toi pour commencer à acheter et vendre.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom + Prénom */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ton nom"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Prénom
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ton prénom"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>
        </div>

        {/* Pseudo */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Pseudo
          </label>
          <div className="relative">
            <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Choisis un pseudo"
              required
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Pseudo suggestions */}
          {(firstName.trim() || lastName.trim()) && suggestions.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-xs text-muted-foreground">
                  Suggestions :
                </p>
                <button
                  type="button"
                  onClick={() => setSuggestionKey((k) => k + 1)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Nouvelles suggestions"
                >
                  <FiRefreshCw className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPseudo(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                      pseudo === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    @{s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caractères"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirme ton mot de passe"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? (
                <FiEyeOff className="h-4 w-4" />
              ) : (
                <FiEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive mt-1.5">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Inscription...
            </span>
          ) : (
            <>
              S&apos;inscrire
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Tu as déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-semibold text-primary hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
