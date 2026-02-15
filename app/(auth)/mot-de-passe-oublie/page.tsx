"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiPhone, FiArrowRight } from "react-icons/fi";

export default function MotDePasseOubliePage() {
  const [step, setStep] = useState<"phone" | "code" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const next = document.getElementById(`reset-code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`reset-code-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div>
      {/* Step 1: Enter phone number */}
      {step === "phone" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Mot de passe oublié
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre ton numéro de téléphone pour recevoir un code de
              réinitialisation par SMS.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("code");
              toast("Code envoyé ! Vérifie tes SMS.", "info");
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Numéro de téléphone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+224 6XX XXX XXX"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md gap-2"
            >
              Envoyer le code
              <FiArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Tu te souviens ?{" "}
            <Link
              href="/connexion"
              className="font-semibold text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </>
      )}

      {/* Step 2: Enter SMS code */}
      {step === "code" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Vérification SMS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Un code à 6 chiffres a été envoyé au{" "}
              <span className="font-semibold text-foreground">{phone}</span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("reset");
              toast("Code vérifié. Choisis ton nouveau mot de passe.");
            }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`reset-code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-13 w-11 rounded-md border border-input bg-background text-center text-lg font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
            >
              Vérifier
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => toast("Code renvoyé ! Vérifie tes SMS.", "info")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Renvoyer le code
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Modifier le numéro
            </button>
          </form>
        </>
      )}

      {/* Step 3: Set new password */}
      {step === "reset" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Nouveau mot de passe
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choisis un nouveau mot de passe pour ton compte.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast("Mot de passe réinitialisé ! Tu peux te connecter.");
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nouveau mot de passe
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                required
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirmer le mot de passe
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirme ton mot de passe"
                required
                className="h-11"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-pw"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <label
                htmlFor="show-pw"
                className="text-sm text-muted-foreground"
              >
                Afficher le mot de passe
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
            >
              Réinitialiser le mot de passe
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/connexion"
              className="font-semibold text-primary hover:underline"
            >
              Retour à la connexion
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
