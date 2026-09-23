"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { FiPlus, FiTrash2, FiMapPin } from "react-icons/fi";
import {
  useAdminCatalogZones,
  useAdminZoneMutations,
} from "@/hooks/use-admin";
import { ApiError } from "@/lib/api";

function slugCode(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

export default function AdminZonesPage() {
  const { data: zones = [], isLoading, isError } = useAdminCatalogZones();
  const { create, remove } = useAdminZoneMutations();
  const { toast } = useToast();
  const [newZone, setNewZone] = useState("");

  const sorted = useMemo(
    () => [...zones].sort((a, b) => a.nameFr.localeCompare(b.nameFr, "fr")),
    [zones]
  );

  const handleAdd = async () => {
    const name = newZone.trim();
    if (!name) return;
    const code = slugCode(name) || `ZONE-${Date.now()}`;
    try {
      await create.mutateAsync({
        code,
        nameFr: name,
        nameEn: name,
        isActive: true,
      });
      setNewZone("");
      toast("Zone ajoutée", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Impossible d’ajouter",
        "error"
      );
    }
  };

  const handleRemove = async (id: string, name: string) => {
    try {
      await remove.mutateAsync(id);
      toast(`Zone « ${name} » désactivée`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Suppression impossible",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Zones de livraison"
        description="Zones catalogue (GET/POST /catalog/zones)"
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
              disabled={create.isPending || !newZone.trim()}
              onClick={handleAdd}
            >
              <FiPlus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Impossible de charger les zones
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Aucune zone en base
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sorted.map((zone) => (
            <div
              key={zone.id}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm truncate">
                      {zone.nameFr}
                    </h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {zone.code}
                  </p>
                  <Badge
                    variant={zone.isActive ? "secondary" : "outline"}
                    className="mt-2 text-[10px]"
                  >
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(zone.id, zone.nameFr)}
                  disabled={remove.isPending}
                  className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md shrink-0"
                  aria-label={`Supprimer ${zone.nameFr}`}
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
