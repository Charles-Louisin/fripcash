"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  useAdminCatalogZones,
  useAdminCouriers,
  useUpdateAdminCourier,
} from "@/hooks/use-admin";
import { ApiError } from "@/lib/api";
import { FiTruck, FiUserCheck, FiUsers } from "react-icons/fi";

type CourierRow = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  zoneId?: string | null;
  zoneIds?: string[];
  zoneName?: string;
  zoneNames?: string[];
  vehicleType?: string;
  deliveredCount: number;
  activeMissions: number;
  blockedMissions: number;
};

export default function AdminCouriersPage() {
  const { data: raw = [] } = useAdminCouriers();
  const { data: zones = [] } = useAdminCatalogZones();
  const patchCourier = useUpdateAdminCourier();
  const { toast } = useToast();
  const [selected, setSelected] = useState<CourierRow | null>(null);
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);

  const couriers: CourierRow[] = raw.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phoneNumber || c.phone || "",
    active: !!c.isAvailable,
    zoneId: c.zoneId || c.courier?.zoneId || null,
    zoneIds: c.zoneIds || c.courier?.zoneIds || (c.zoneId ? [c.zoneId] : []),
    zoneName: c.zoneName,
    zoneNames: c.zoneNames,
    vehicleType: c.vehicleType || c.courier?.vehicle,
    deliveredCount: c.deliveredCount || 0,
    activeMissions: c.activeMissions || 0,
    blockedMissions: c.blockedMissions || 0,
  }));
  const availableCount = couriers.filter((c) => c.active).length;
  const blocked = couriers.reduce((s, c) => s + c.blockedMissions, 0);
  const activeZones = useMemo(
    () => zones.filter((z) => z.isActive !== false),
    [zones]
  );

  const openDetail = (c: CourierRow) => {
    setSelected(c);
    setZoneIds(c.zoneIds?.length ? c.zoneIds : c.zoneId ? [c.zoneId] : []);
    setAvailable(c.active);
  };

  const save = async () => {
    if (!selected) return;
    try {
      await patchCourier.mutateAsync({
        id: selected.id,
        zoneIds,
        isAvailable: available,
      });
      toast("Livreur mis à jour", "success");
      setSelected(null);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Mise à jour impossible",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Livreurs"
        description={`${raw.length} compte(s) livreur`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Livreurs"
          value={couriers.length.toString()}
          change="Total enregistré"
          changeType="neutral"
          icon={FiUsers}
        />
        <StatCard
          title="Disponibles"
          value={availableCount.toString()}
          change="En ligne maintenant"
          changeType="positive"
          icon={FiUserCheck}
        />
        <StatCard
          title="Missions bloquées"
          value={String(blocked)}
          change="Litiges en cours"
          changeType="neutral"
          icon={FiTruck}
        />
      </div>

      <DataTable
        data={couriers}
        getRowKey={(c) => c.id}
        emptyMessage="Aucun livreur"
        onRowClick={openDetail}
        columns={[
          {
            key: "name",
            header: "Livreur",
            render: (c) => (
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone}</p>
              </div>
            ),
          },
          {
            key: "zone",
            header: "Zone",
            render: (c) => (
              <span className="text-sm text-muted-foreground">
                {(c.zoneNames && c.zoneNames.length
                  ? c.zoneNames
                  : c.zoneName
                    ? [c.zoneName]
                    : []
                ).join(", ") || "—"}
              </span>
            ),
          },
          {
            key: "vehicle",
            header: "Véhicule",
            render: (c) => (
              <span className="text-sm">{c.vehicleType || "—"}</span>
            ),
          },
          {
            key: "missions",
            header: "Courses",
            render: (c) => (
              <span className="text-sm">
                {c.activeMissions} en cours · {c.deliveredCount} livrées
              </span>
            ),
          },
          {
            key: "status",
            header: "Statut",
            render: (c) => (
              <Badge variant={c.active ? "default" : "secondary"}>
                {c.active ? "Disponible" : "Indisponible"}
              </Badge>
            ),
          },
        ]}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected?.phone}</p>
            <div>
              <Label>Zones</Label>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-input p-2">
                {activeZones.map((z) => {
                  const checked = zoneIds.includes(z.id);
                  return (
                    <label key={z.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setZoneIds((prev) =>
                            checked ? prev.filter((id) => id !== z.id) : [...prev, z.id]
                          )
                        }
                      />
                      {z.nameFr}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Statut</Label>
              <select
                value={available ? "available" : "unavailable"}
                onChange={(e) => setAvailable(e.target.value === "available")}
                className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="available">Disponible</option>
                <option value="unavailable">Indisponible</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Annuler
            </Button>
            <Button onClick={save} disabled={patchCourier.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
