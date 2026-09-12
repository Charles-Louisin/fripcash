"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { formatGnf } from "@/lib/admin-platform";
import { useToast } from "@/components/ui/toast";

export default function AdminWalletsPage() {
  const { wallets, releaseEscrow } = useAdminPlatformStore();
  const { toast } = useToast();

  const totalBalance = wallets.reduce((s, w) => s + w.balanceGnf, 0);
  const totalEscrow = wallets.reduce((s, w) => s + w.escrowGnf, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Porte-monnaies vendeurs"
        description="Soldes, fonds bloqués (escrow) et déblocages"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Solde total vendeurs</p>
          <p className="text-2xl font-bold mt-1">{formatGnf(totalBalance)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Escrow en attente</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {formatGnf(totalEscrow)}
          </p>
        </div>
      </div>

      <DataTable
        data={wallets}
        getRowKey={(w) => w.id}
        columns={[
          {
            key: "seller",
            header: "Vendeur",
            render: (w) => <span className="font-medium">{w.sellerName}</span>,
          },
          {
            key: "balance",
            header: "Solde",
            render: (w) => formatGnf(w.balanceGnf),
          },
          {
            key: "escrow",
            header: "Escrow",
            render: (w) =>
              w.escrowGnf > 0 ? (
                <span className="text-amber-600 font-medium">
                  {formatGnf(w.escrowGnf)}
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "last",
            header: "Dernier déblocage",
            render: (w) => w.lastReleaseLabel,
          },
          {
            key: "action",
            header: "Action",
            render: (w) => (
              <Button
                size="sm"
                variant="outline"
                disabled={w.escrowGnf <= 0}
                onClick={() => {
                  releaseEscrow(w.id);
                  toast(`Escrow débloqué pour ${w.sellerName}`, "success");
                }}
              >
                Débloquer
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
