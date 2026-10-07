"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  sendOtp,
  verifyOtp,
  fetchMe,
  signUpEmail,
} from "@/lib/api";
import { EmailVerifyModal } from "@/components/auth/email-verify-modal";
import type { Me } from "@/lib/api";
import { mapMeToUiUser } from "@/hooks/use-auth";
import {
  applySessionFlags,
  homeForAccount,
  needsEmailVerification,
} from "@/lib/auth-redirect";
import { passwordError, passwordsMatchError } from "@/lib/password";
import {
  SIGNUP_ROLE_OPTIONS,
  type SignupRole,
} from "@/lib/signup-roles";
import {
  FiUser,
  FiPhone,
  FiAtSign,
  FiRefreshCw,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiShoppingBag,
  FiHome,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2, HiOutlineBuildingStorefront } from "react-icons/hi2";
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

const ROLE_ICONS: Record<SignupRole, ReactNode> = {
  acheteur: <FiShoppingBag className="h-6 w-6" />,
  particulier: <FiUser className="h-6 w-6" />,
  boutique: <FiHome className="h-6 w-6" />,
  commerceLocal: <HiOutlineBuildingStorefront className="h-6 w-6" />,
  grandeSurface: <HiOutlineBuildingOffice2 className="h-6 w-6" />,
};

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

type Step = "role" | "identifier" | "code" | "profile";

function WizardHeader({ current }: { current: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Rôle", hint: "Qui tu es" },
    { n: 2, label: "Tes infos", hint: "Profil" },
    { n: 3, label: "Ton compte", hint: "Identifiants" },
  ] as const;

  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
        Rejoins FripCash
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Deux questions, et c’est parti.
      </p>
      <ol className="mt-6 flex items-start gap-0">
        {items.map((item, i) => {
          const done = current > item.n;
          const active = current === item.n;
          return (
            <li key={item.n} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={`h-px flex-1 ${
                      done || active ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <FiCheck className="h-4 w-4" /> : item.n}
                </span>
                {i < items.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      done ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-xs font-medium ${
                  active || done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </p>
              <p className="text-[11px] text-muted-foreground">{item.hint}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [countryId, setCountryId] = useState<AuthCountryId>("GN");
  const country = AUTH_COUNTRIES[countryId];
  const isEmailAuth = country.authMethod === "email";

  const [signupRole, setSignupRole] = useState<SignupRole | null>(null);
  const [step, setStep] = useState<Step>("role");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState(DEV_OTP);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [pendingVerify, setPendingVerify] = useState<Me | null>(null);

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

  const wizardStep: 1 | 2 | 3 =
    step === "role" ? 1 : step === "profile" ? 2 : 3;

  const cacheMe = (me: Awaited<ReturnType<typeof fetchMe>>) => {
    queryClient.setQueryData(["me"], mapMeToUiUser(me));
  };

  const goHome = (me: Awaited<ReturnType<typeof fetchMe>>) => {
    applySessionFlags(me);
    router.push(homeForAccount(me));
  };

  const handleCountryChange = (id: AuthCountryId) => {
    setCountryId(id);
    setStep("identifier");
    setLocalPhone("");
    setPhoneSent("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode(DEV_OTP);
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
    if (!firstName.trim() || !lastName.trim()) {
      toast("Indique ton prénom et ton nom.", "error");
      setStep("profile");
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupRole) {
      toast("Choisis d’abord ton rôle.", "error");
      setStep("role");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast("Indique ton prénom et ton nom.", "error");
      setStep("profile");
      return;
    }
    if (!isValidEmail(email)) {
      toast("Adresse email invalide.", "error");
      return;
    }
    const pwdErr = passwordError(password);
    if (pwdErr) {
      toast(pwdErr, "error");
      return;
    }
    const matchErr = passwordsMatchError(password, confirmPassword);
    if (matchErr) {
      toast(matchErr, "error");
      return;
    }
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    setLoading(true);
    try {
      const auth = await signUpEmail({
        email: email.trim(),
        password,
        name,
        signupRole,
      });
      const me = await fetchMe().catch(() => null);
      if (me) {
        cacheMe(me);
        applySessionFlags(me);
        recordLoginSession({
          email: me.email || email.trim(),
          displayName: me.displayName || name,
          role: signupRole,
          userId: me.id,
        });
      } else if (auth.user) {
        recordLoginSession({
          email: auth.user.email,
          displayName: auth.user.name,
          role: signupRole,
          userId: auth.user.id,
        });
      }

      if (me && needsEmailVerification(me)) {
        setPendingVerify(me);
        toast("Compte créé — confirme ton email.", "success");
        return;
      }
      toast("Compte créé.", "success");
      if (me) goHome(me);
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.body.message
          : "Impossible de créer le compte.",
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
      const displayName =
        pseudo.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();
      await verifyOtp(
        phoneSent,
        code.replace(/\D/g, ""),
        signupRole ?? undefined,
        displayName ? { name: displayName, displayName } : undefined
      );
      const me = await fetchMe();
      cacheMe(me);
      applySessionFlags(me);
      recordLoginSession({
        email: me.phone ?? fullPhoneFromLocal(phoneSent, country),
        displayName: me.displayName || displayName,
        role: signupRole ?? "acheteur",
        userId: me.id,
      });
      toast("Bienvenue sur FripCash !");
      goHome(me);
    } catch (err) {
      if (err instanceof ApiError && err.body.code === "TOO_MANY_ATTEMPTS") {
        toast("Trop d'essais. Renvoie un code.", "error");
        setStep("identifier");
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
    setStep("identifier");
  };

  return (
    <div>
      <EmailVerifyModal
        open={Boolean(pendingVerify?.email)}
        email={pendingVerify?.email || email}
        onVerified={() => {
          if (!pendingVerify) return;
          const next = { ...pendingVerify, emailVerified: true };
          cacheMe(next);
          setPendingVerify(null);
          goHome(next);
        }}
      />
      <WizardHeader current={wizardStep} />

      {step === "role" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Je m’inscris en tant que
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ce choix décide où tes annonces apparaîtront. Pas d’étape
              périmètre ensuite : boutique = toute la ville, commerce local =
              quartiers.
            </p>
          </div>
          <div className="space-y-3">
            {SIGNUP_ROLE_OPTIONS.map((option) => {
              const selected = signupRole === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSignupRole(option.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ROLE_ICONS[option.id]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "border border-border"
                    }`}
                  >
                    {selected ? <FiCheck className="h-3.5 w-3.5" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
              aria-label="Retour"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <Button
              type="button"
              disabled={!signupRole}
              onClick={() => setStep("profile")}
              className="h-12 flex-1 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continuer
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "identifier" && (
        <form
          onSubmit={isEmailAuth ? handleEmailSignUp : handleSendOtp}
          className="space-y-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Ton compte
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEmailAuth
                ? "Inscription France — email et mot de passe."
                : "Inscription Guinée — un code SMS suffit."}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-foreground">
                {isEmailAuth ? "Adresse email" : "Numéro de téléphone"}
              </label>
              {isEmailAuth && (
                <Select
                  value={countryId}
                  onValueChange={(v) =>
                    handleCountryChange(v as AuthCountryId)
                  }
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
                  onValueChange={(v) =>
                    handleCountryChange(v as AuthCountryId)
                  }
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
          </div>

          {isEmailAuth && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="8 caractères, lettre + chiffre"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Retape le même mot de passe"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 pl-9 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showConfirm
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirm ? (
                      <FiEyeOff className="h-4 w-4" />
                    ) : (
                      <FiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep("profile")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
              aria-label="Retour"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading
                ? isEmailAuth
                  ? "Création..."
                  : "Envoi..."
                : isEmailAuth
                  ? "Créer mon compte"
                  : "Recevoir le code"}
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {step === "code" && (
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

      {step === "profile" && (
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tes infos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Comment tu apparais sur FripCash.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nom
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ton nom"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Prénom
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ton prénom"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Pseudo (optionnel)
            </label>
            <div className="relative">
              <FiAtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Comment tu apparais"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="h-11 pl-9"
              />
            </div>
            {(firstName.trim() || lastName.trim()) && suggestions.length > 0 && (
              <div className="mt-2">
                <div className="mb-1.5 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Suggestions :</p>
                  <button
                    type="button"
                    onClick={() => setSuggestionKey((k) => k + 1)}
                    className="text-muted-foreground transition-colors hover:text-primary"
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
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                        pseudo === s
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      @{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep("role")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
              aria-label="Retour"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <Button
              type="submit"
              className="h-12 flex-1 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continuer
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
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
