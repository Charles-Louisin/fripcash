"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { FiTruck, FiUserCheck, FiUsers } from "react-icons/fi";

type CourierRow = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  zoneName?: string;
  vehicleType?: string;
};

/** No admin courier list API — empty live shell. */
const LIVE_COURIERS: CourierRow[] = [];

export default function AdminCouriersPage() {
  const couriers = LIVE_COURIERS;
  const activeCount = couriers.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Livreurs"
        description="Gestion des livreurs — liste admin non exposée par l’API"
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
          title="Actifs"
          value={activeCount.toString()}
          change="Disponibles"
          changeType="positive"
          icon={FiUserCheck}
        />
        <StatCard
          title="Missions bloquées"
          value="0"
          change="Aucune donnée"
          changeType="neutral"
          icon={FiTruck}
        />
      </div>

      <DataTable
        data={couriers}
        getRowKey={(c) => c.id}
        emptyMessage="Aucun livreur — endpoint admin livreurs indisponible"
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
                {c.zoneName || "—"}
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
            key: "status",
            header: "Statut",
            render: (c) => (
              <Badge variant={c.active ? "default" : "secondary"}>
                {c.active ? "Actif" : "Inactif"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
