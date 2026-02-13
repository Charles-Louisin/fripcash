"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiUser, FiPhone, FiAtSign, FiArrowRight } from "react-icons/fi";

export default function InscriptionPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const { toast } = useToast();

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("verify");
    toast("Un code de vérification a été envoyé à ton numéro.", "info");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Compte créé ! Bienvenue sur FripCash.");
  };

  return (
    <div>
      {step === "form" ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Créer un compte
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Inscris-toi pour commencer à acheter et vendre.
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
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
                  className="pl-9 h-11"
                />
              </div>
            </div>

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
              Continuer
              <FiArrowRight className="h-4 w-4" />
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
        </>
      ) : (
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

          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6-digit code input */}
            <div className="flex items-center justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
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
              onClick={() => setStep("form")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Modifier le numéro
            </button>
          </form>
        </>
      )}
    </div>
  );
}
