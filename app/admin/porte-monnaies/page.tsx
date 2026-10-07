"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { formatGnf } from "@/lib/admin-platform";
import { useAdminWallets } from "@/hooks/use-admin";

export default function AdminWalletsPage() {
  const { data: rows = [] } = useAdminWallets();
  const LIVE_WALLETS = rows.map((w: any) => ({
    id: w.id,
    sellerName: w.user?.name || w.userId,
    balanceGnf: w.availableGnf || 0,
    escrowGnf: w.reservedGnf || 0,
  }));
  const totalBalance = LIVE_WALLETS.reduce((s, w) => s + w.balanceGnf, 0);
  const totalEscrow = LIVE_WALLETS.reduce((s, w) => s + w.escrowGnf, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Porte-monnaies vendeurs"
        description="Soldes disponibles et fonds encore en séquestre"
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
        data={LIVE_WALLETS}
        getRowKey={(w) => w.id}
        emptyMessage="Aucun porte-monnaie"
        columns={[
          {
            key: "seller",
            header: "Vendeur",
            render: (w) => (
              <span className="font-medium text-sm">{w.sellerName}</span>
            ),
          },
          {
            key: "balance",
            header: "Solde",
            render: (w) => formatGnf(w.balanceGnf),
          },
          {
            key: "escrow",
            header: "Escrow",
            render: (w) => (
              <span className="text-amber-600">{formatGnf(w.escrowGnf)}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
