"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { FiSave } from "react-icons/fi";
import { usePlatformSettings } from "@/hooks/use-admin";

export default function ParametresPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();

  const [platformName, setPlatformName] = useState("FripCash");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [commissionRate, setCommissionRate] = useState(5);
  const [proximityCommissionRate, setProximityCommissionRate] = useState(5);
  const [minCommission, setMinCommission] = useState(0);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [disputeNotifs, setDisputeNotifs] = useState(true);
  const [newUserNotifs, setNewUserNotifs] = useState(false);

  useEffect(() => {
    if (!settings || typeof settings !== "object") return;
    const s = settings as Record<string, unknown>;
    if (typeof s.defaultCommissionBps === "number") {
      setCommissionRate(s.defaultCommissionBps / 100);
      setProximityCommissionRate(s.defaultCommissionBps / 100);
    }
    if (typeof s.minWithdrawalGnf === "number") {
      setMinCommission(s.minWithdrawalGnf);
    }
    if (typeof s.maintenanceMode === "boolean") {
      setMaintenanceMode(s.maintenanceMode);
    }
  }, [settings]);

  const handleSaveGeneral = () => {
    toast(
      "Lecture seule — PATCH platform-settings non exposé par l’API",
      "warning"
    );
  };

  const handleSaveCommission = () => {
    toast(
      "Lecture seule — PATCH platform-settings non exposé par l’API",
      "warning"
    );
  };

  const handleSaveNotifications = () => {
    toast(
      "Préférences locales uniquement — pas d’API admin notifications",
      "warning"
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration plateforme (GET /admin/platform-settings)
          {!settings ? " — aucune ligne en base" : ""}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4">
              Informations générales
            </h3>
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
                    placeholder="Non fourni par l’API"
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Non fourni par l’API"
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    Valeur live: {String(maintenanceMode)}
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              <button
                type="button"
                onClick={handleSaveGeneral}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <FiSave className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commission">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Commission standard (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Depuis defaultCommissionBps / 100
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Commission proximité (%)
              </label>
              <input
                type="number"
                value={proximityCommissionRate}
                onChange={(e) =>
                  setProximityCommissionRate(Number(e.target.value))
                }
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Retrait minimum (GNF)
              </label>
              <input
                type="number"
                value={minCommission}
                onChange={(e) => setMinCommission(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveCommission}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <FiSave className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl space-y-4">
            {[
              {
                label: "Email",
                checked: emailNotifs,
                set: setEmailNotifs,
              },
              { label: "SMS", checked: smsNotifs, set: setSmsNotifs },
              {
                label: "Litiges",
                checked: disputeNotifs,
                set: setDisputeNotifs,
              },
              {
                label: "Nouveaux utilisateurs",
                checked: newUserNotifs,
                set: setNewUserNotifs,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <p className="text-sm font-medium">{row.label}</p>
                <Switch checked={row.checked} onCheckedChange={row.set} />
              </div>
            ))}
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <FiSave className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
