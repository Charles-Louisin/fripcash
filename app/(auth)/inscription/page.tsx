"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  sendOtp,
  verifyOtp,
  fetchMe,
  updateMe,
} from "@/lib/api";
import { mapMeToUiUser } from "@/hooks/use-auth";
import {
  FiUser,
  FiPhone,
  FiAtSign,
  FiRefreshCw,
} from "react-icons/fi";
import {
  AUTH_COUNTRY,
  fullPhoneFromLocal,
  isValidLocalPhone,
  normalizeLocalPhone,
} from "@/lib/auth-country";
import { recordLoginSession } from "@/lib/admin-session-tracker";

const DEV_OTP =
  process.env.NODE_ENV === "development" ? "000000" : "";

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

  return [...new Set(suggestions)].slice(0, 4);
}

type Step = "phone" | "code" | "profile";

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("phone");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState("");
  const [code, setCode] = useState(DEV_OTP);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("fripcash_need_profile") === "1") {
        sessionStorage.removeItem("fripcash_need_profile");
        setStep("profile");
        return;
      }
    } catch {
      /* ignore */
    }
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("step") === "profile"
    ) {
      setStep("profile");
    }
  }, []);

  const suggestions = useMemo(
    () => generatePseudos(firstName, lastName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstName, lastName, suggestionKey]
  );

  const cacheMe = (me: Awaited<ReturnType<typeof fetchMe>>) => {
    queryClient.setQueryData(["me"], mapMeToUiUser(me));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLocalPhone(localPhone)) {
      toast(
        `Numéro invalide — ${AUTH_COUNTRY.maxLocalDigits} chiffres requis.`,
        "error"
      );
      return;
    }
    const phoneNumber = normalizeLocalPhone(localPhone);
    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setPhoneSent(phoneNumber);
      setStep("code");
      setCode(DEV_OTP);
      toast(
        process.env.NODE_ENV === "development"
          ? "Code envoyé (démo : 000000)."
          : "Code envoyé par SMS.",
        "success"
      );
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.body.message
          : "Impossible d'envoyer le code.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.replace(/\D/g, "").length !== 6) {
      toast("Entre le code à 6 chiffres.", "error");
      return;
    }
    setLoading(true);
    try {
      const auth = await verifyOtp(phoneSent, code.replace(/\D/g, ""));
      const me = await fetchMe();
      cacheMe(me);
      recordLoginSession({
        email: me.phone ?? fullPhoneFromLocal(phoneSent),
        displayName: me.displayName,
        role: "acheteur",
        userId: me.id,
      });
      const looksLikePhone =
        !me.displayName ||
        me.displayName === me.phone ||
        me.displayName.replace(/\D/g, "").includes(phoneSent) ||
        auth.user.name === auth.user.phoneNumber;
      if (looksLikePhone) {
        setStep("profile");
      } else {
        toast("Bienvenue sur FripCash !");
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError && err.body.code === "TOO_MANY_ATTEMPTS") {
        toast("Trop d'essais. Renvoie un code.", "error");
        setStep("phone");
      } else {
        toast(
          err instanceof ApiError ? err.body.message : "Code invalide.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast("Indique ton prénom et ton nom.", "error");
      return;
    }
    const name =
      pseudo.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();
    setLoading(true);
    try {
      const me = await updateMe({ name });
      cacheMe(me);
      toast("Compte créé ! Bienvenue sur FripCash.");
      router.push("/dashboard");
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.body.message
          : "Impossible d'enregistrer le profil.",
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
          {step === "profile" ? "Ton profil" : "Créer un compte"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "profile"
            ? "Comment veux-tu apparaître sur FripCash ?"
            : "Inscription par SMS — même compte que l'app."}
        </p>
      </div>

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
                  onChange={(e) =>
                    setLocalPhone(normalizeLocalPhone(e.target.value))
                  }
                  maxLength={AUTH_COUNTRY.maxLocalDigits}
                  inputMode="numeric"
                  className="pl-9 h-11 rounded-l-none"
                />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
          >
            {loading ? "Envoi..." : "Recevoir le code"}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Code envoyé au {AUTH_COUNTRY.label} {phoneSent}
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs rounded-md bg-muted px-3 py-2 text-muted-foreground">
              Dev : utilise <strong>000000</strong>
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Code SMS
            </label>
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={loading}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
          >
            {loading ? "Vérification..." : "Continuer"}
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("phone")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Changer de numéro
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfile} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Pseudo (optionnel)
            </label>
            <div className="relative">
              <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Comment tu apparais"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
          >
            {loading ? "Enregistrement..." : "Terminer"}
          </Button>
        </form>
      )}

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
