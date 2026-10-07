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

import { useAdminSignalements, useResolveAdminReport } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const { data: raw = [] } = useAdminSignalements();
  const resolveReport = useResolveAdminReport();
  const LIVE_REPORTS: ReportRow[] = raw.map((r: any) => ({
    id: r.id,
    type: r.listingId ? "article" : "user",
    target: r.target || r.listingId || r.userId || "—",
    reason: r.reason,
    status: r.status === "open" ? "open" : "resolved",
  }));
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
        emptyMessage="Aucun signalement"
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
              <div className="flex items-center gap-2">
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
                {r.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={resolveReport.isPending}
                    onClick={() => resolveReport.mutate(r.id)}
                  >
                    Clôturer
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
