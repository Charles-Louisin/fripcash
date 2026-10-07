"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FiPhone, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  sendOtp,
  verifyOtp,
  fetchMe,
  signInEmail,
  clearToken,
  readToken,
  sendVerificationEmail,
} from "@/lib/api";
import { mapMeToUiUser } from "@/hooks/use-auth";
import {
  applySessionFlags,
  homeForAccount,
  needsEmailVerification,
} from "@/lib/auth-redirect";
import { EmailVerifyModal } from "@/components/auth/email-verify-modal";
import type { Me } from "@/lib/api";
import {
  AUTH_COUNTRIES,
  AUTH_COUNTRY_OPTIONS,
  type AuthCountryId,
  fullPhoneFromLocal,
  isValidEmail,
  isValidLocalPhone,
  normalizeLocalPhone,
} from "@/lib/auth-country";
import { recordLoginSession } from "@/lib/admin-session-tracker";

const DEV_OTP =
  process.env.NODE_ENV === "development" ? "000000" : "";

function connexionErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && !(err instanceof ApiError)) {
    return err.message;
  }
  if (!(err instanceof ApiError)) return fallback;
  return err.body.message || fallback;
}

export default function ConnexionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [countryId, setCountryId] = useState<AuthCountryId>("GN");
  const country = AUTH_COUNTRIES[countryId];
  const isEmailAuth = country.authMethod === "email";

  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(DEV_OTP);
  const [loading, setLoading] = useState(false);
  const [pendingMe, setPendingMe] = useState<Me | null>(null);

  useEffect(() => {
    if (!readToken()) return;
    void fetchMe()
      .then(async (me) => {
        if (!needsEmailVerification(me)) return;
        setPendingMe(me);
        try {
          await sendVerificationEmail(me.email!);
        } catch {
          /* déjà envoyé ou Resend non configuré */
        }
      })
      .catch(() => {
        /* session invalide */
      });
  }, []);

  const handleCountryChange = (id: AuthCountryId) => {
    setCountryId(id);
    setStep("identifier");
    setLocalPhone("");
    setPhoneSent("");
    setEmail("");
    setPassword("");
    setCode(DEV_OTP);
  };

  const finishLogin = async (fallbackContact: string) => {
    try {
      const me = await fetchMe();
      const user = mapMeToUiUser(me);
      queryClient.setQueryData(["me"], user);
      applySessionFlags(me);
      recordLoginSession({
        email: me.email || me.phone || fallbackContact,
        displayName: me.displayName,
        role: me.isAdmin ? "admin" : me.courier ? "livreur" : me.seller ? "vendeur" : "acheteur",
        userId: me.id,
      });
      toast("Connexion réussie !");
      if (needsEmailVerification(me)) {
        setPendingMe(me);
        return;
      }
      continueAfterAuth(me);
    } catch (err) {
      clearToken();
      throw err;
    }
  };

  const continueAfterAuth = (me: Me) => {
    if (
      !me.isAdmin &&
      !me.courier &&
      (!me.displayName || me.displayName === me.phone)
    ) {
      try {
        sessionStorage.setItem("fripcash_need_profile", "1");
      } catch {
        /* ignore */
      }
      router.push("/inscription");
      return;
    }
    router.push(homeForAccount(me));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLocalPhone(localPhone, country)) {
      toast(
        `Numéro invalide — ${country.maxLocalDigits} chiffres requis.`,
        "error"
      );
      return;
    }
    const phoneNumber = normalizeLocalPhone(localPhone, country);
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast("Adresse email invalide.", "error");
      return;
    }
    if (!password) {
      toast("Entre ton mot de passe.", "error");
      return;
    }
    setLoading(true);
    try {
      await signInEmail(email.trim(), password);
      await finishLogin(email.trim());
    } catch (err) {
      toast(connexionErrorMessage(err, "Email ou mot de passe incorrect."), "error");
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
      await verifyOtp(phoneSent, code.replace(/\D/g, ""));
      await finishLogin(fullPhoneFromLocal(phoneSent, country));
    } catch (err) {
      if (err instanceof ApiError && err.body.code === "TOO_MANY_ATTEMPTS") {
        toast("Trop d'essais. Renvoie un code.", "error");
        setStep("identifier");
      } else {
        toast(connexionErrorMessage(err, "Code invalide."), "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <EmailVerifyModal
        open={Boolean(pendingMe?.email)}
        email={pendingMe?.email || ""}
        onVerified={() => {
          if (!pendingMe) return;
          const next = { ...pendingMe, emailVerified: true };
          queryClient.setQueryData(["me"], mapMeToUiUser(next));
          setPendingMe(null);
          continueAfterAuth(next);
        }}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Une seule connexion pour tout le monde — tu es ensuite dirigé vers
          ton espace.
        </p>
      </div>

      {step === "identifier" ? (
        <form
          onSubmit={isEmailAuth ? handleEmailLogin : handleSendOtp}
          className="space-y-4"
        >
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-foreground">
                {isEmailAuth ? "Adresse email" : "Numéro de téléphone"}
              </label>
              {isEmailAuth && (
                <Select
                  value={countryId}
                  onValueChange={(v) => handleCountryChange(v as AuthCountryId)}
                >
                  <SelectTrigger className="h-8 w-auto gap-1.5 border-0 bg-transparent px-1.5 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:h-3.5 [&>svg]:opacity-50">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="text-sm leading-none">{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {AUTH_COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{c.flag}</span>
                          <span>
                            {c.name}
                            {c.authMethod === "phone" ? ` (${c.code})` : ""}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {isEmailAuth ? (
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="toi@exemple.fr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11 pl-9"
                />
              </div>
            ) : (
              <div className="relative flex">
                <Select
                  value={countryId}
                  onValueChange={(v) => handleCountryChange(v as AuthCountryId)}
                >
                  <SelectTrigger className="h-11 w-auto shrink-0 gap-1.5 rounded-r-none border-r-0 bg-muted px-3 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:opacity-60">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <span className="text-base leading-none">{country.flag}</span>
                      <span>{country.code}</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {AUTH_COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{c.flag}</span>
                          <span>
                            {c.name}
                            {c.authMethod === "phone" ? ` (${c.code})` : ""}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <FiPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder={country.placeholder}
                    required
                    value={localPhone}
                    onChange={(e) =>
                      setLocalPhone(
                        normalizeLocalPhone(e.target.value, country)
                      )
                    }
                    maxLength={country.maxLocalDigits}
                    inputMode="numeric"
                    className="h-11 rounded-l-none pl-9"
                  />
                </div>
              </div>
            )}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isEmailAuth
                ? "Email + mot de passe — acheteur, vendeur, livreur ou admin."
                : `${country.name} ${country.code} — tu recevras un code à 6 chiffres.`}
            </p>
          </div>

          {isEmailAuth && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
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
                <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ton mot de passe"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 pl-9 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading
              ? isEmailAuth
                ? "Connexion..."
                : "Envoi..."
              : isEmailAuth
                ? "Se connecter"
                : "Recevoir le code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Code envoyé au {country.label} {phoneSent}
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Dev : utilise <strong>000000</strong>
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
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
            className="h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Vérification..." : "Continuer"}
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep("identifier")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Changer de numéro
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Première fois ?{" "}
        <Link
          href="/inscription"
          className="font-semibold text-primary hover:underline"
        >
          S&apos;inscrire
        </Link>
      </p>
      {isEmailAuth && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          <Link
            href="/mot-de-passe-oublie"
            className="font-semibold text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </p>
      )}
    </div>
  );
}
