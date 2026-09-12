"use client";

import { useState } from "react";
import { useMe, useBecomeParticulier } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { FiAlertCircle, FiShoppingBag, FiSmartphone } from "react-icons/fi";
import { buildSellerSnapshot } from "@/lib/account-capabilities";
import { GetAppBanner } from "@/components/dashboard/get-app-banner";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
} from "@/components/app-store-badges";

const settingsTabs = [
  { id: "account", label: "Compte" },
  { id: "seller", label: "Vendre" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Confidentialité" },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const { data: user } = useMe();
  const becomeParticulier = useBecomeParticulier();
  const [activeTab, setActiveTab] = useState("account");
  const [upgradeConfirm, setUpgradeConfirm] = useState(false);

  const seller =
    user?.seller ??
    buildSellerSnapshot({
      role: user?.role,
      shopKind:
        (user?.shopKind as "standard" | "proximite" | "enseigne" | null) ??
        null,
    });

  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifs, setNotifs] = useState({
    newMessage: true,
    orderUpdate: true,
    promotion: false,
    newsletter: false,
    smsAlerts: true,
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityStatus: true,
    showRating: true,
  });

  const handleSaveAccount = () => {
    if (newPassword && newPassword !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    showToast("Paramètres du compte mis à jour", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleNewsletter = async () => {
    const email = user?.email || user?.phone;
    if (!email) {
      showToast("Aucun email associé à ton compte", "error");
      return;
    }
    setNewsletterLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    if (notifs.newsletter) {
      setNotifs((prev) => ({ ...prev, newsletter: false }));
      showToast("Tu es désinscrit de la newsletter (démo)", "info");
    } else {
      setNotifs((prev) => ({ ...prev, newsletter: true }));
      showToast("Inscrit à la newsletter ! (démo)", "success");
    }
    setNewsletterLoading(false);
  };

  const handleBecomeParticulier = () => {
    becomeParticulier();
    setUpgradeConfirm(false);
    showToast(
      "Profil particulier activé. Tes achats restent sur ce compte.",
      "success"
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre compte — pas de changement de rôle libre
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {settingsTabs.map((tab) => (
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
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Numéro de téléphone
            </h3>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full max-w-sm h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Changer le mot de passe
            </h3>
            <div className="space-y-3 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAccount}
            className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Enregistrer les modifications
          </button>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-semibold text-destructive mb-2">
              Zone dangereuse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de votre compte est irréversible.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-9 px-4 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive hover:text-white transition-colors"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}

      {activeTab === "seller" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold text-foreground">Profil vendeur</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un seul compte. Tu upgrades pour vendre — pas de changement de rôle
              libre. Tes achats restent toujours visibles.
            </p>
            <dl className="grid gap-2 text-sm pt-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Statut</dt>
                <dd className="font-medium text-foreground">
                  {seller.kind === "none"
                    ? "Acheteur uniquement"
                    : seller.kind === "particulier"
                      ? "Particulier (seconde main)"
                      : "Boutique"}
                </dd>
              </div>
              {seller.listingDestination && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Univers</dt>
                  <dd className="font-medium text-foreground">
                    {seller.listingDestination === "secondeMain"
                      ? "Seconde main"
                      : seller.listingDestination}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {seller.kind === "none" && (
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
                    d&apos;achats conservé.
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

          {seller.kind === "particulier" && (
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
                    Boutique, commerce local ou enseigne (avec validation) —
                    dans l&apos;app FripCash.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={APP_STORE_URL}
                  className="h-9 px-4 inline-flex items-center rounded-lg bg-zinc-950 text-white text-xs font-medium"
                >
                  App Store
                </a>
                <a
                  href={PLAY_STORE_URL}
                  className="h-9 px-4 inline-flex items-center rounded-lg bg-zinc-950 text-white text-xs font-medium"
                >
                  Google Play
                </a>
              </div>
            </div>
          )}

          <GetAppBanner
            compact
            title="Boutique & livreur dans l'app"
            description="Import Excel, proximité, enseignes et espace livreur restent sur mobile."
          />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Préférences de notifications
            </h3>
            <div className="space-y-4">
              {(
                [
                  {
                    key: "newMessage" as const,
                    label: "Nouveaux messages",
                    desc: "Recevoir une notification pour chaque nouveau message",
                  },
                  {
                    key: "orderUpdate" as const,
                    label: "Mises à jour de commande",
                    desc: "Suivi de vos achats et ventes",
                  },
                  {
                    key: "promotion" as const,
                    label: "Promotions",
                    desc: "Offres spéciales et réductions",
                  },
                  {
                    key: "newsletter" as const,
                    label: "Newsletter",
                    desc: "Actualités et conseils FripCash",
                  },
                  {
                    key: "smsAlerts" as const,
                    label: "Alertes SMS",
                    desc: "Recevoir les notifications par SMS",
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={item.key === "newsletter" && newsletterLoading}
                    onClick={() => {
                      if (item.key === "newsletter") {
                        handleToggleNewsletter();
                      } else {
                        setNotifs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }));
                      }
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                      notifs[item.key] ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifs[item.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast(
                "Préférences de notifications enregistrées",
                "success"
              )
            }
            className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Paramètres de confidentialité
            </h3>
            <div className="space-y-4">
              {(
                [
                  {
                    key: "profileVisible" as const,
                    label: "Profil public",
                    desc: "Permettre aux autres de voir votre profil",
                  },
                  {
                    key: "activityStatus" as const,
                    label: "Statut d'activité",
                    desc: "Afficher quand vous êtes en ligne",
                  },
                  {
                    key: "showRating" as const,
                    label: "Afficher les avis",
                    desc: "Rendre visibles vos évaluations",
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacy((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      privacy[item.key] ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        privacy[item.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast(
                "Paramètres de confidentialité enregistrés",
                "success"
              )
            }
            className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Enregistrer
          </button>
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
                onClick={handleBecomeParticulier}
                className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <FiAlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Supprimer votre compte ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  showToast("Compte supprimé", "success");
                }}
                className="flex-1 h-10 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
