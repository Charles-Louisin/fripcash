"use client";

import { useState, useMemo, useEffect } from "react";
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
  updateMe,
  signUpEmail,
  sendVerificationEmail,
} from "@/lib/api";
import { mapMeToUiUser } from "@/hooks/use-auth";
import {
  FiUser,
  FiPhone,
  FiAtSign,
  FiRefreshCw,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
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

type Step = "identifier" | "code" | "verify-email" | "profile";

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [countryId, setCountryId] = useState<AuthCountryId>("GN");
  const country = AUTH_COUNTRIES[countryId];
  const isEmailAuth = country.authMethod === "email";

  const [step, setStep] = useState<Step>("identifier");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(DEV_OTP);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [verifyHint, setVerifyHint] = useState<string | null>(null);

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

  const handleCountryChange = (id: AuthCountryId) => {
    setCountryId(id);
    setStep("identifier");
    setLocalPhone("");
    setPhoneSent("");
    setEmail("");
    setPassword("");
    setCode(DEV_OTP);
    setVerifyHint(null);
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

  const trySendVerification = async (addr: string) => {
    const callbackURL =
      typeof window !== "undefined"
        ? `${window.location.origin}/verifier-email`
        : undefined;
    try {
      await sendVerificationEmail(addr, callbackURL);
      setVerifyHint(
        "Un email de confirmation t’a été envoyé. Clique le lien pour valider ton adresse."
      );
      return true;
    } catch (err) {
      const code =
        err instanceof ApiError
          ? String(err.body.code || err.body.message || "")
          : "";
      if (
        code.includes("VERIFICATION_EMAIL_NOT_ENABLED") ||
        code.includes("Invalid callbackURL") ||
        code.includes("INVALID_CALLBACK_URL")
      ) {
        setVerifyHint(
          "Compte créé. La confirmation email n’est pas encore activée côté serveur — tu peux continuer. Demande au BE d’activer send-verification-email + whitelist de /verifier-email."
        );
        return false;
      }
      setVerifyHint(
        err instanceof ApiError
          ? err.body.message
          : "Compte créé — envoi de confirmation impossible pour le moment."
      );
      return false;
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast("Indique ton prénom et ton nom.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      toast("Adresse email invalide.", "error");
      return;
    }
    if (password.length < 8) {
      toast("Mot de passe : 8 caractères minimum.", "error");
      return;
    }
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    setLoading(true);
    try {
      const auth = await signUpEmail({
        email: email.trim(),
        password,
        name,
      });
      const me = await fetchMe().catch(() => null);
      if (me) {
        cacheMe(me);
        recordLoginSession({
          email: me.email || email.trim(),
          displayName: me.displayName || name,
          role: "acheteur",
          userId: me.id,
        });
      } else if (auth.user) {
        recordLoginSession({
          email: auth.user.email,
          displayName: auth.user.name,
          role: "acheteur",
          userId: auth.user.id,
        });
      }

      await trySendVerification(email.trim());
      setStep("verify-email");
      toast("Compte créé — vérifie ton email.", "success");
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
      const auth = await verifyOtp(phoneSent, code.replace(/\D/g, ""));
      const me = await fetchMe();
      cacheMe(me);
      recordLoginSession({
        email: me.phone ?? fullPhoneFromLocal(phoneSent, country),
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
    const name =
      pseudo.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();
    setLoading(true);
    try {
      const me = await updateMe({
        name,
        preferredLocale: isEmailAuth ? "FR" : "FR",
      });
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

  const resendVerification = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const ok = await trySendVerification(email.trim());
      toast(
        ok
          ? "Email renvoyé."
          : "Envoi impossible — vérifie la config email côté BE.",
        ok ? "success" : "warning"
      );
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "profile"
      ? "Ton profil"
      : step === "verify-email"
        ? "Confirme ton email"
        : "Créer un compte";

  const subtitle =
    step === "profile"
      ? "Comment veux-tu apparaître sur FripCash ?"
      : step === "verify-email"
        ? "Dernière étape pour activer ton compte France."
        : isEmailAuth
          ? "Inscription France — email + mot de passe."
          : "Inscription Guinée — SMS, même compte que l'app.";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {step === "identifier" && (
        <form
          onSubmit={isEmailAuth ? handleEmailSignUp : handleSendOtp}
          className="space-y-4"
        >
          {isEmailAuth && (
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
          )}

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
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="toi@exemple.fr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-9 h-11"
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
                  <SelectTrigger className="h-11 w-auto shrink-0 rounded-r-none border-r-0 bg-muted px-3 gap-1.5 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:opacity-60">
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
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    className="pl-9 h-11 rounded-l-none"
                  />
                </div>
              </div>
            )}
          </div>

          {isEmailAuth && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="8 caractères minimum"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pl-9 pr-11 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
          >
            {loading
              ? isEmailAuth
                ? "Création..."
                : "Envoi..."
              : isEmailAuth
                ? "Créer mon compte"
                : "Recevoir le code"}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Code envoyé au {country.label} {phoneSent}
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
            onClick={() => setStep("identifier")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Changer de numéro
          </button>
        </form>
      )}

      {step === "verify-email" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {verifyHint ||
              `Nous avons envoyé un lien à ${email}. Ouvre-le pour confirmer ton adresse.`}
          </div>
          <Button
            type="button"
            disabled={loading}
            variant="outline"
            className="w-full h-11"
            onClick={resendVerification}
          >
            {loading ? "Envoi..." : "Renvoyer l’email"}
          </Button>
          <Button
            type="button"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md"
            onClick={() => setStep("profile")}
          >
            Continuer vers mon profil
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Après le clic dans l’email tu arriveras sur{" "}
            <code className="text-[10px]">/verifier-email</code>.
          </p>
        </div>
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
