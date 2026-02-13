"use client";

import { useState } from "react";
import { mockCurrentUser } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { FiAlertCircle } from "react-icons/fi";

const settingsTabs = [
  { id: "account", label: "Compte" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Confidentialité" },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");

  // Account state
  const [phone, setPhone] = useState(mockCurrentUser.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notifications state
  const [notifs, setNotifs] = useState({
    newMessage: true,
    orderUpdate: true,
    promotion: false,
    newsletter: false,
    smsAlerts: true,
  });

  // Privacy state
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

  const handleSaveNotifs = () => {
    showToast("Préférences de notifications enregistrées", "success");
  };

  const handleSavePrivacy = () => {
    showToast("Paramètres de confidentialité enregistrés", "success");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos préférences de compte</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Numéro de téléphone</h3>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full max-w-sm h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
            <div className="space-y-3 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe actuel</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h3 className="font-semibold text-destructive mb-2">Zone dangereuse</h3>
            <p className="text-sm text-muted-foreground mb-4">La suppression de votre compte est irréversible. Toutes vos données seront supprimées.</p>
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

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notifications</h3>
            <div className="space-y-4">
              {[
                { key: "newMessage" as const, label: "Nouveaux messages", desc: "Recevoir une notification pour chaque nouveau message" },
                { key: "orderUpdate" as const, label: "Mises à jour de commande", desc: "Suivi de vos achats et ventes" },
                { key: "promotion" as const, label: "Promotions", desc: "Offres spéciales et réductions" },
                { key: "newsletter" as const, label: "Newsletter", desc: "Actualités et conseils FripCash" },
                { key: "smsAlerts" as const, label: "Alertes SMS", desc: "Recevoir les notifications par SMS" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifs[item.key] ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs[item.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveNotifs}
            className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Paramètres de confidentialité</h3>
            <div className="space-y-4">
              {[
                { key: "profileVisible" as const, label: "Profil public", desc: "Permettre aux autres de voir votre profil" },
                { key: "activityStatus" as const, label: "Statut d'activité", desc: "Afficher quand vous êtes en ligne" },
                { key: "showRating" as const, label: "Afficher les avis", desc: "Rendre visibles vos évaluations" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrivacy((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${privacy[item.key] ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${privacy[item.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSavePrivacy}
            className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <FiAlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Supprimer votre compte ?</h3>
              <p className="text-sm text-muted-foreground">Cette action est irréversible. Toutes vos données, articles et transactions seront définitivement supprimés.</p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">Annuler</button>
              <button type="button" onClick={() => { setShowDeleteConfirm(false); showToast("Compte supprimé", "success"); }} className="flex-1 h-10 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
