"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FiUser, FiPhone, FiAtSign, FiArrowRight, FiRefreshCw } from "react-icons/fi";

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
      `${l}.${f}${rand2()}`,
    );
  } else {
    const name = f || l;
    suggestions.push(
      `${name}${rand3()}`,
      `${name}_${rand2()}`,
      `${name}.shop${rand2()}`,
      `${name}frip${rand2()}`,
    );
  }

  const unique = [...new Set(suggestions)];
  return unique.slice(0, 4);
}

export default function InscriptionPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [suggestionKey, setSuggestionKey] = useState(0);

  const suggestions = useMemo(
    () => generatePseudos(firstName, lastName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstName, lastName, suggestionKey]
  );

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

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
    if (!lastName.trim() || !firstName.trim() || !pseudo.trim() || !phone.trim()) {
      toast("Remplis tous les champs.", "error");
      return;
    }
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
                    <p className="text-xs text-muted-foreground">Suggestions :</p>
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

            {/* Numéro de téléphone */}
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
