"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { FiBriefcase, FiClock } from "react-icons/fi";
import { useAdminCatalogZones } from "@/hooks/use-admin";

type PartnerRow = {
  id: string;
  name: string;
  contactEmail?: string;
  sla: string;
  zoneName?: string;
  status: "active" | "pending";
};

const LIVE_PARTNERS: PartnerRow[] = [];

export default function AdminPartnersPage() {
  const { data: zones = [] } = useAdminCatalogZones();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enseignes partenaires"
        description={`${zones.length} zones catalogue · partenariats non exposés par l’API`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Partenaires"
          value={LIVE_PARTNERS.length.toString()}
          change="Total"
          changeType="neutral"
          icon={FiBriefcase}
        />
        <StatCard
          title="En attente"
          value={LIVE_PARTNERS.filter((p) => p.status === "pending")
            .length.toString()}
          change="SLA"
          changeType="neutral"
          icon={FiClock}
        />
      </div>

      <DataTable
        data={LIVE_PARTNERS}
        getRowKey={(p) => p.id}
        emptyMessage="Aucune enseigne partenaire — endpoint admin indisponible"
        columns={[
          {
            key: "name",
            header: "Enseigne",
            render: (p) => (
              <span className="font-medium text-sm">{p.name}</span>
            ),
          },
          {
            key: "email",
            header: "Contact",
            render: (p) => (
              <span className="text-sm text-muted-foreground">
                {p.contactEmail || "—"}
              </span>
            ),
          },
          {
            key: "zone",
            header: "Zone",
            render: (p) => p.zoneName || "—",
          },
          {
            key: "sla",
            header: "SLA",
            render: (p) => p.sla,
          },
          {
            key: "status",
            header: "Statut",
            render: (p) => (
              <Badge variant={p.status === "active" ? "default" : "secondary"}>
                {p.status === "active" ? "Actif" : "En attente"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
