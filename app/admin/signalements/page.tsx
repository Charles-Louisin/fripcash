"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { useToast } from "@/components/ui/toast";

export default function AdminReportsPage() {
  const { reports, updateReportStatus } = useAdminPlatformStore();
  const { toast } = useToast();

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Signalements"
        description={`File d'attente modération — ${openCount} ouvert(s)`}
      />

      <DataTable
        data={reports}
        getRowKey={(r) => r.id}
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
                    ? "warning"
                    : r.status === "reviewed"
                      ? "success"
                      : "secondary"
                }
              >
                {r.status === "open"
                  ? "Ouvert"
                  : r.status === "reviewed"
                    ? "Traité"
                    : "Rejeté"}
              </Badge>
            ),
          },
          { key: "date", header: "Date", render: (r) => r.createdAtLabel },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={r.status !== "open"}
                  onClick={() => {
                    updateReportStatus(r.id, "reviewed");
                    toast("Signalement traité", "success");
                  }}
                >
                  Traiter
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={r.status !== "open"}
                  onClick={() => {
                    updateReportStatus(r.id, "dismissed");
                    toast("Signalement rejeté", "success");
                  }}
                >
                  Rejeter
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
