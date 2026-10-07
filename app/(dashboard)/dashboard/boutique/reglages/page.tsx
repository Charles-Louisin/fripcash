"use client";

import { useState } from "react";
import { setVacation, updateBundleSettings } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireShop } from "@/components/dashboard/require-role";

function BoutiqueReglagesInner() {
  const { showToast } = useToast();
  const [vacation, setVac] = useState(false);
  const [startsAt, setStarts] = useState("");
  const [endsAt, setEnds] = useState("");
  const [bundleEnabled, setBundle] = useState(false);
  const [bundleMinItems, setMin] = useState(2);
  const [bundleDiscountPercent, setPct] = useState(5);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Réglages boutique</h1>

      <section className="space-y-3 rounded-xl border border-border p-5">
        <h2 className="font-semibold">Mode vacances</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={vacation} onChange={(e) => setVac(e.target.checked)} />
          Pause des ventes
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Début</Label>
            <Input type="date" className="mt-1 rounded-xl" value={startsAt} onChange={(e) => setStarts(e.target.value)} />
          </div>
          <div>
            <Label>Fin</Label>
            <Input type="date" className="mt-1 rounded-xl" value={endsAt} onChange={(e) => setEnds(e.target.value)} />
          </div>
        </div>
        <Button
          className="rounded-full"
          onClick={async () => {
            await setVacation({ enabled: vacation, startsAt, endsAt });
            showToast("Vacances enregistrées", "success");
          }}
        >
          Enregistrer
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border p-5">
        <h2 className="font-semibold">Remise bundle</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={bundleEnabled} onChange={(e) => setBundle(e.target.checked)} />
          Activer
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Min. articles</Label>
            <Input type="number" className="mt-1 rounded-xl" value={bundleMinItems} onChange={(e) => setMin(Number(e.target.value))} />
          </div>
          <div>
            <Label>Remise %</Label>
            <Input type="number" className="mt-1 rounded-xl" value={bundleDiscountPercent} onChange={(e) => setPct(Number(e.target.value))} />
          </div>
        </div>
        <Button
          className="rounded-full"
          onClick={async () => {
            await updateBundleSettings({ bundleEnabled, bundleMinItems, bundleDiscountPercent });
            showToast("Bundle enregistré", "success");
          }}
        >
          Enregistrer
        </Button>
      </section>
    </div>
  );
}

export default function BoutiqueReglagesPage() {
  return (
    <RequireShop>
      <BoutiqueReglagesInner />
    </RequireShop>
  );
}
