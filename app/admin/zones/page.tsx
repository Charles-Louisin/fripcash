"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
  useAdminCatalogZones,
  useAdminZoneMutations,
  useAdminCouriers,
  useUpdateAdminCourier,
} from "@/hooks/use-admin";
import { ApiError } from "@/lib/api";
import { FiPlus, FiMapPin, FiChevronDown, FiChevronUp } from "react-icons/fi";

function slugCode(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

function zoneIdsOf(c: any): string[] {
  const ids = [
    ...(c.zoneIds || []),
    ...(c.courier?.zoneIds || []),
    c.zoneId,
    c.courier?.zoneId,
  ]
    .filter(Boolean)
    .map(String);
  return [...new Set(ids)];
}

export default function AdminZonesPage() {
  const { data: zones = [], isLoading, isError } = useAdminCatalogZones();
  const { data: couriers = [] } = useAdminCouriers();
  const { create, update } = useAdminZoneMutations();
  const patchCourier = useUpdateAdminCourier();
  const { toast } = useToast();
  const [newZone, setNewZone] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const handleToggle = async (id: string, isActive: boolean, name: string) => {
    try {
      await update.mutateAsync({ id, isActive });
      toast(isActive ? `Zone « ${name} » activée` : `Zone « ${name} » désactivée`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Mise à jour impossible",
        "error"
      );
    }
  };

  const couriersInZone = (zoneId: string) =>
    couriers.filter((c: any) => zoneIdsOf(c).includes(zoneId));

  const handleAssign = async (courier: any, zoneId: string, checked: boolean) => {
    const current = zoneIdsOf(courier);
    const zoneIds = checked
      ? current.filter((id) => id !== zoneId)
      : [...current, zoneId];
    try {
      await patchCourier.mutateAsync({ id: courier.id, zoneIds });
      toast("Livreur mis à jour", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Assignation impossible",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Zones de livraison"
        description="Active ou désactive une zone et associe les livreurs."
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((zone) => {
            const assigned = couriersInZone(zone.id);
            const preview = assigned.slice(0, 3);
            const extra = assigned.length - preview.length;
            const open = !!expanded[zone.id];
            return (
              <div
                key={zone.id}
                className="rounded-lg border border-border bg-card p-3 space-y-3"
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
                  <Switch
                    checked={!!zone.isActive}
                    onCheckedChange={(v) => handleToggle(zone.id, v, zone.nameFr)}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Livreurs · {assigned.length}
                  </p>
                  {assigned.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucun livreur associé</p>
                  ) : (
                    <ul className="space-y-1">
                      {(open ? assigned : preview).map((c: any) => (
                        <li key={c.id} className="text-xs truncate">
                          {c.name}
                          {c.phone ? ` · ${c.phone}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  {extra > 0 && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline"
                      onClick={() =>
                        setExpanded((s) => ({ ...s, [zone.id]: !open }))
                      }
                    >
                      {open ? (
                        <>
                          Réduire <FiChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Tout voir ({assigned.length}) <FiChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() =>
                    setExpanded((s) => ({ ...s, [zone.id]: !open }))
                  }
                >
                  {open ? "Masquer l’assignation" : "Assigner des livreurs"}
                </Button>

                {open && (
                  <div className="space-y-2 border-t pt-2">
                    {couriers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Aucun livreur</p>
                    ) : (
                      couriers.map((c: any) => {
                        const id = c.id;
                        const checked = zoneIdsOf(c).includes(zone.id);
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleAssign(c, zone.id, checked)}
                            />
                            <span className="truncate">
                              {c.name} {c.phone ? `· ${c.phone}` : ""}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
