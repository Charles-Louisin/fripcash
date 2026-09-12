"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { useToast } from "@/components/ui/toast";
import { FiPlus, FiTrash2, FiMapPin } from "react-icons/fi";

export default function AdminZonesPage() {
  const { zones, addZone, removeZone, addQuartier, removeQuartier } =
    useAdminPlatformStore();
  const { toast } = useToast();
  const [newZone, setNewZone] = useState("");
  const [quartierInputs, setQuartierInputs] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Zones de livraison"
        description="Gérez les zones et quartiers de Conakry"
        action={
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              placeholder="Nouvelle zone"
              className="h-9 flex-1 sm:w-44 rounded-lg border border-input px-3 text-sm"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!newZone.trim()) return;
                addZone(newZone.trim());
                setNewZone("");
                toast("Zone ajoutée", "success");
              }}
            >
              <FiPlus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{zone.name}</h3>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {zone.quartiers.length} quartier{zone.quartiers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeZone(zone.id);
                  toast("Zone supprimée", "success");
                }}
                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md shrink-0"
                aria-label={`Supprimer ${zone.name}`}
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2 max-h-16 overflow-y-auto">
              {zone.quartiers.map((q) => (
                <Badge
                  key={q}
                  variant="secondary"
                  className="cursor-pointer text-[10px] px-1.5 py-0 h-5"
                  onClick={() => removeQuartier(zone.id, q)}
                >
                  {q} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={quartierInputs[zone.id] ?? ""}
                onChange={(e) =>
                  setQuartierInputs((prev) => ({
                    ...prev,
                    [zone.id]: e.target.value,
                  }))
                }
                placeholder="Quartier"
                className="h-7 flex-1 min-w-0 rounded-md border border-input px-2 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const q = quartierInputs[zone.id]?.trim();
                  if (!q) return;
                  addQuartier(zone.id, q);
                  setQuartierInputs((prev) => ({ ...prev, [zone.id]: "" }));
                }}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
