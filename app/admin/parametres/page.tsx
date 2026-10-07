"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { FiSave } from "react-icons/fi";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/hooks/use-admin";

export default function ParametresPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  const [platformName, setPlatformName] = useState("FripCash");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  /** Percent UI (8 = 8%); API stores decimals 0..1 */
  const [commissionRateStandardPct, setCommissionRateStandardPct] =
    useState(8);
  const [commissionRateProximitePct, setCommissionRateProximitePct] =
    useState(5);
  const [minWithdrawal, setMinWithdrawal] = useState(10000);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [disputeNotifs, setDisputeNotifs] = useState(true);
  const [newUserNotifs, setNewUserNotifs] = useState(false);

  useEffect(() => {
    if (!settings || typeof settings !== "object") return;
    const s = settings as Record<string, unknown>;
    if (typeof s.commissionRateStandard === "number") {
      setCommissionRateStandardPct(
        Math.round(s.commissionRateStandard * 10000) / 100
      );
    } else if (typeof s.defaultCommissionBps === "number") {
      setCommissionRateStandardPct(s.defaultCommissionBps / 100);
    }
    if (typeof s.commissionRateProximite === "number") {
      setCommissionRateProximitePct(
        Math.round(s.commissionRateProximite * 10000) / 100
      );
    }
    if (typeof s.minWithdrawalGnf === "number") {
      setMinWithdrawal(s.minWithdrawalGnf);
    }
    if (typeof s.maintenanceMode === "boolean") {
      setMaintenanceMode(s.maintenanceMode);
    }
    if (typeof s.platformName === "string") setPlatformName(s.platformName);
    if (typeof s.contactEmail === "string") setContactEmail(s.contactEmail);
    if (typeof s.contactPhone === "string") setContactPhone(s.contactPhone);
    if (typeof s.notifyEmail === "boolean") setEmailNotifs(s.notifyEmail);
    if (typeof s.notifySms === "boolean") setSmsNotifs(s.notifySms);
    if (typeof s.notifyDisputes === "boolean") setDisputeNotifs(s.notifyDisputes);
    if (typeof s.notifyNewUsers === "boolean") setNewUserNotifs(s.notifyNewUsers);
  }, [settings]);

  const handleSaveGeneral = () => {
    updateSettings.mutate(
      {
        maintenanceMode,
        platformName,
        contactEmail,
        contactPhone,
      },
      {
        onSuccess: () => toast("Paramètres généraux enregistrés", "success"),
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Erreur lors de l’enregistrement";
          toast(msg, "error");
        },
      }
    );
  };

  const handleSaveCommission = () => {
    const standard = commissionRateStandardPct / 100;
    const proximite = commissionRateProximitePct / 100;
    if (standard < 0 || standard > 1 || proximite < 0 || proximite > 1) {
      toast("Les taux doivent être entre 0 et 100 %", "error");
      return;
    }
    updateSettings.mutate(
      {
        commissionRateStandard: standard,
        commissionRateProximite: proximite,
        minWithdrawalGnf: minWithdrawal,
      },
      {
        onSuccess: () =>
          toast(
            "Commissions enregistrées — appliquées aux nouvelles annonces / prix modifiés",
            "success"
          ),
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Erreur lors de l’enregistrement";
          toast(msg, "error");
        },
      }
    );
  };

  const handleSaveNotifications = () => {
    updateSettings.mutate(
      {
        notifyEmail: emailNotifs,
        notifySms: smsNotifs,
        notifyDisputes: disputeNotifs,
        notifyNewUsers: newUserNotifs,
      },
      {
        onSuccess: () => toast("Notifications enregistrées", "success"),
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Erreur lors de l’enregistrement";
          toast(msg, "error");
        },
      }
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
          Configuration plateforme (GET/PATCH /admin/platform-settings)
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
                disabled={updateSettings.isPending}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                <FiSave className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commission">
          <div className="rounded-xl border border-border bg-card p-6 mt-4 max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground">
              Les nouveaux taux s’appliquent aux{" "}
              <span className="font-medium text-foreground">
                nouvelles annonces
              </span>{" "}
              et aux annonces dont le prix net est modifié. Les listings
              existants gardent leur commission snapshotée.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Commission standard (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionRateStandardPct}
                onChange={(e) =>
                  setCommissionRateStandardPct(Number(e.target.value))
                }
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Particulier / boutique / enseigne — API:{" "}
                {(commissionRateStandardPct / 100).toFixed(4)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Commission proximité (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionRateProximitePct}
                onChange={(e) =>
                  setCommissionRateProximitePct(Number(e.target.value))
                }
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                API: {(commissionRateProximitePct / 100).toFixed(4)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Retrait minimum (GNF)
              </label>
              <input
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveCommission}
              disabled={updateSettings.isPending}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
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
