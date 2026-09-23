"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

type ReportRow = {
  id: string;
  type: "article" | "user" | "message";
  target: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
};

const LIVE_REPORTS: ReportRow[] = [];

export default function AdminReportsPage() {
  const openCount = LIVE_REPORTS.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Signalements"
        description={`File de modération — ${openCount} ouvert(s)`}
      />

      <DataTable
        data={LIVE_REPORTS}
        getRowKey={(r) => r.id}
        emptyMessage="Aucun signalement — endpoint admin non disponible"
        columns={[
          {
            key: "type",
            header: "Type",
            render: (r) => (
              <Badge variant="outline">
                {r.type === "article"
                  ? "Article"
                  : r.type === "user"
                    ? "Utilisateur"
                    : "Message"}
              </Badge>
            ),
          },
          { key: "target", header: "Cible", render: (r) => r.target },
          { key: "reason", header: "Motif", render: (r) => r.reason },
          {
            key: "status",
            header: "Statut",
            render: (r) => (
              <Badge
                variant={
                  r.status === "open"
                    ? "destructive"
                    : r.status === "resolved"
                      ? "default"
                      : "secondary"
                }
              >
                {r.status}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
