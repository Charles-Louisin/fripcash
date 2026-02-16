"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { authApi, setToken } from "@/lib/api";
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

  const [step, setStep] = useState<"form" | "verify">("form");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);

  const fullPhone = `+224${localPhone.replace(/\s/g, "")}`;

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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastName.trim() || !firstName.trim() || !pseudo.trim() || !localPhone.trim() || !password) {
      toast("Remplis tous les champs.", "error");
      return;
    }

    if (localPhone.replace(/\s/g, "").length < 9) {
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
    try {
      await authApi.register({
        phone: fullPhone,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        pseudo: pseudo.trim(),
      });
      setStep("verify");
      toast("Un code de vérification a été envoyé à ton numéro.", "info");
    } catch (err: any) {
      toast(err?.message || "Erreur lors de l'inscription.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast("Entre le code à 6 chiffres.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifySms({ phone: fullPhone, code: fullCode });
      setToken(res.token);
      toast("Compte créé ! Bienvenue sur FripCash.");
      router.push("/");
    } catch (err: any) {
      toast(err?.message || "Code invalide ou expiré.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await authApi.resendCode({ phone: fullPhone });
      toast("Code renvoyé ! Vérifie tes SMS.", "info");
    } catch (err: any) {
      toast(err?.message || "Erreur lors du renvoi.", "error");
    } finally {
      setLoading(false);
    }
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

            {/* Numéro de téléphone with +224 prefix */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Numéro de téléphone
              </label>
              <div className="relative flex">
                <div className="flex items-center gap-1.5 px-3 h-11 rounded-l-md border border-r-0 border-input bg-muted text-sm font-medium text-foreground shrink-0 select-none">
                  <span className="text-base leading-none">🇬🇳</span>
                  <span>+224</span>
                </div>
                <div className="relative flex-1">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="6XX XXX XXX"
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
                  Continuer
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
        </>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Vérification SMS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Un code à 6 chiffres a été envoyé au{" "}
              <span className="font-semibold text-foreground">{fullPhone}</span>
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
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                "Vérifier"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                Renvoyer le code
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Modifier les informations
            </button>
          </form>
        </>
      )}
    </div>
  );
}
