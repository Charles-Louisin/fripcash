"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMe, useBecomeParticulier, useUpdateProfile } from "@/hooks/use-auth";
import {
  useNotificationPreferences,
  useUpsertNotificationPreference,
} from "@/hooks/use-notifications";
import { useToast } from "@/components/ui/toast";
import { FiShoppingBag, FiSmartphone } from "react-icons/fi";
import { buildSellerSnapshot } from "@/lib/account-capabilities";
import { resolveAccountType, verificationLabel } from "@/lib/account-type";
import { AccountTypeBadge } from "@/components/account/account-type-badge";
import { ShopVerificationBanner } from "@/components/account/shop-verification-banner";

const settingsTabs = [
  { id: "account", label: "Compte" },
  { id: "seller", label: "Vendre" },
  { id: "notifications", label: "Notifications" },
];

const NOTIF_TYPES = [
  {
    type: "MESSAGE",
    label: "Nouveaux messages",
    desc: "Recevoir une notification pour chaque nouveau message",
  },
  {
    type: "ORDER",
    label: "Mises à jour de commande",
    desc: "Suivi de vos achats et ventes",
  },
  {
    type: "OFFER",
    label: "Offres",
    desc: "Négociations et propositions de prix",
  },
  {
    type: "PROMOTION",
    label: "Promotions",
    desc: "Offres spéciales et réductions",
  },
] as const;

function prefEnabled(
  prefs: unknown,
  type: string,
  channel: "pushEnabled" | "smsEnabled" | "emailEnabled"
): boolean {
  const rows = Array.isArray(prefs) ? prefs : [];
  const row = rows.find(
    (p: any) =>
      String(p.type || p.notificationType || "").toUpperCase() === type
  );
  if (!row) return true; // default on until user saves otherwise
  return row[channel] !== false;
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const { data: user } = useMe();
  const becomeParticulier = useBecomeParticulier();
  const updateProfile = useUpdateProfile();
  const { data: prefs = [], isLoading: prefsLoading } =
    useNotificationPreferences();
  const upsertPref = useUpsertNotificationPreference();

  const [activeTab, setActiveTab] = useState("account");
  const [upgradeConfirm, setUpgradeConfirm] = useState(false);
  const [displayName, setDisplayName] = useState(user?.pseudo || "");
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user?.pseudo) setDisplayName(user.pseudo);
  }, [user?.pseudo]);

  const account = resolveAccountType(user);
  const seller =
    user?.seller ??
    buildSellerSnapshot({
      role: user?.role,
      shopKind:
        (user?.shopKind as "standard" | "proximite" | "enseigne" | null) ??
        null,
    });

  const handleSaveAccount = () => {
    const name = displayName.trim();
    if (!name) {
      showToast("Le nom d'affichage est requis", "error");
      return;
    }
    updateProfile.mutate(
      { name },
      {
        onSuccess: () => showToast("Profil mis à jour", "success"),
        onError: (err: any) =>
          showToast(err.message || "Erreur lors de la mise à jour", "error"),
      }
    );
  };

  const handleToggleNotif = async (
    type: string,
    channel: "pushEnabled" | "smsEnabled",
    next: boolean
  ) => {
    try {
      await upsertPref.mutateAsync({
        type,
        [channel]: next,
      });
      showToast("Préférence enregistrée", "success");
    } catch (err: any) {
      showToast(err?.message || "Impossible d'enregistrer", "error");
    }
  };

  const handleBecomeParticulier = async () => {
    setUpgrading(true);
    try {
      await becomeParticulier();
      setUpgradeConfirm(false);
      showToast(
        "Profil particulier activé. Tes achats restent sur ce compte.",
        "success"
      );
    } catch (err: any) {
      showToast(err?.message || "Activation impossible", "error");
    } finally {
      setUpgrading(false);
    }
  };

  const smsAlertsOn = useMemo(
    () =>
      NOTIF_TYPES.some((t) => prefEnabled(prefs, t.type, "smsEnabled")),
    [prefs]
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Données live — pas de changement de rôle libre
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {settingsTabs.map((tab) => (
          /* label overridden below */
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.id === "seller"
              ? account.isShop
                ? "Ma boutique"
                : "Vendre"
              : tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-foreground">Compte</h3>
              <AccountTypeBadge user={user} size="md" />
            </div>
            <p className="text-sm text-muted-foreground">{account.description}</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nom d&apos;affichage
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full max-w-sm h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                value={user?.phone || ""}
                disabled
                className="w-full max-w-sm h-10 px-3 rounded-lg border border-input bg-muted text-sm text-muted-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Le numéro est géré via la connexion OTP — non modifiable ici.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={updateProfile.isPending}
              className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground mb-2">
              Mot de passe
            </h3>
            <p className="text-sm text-muted-foreground">
              Compte téléphone OTP — pas de mot de passe côté API web. Les
              comptes email (ex. France) se gèrent via le flux auth email.
            </p>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-semibold text-destructive mb-2">
              Zone dangereuse
            </h3>
            <p className="text-sm text-muted-foreground">
              La suppression de compte n&apos;est pas encore exposée par
              l&apos;API. Contacte le support pour une demande.
            </p>
          </div>
        </div>
      )}

      {activeTab === "seller" && (
        <div className="space-y-6">
          {account.isShop && <ShopVerificationBanner type={account} />}

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold text-foreground">
              {account.isShop ? "Ta boutique" : "Profil vendeur"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {account.isShop
                ? "Tu es déjà vendeur. Certaines actions (mise en ligne, Excel, annuaire) restent fermées tant que l’équipe n’a pas validé le dossier."
                : account.isSeller
                  ? "Tu vends déjà en particulier. Tes achats restent sur le même compte."
                  : "Un seul compte. Tu peux activer un profil particulier pour vendre en seconde main."}
            </p>
            <dl className="grid gap-2 text-sm pt-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-foreground">{account.label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Validation</dt>
                <dd className="font-medium text-foreground">
                  {account.requiresAdminApproval
                    ? verificationLabel(account.verificationStatus)
                    : "Non requise"}
                </dd>
              </div>
              {account.destination && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Univers</dt>
                  <dd className="font-medium text-foreground">
                    {account.destination}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {account.id === "acheteur" && seller.kind === "none" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FiShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Devenir vendeur particulier
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Publie en seconde main sur le site. Même compte, historique
                    d&apos;achats conservé. Boutique, commerce ou enseigne se
                    créent à l&apos;inscription ou via Ma boutique.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeConfirm(true)}
                className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                Activer le profil particulier
              </button>
            </div>
          )}

          {account.id === "particulier" && (
            <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <FiSmartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Créer une boutique
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Boutique, commerce local ou enseigne — dossier et
                    validation sur le site.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/boutique"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-medium text-white"
              >
                Ouvrir le dossier boutique
              </Link>
            </div>
          )}

          {account.isShop && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-foreground">Outils boutique</h3>
              <p className="text-sm text-muted-foreground">
                {account.canPublish
                  ? "Tous tes outils sont débloqués."
                  : "Tu vois déjà ton espace. Import et mise en ligne se débloquent après validation."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/boutique"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-xs font-medium hover:bg-accent"
                >
                  Ma boutique
                </Link>
                <Link
                  href="/dashboard/boutique/reglages"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-xs font-medium hover:bg-accent"
                >
                  Réglages
                </Link>
                {account.seesExcel && (
                  <Link
                    href="/dashboard/import-excel"
                    className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-xs font-medium hover:bg-accent"
                  >
                    Import Excel{account.excelImport ? "" : " (verrouillé)"}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Préférences de notifications
            </h3>
            {prefsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {NOTIF_TYPES.map((item) => {
                  const on = prefEnabled(prefs, item.type, "pushEnabled");
                  return (
                    <div
                      key={item.type}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={upsertPref.isPending}
                        onClick={() =>
                          handleToggleNotif(item.type, "pushEnabled", !on)
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                          on ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            on ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between py-2 border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Alertes SMS
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Canal SMS pour les types ci-dessus
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={upsertPref.isPending}
                    onClick={() =>
                      handleToggleNotif("ORDER", "smsEnabled", !smsAlertsOn)
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                      smsAlertsOn ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        smsAlertsOn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer"
            onClick={() => setUpgradeConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FiShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Activer le profil particulier ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Tes annonces iront en Seconde main. Tes achats et messages
                restent sur ce compte.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setUpgradeConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={upgrading}
                onClick={handleBecomeParticulier}
                className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {upgrading ? "…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
