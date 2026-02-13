"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { FiSave } from "react-icons/fi";

export default function ParametresPage() {
  const { toast } = useToast();

  // General settings
  const [platformName, setPlatformName] = useState("FripCash");
  const [contactEmail, setContactEmail] = useState("contact@fripcash.com");
  const [contactPhone, setContactPhone] = useState("+237 6XX XXX XXX");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Commission settings
  const [commissionRate, setCommissionRate] = useState(10);
  const [minCommission, setMinCommission] = useState(500);

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [disputeNotifs, setDisputeNotifs] = useState(true);
  const [newUserNotifs, setNewUserNotifs] = useState(false);

  const handleSaveGeneral = () => {
    toast("Paramètres généraux enregistrés.", "success");
  };

  const handleSaveCommission = () => {
    toast(`Commission mise à jour : ${commissionRate}%`, "success");
  };

  const handleSaveNotifications = () => {
    toast("Préférences de notification enregistrées.", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuration de la plateforme</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4">Informations générales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom de la plateforme
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              {/* Maintenance mode */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Mode maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    Désactive temporairement l&apos;accès à la plateforme pour les utilisateurs
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {maintenanceMode && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">
                    Le mode maintenance est activé. Les utilisateurs ne peuvent pas accéder à la plateforme.
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveGeneral}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <FiSave className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4">Paramètres de commission</h3>
            <div className="space-y-6">
              {/* Commission rate */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Taux de commission (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Math.min(30, Math.max(1, Number(e.target.value))))}
                      className="w-16 h-9 rounded-lg border border-input bg-background px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  FripCash prélèvera {commissionRate}% sur chaque vente. Pour un article vendu à
                  10 000 F, la commission sera de {(10000 * commissionRate / 100).toLocaleString("fr-FR")} F.
                </p>
              </div>

              {/* Minimum commission */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Commission minimale (FCFA)
                </label>
                <input
                  type="number"
                  value={minCommission}
                  onChange={(e) => setMinCommission(Number(e.target.value))}
                  className="w-full max-w-[200px] h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  La commission ne sera jamais inférieure à ce montant.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Aperçu des commissions</p>
                <div className="space-y-2">
                  {[5000, 10000, 25000, 50000, 100000].map((price) => {
                    const comm = Math.max(minCommission, Math.round(price * commissionRate / 100));
                    return (
                      <div key={price} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Article à {price.toLocaleString("fr-FR")} F
                        </span>
                        <span className="font-medium text-primary">
                          {comm.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveCommission}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <FiSave className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-1">
              {[
                {
                  label: "Notifications par email",
                  description: "Recevoir un email pour les événements importants",
                  checked: emailNotifs,
                  onChange: setEmailNotifs,
                },
                {
                  label: "Notifications SMS",
                  description: "Recevoir un SMS pour les alertes critiques",
                  checked: smsNotifs,
                  onChange: setSmsNotifs,
                },
                {
                  label: "Alertes litiges",
                  description: "Être notifié dès qu'un nouveau litige est ouvert",
                  checked: disputeNotifs,
                  onChange: setDisputeNotifs,
                },
                {
                  label: "Nouveaux utilisateurs",
                  description: "Être notifié des nouvelles inscriptions",
                  checked: newUserNotifs,
                  onChange: setNewUserNotifs,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch checked={item.checked} onCheckedChange={item.onChange} />
                </div>
              ))}

              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors mt-4"
              >
                <FiSave className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
