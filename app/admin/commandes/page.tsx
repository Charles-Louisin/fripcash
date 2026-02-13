"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { mockOrders, type MockOrder } from "@/lib/mock-data";
import { FiSearch, FiEye } from "react-icons/fi";

const statusConfig: Record<MockOrder["status"], { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  pending: { label: "En attente", variant: "warning" },
  paid: { label: "Payé", variant: "default" },
  shipped: { label: "Expédié", variant: "secondary" },
  delivered: { label: "Livré", variant: "success" },
  disputed: { label: "En litige", variant: "destructive" },
  refunded: { label: "Remboursé", variant: "outline" },
};

export default function CommandesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer.toLowerCase().includes(search.toLowerCase()) ||
        o.seller.toLowerCase().includes(search.toLowerCase()) ||
        o.article.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalAmount = filtered.reduce((sum, o) => sum + o.amount, 0);
  const totalCommission = filtered.reduce((sum, o) => sum + o.commission, 0);

  const columns = [
    {
      key: "id",
      header: "N° Commande",
      render: (o: MockOrder) => <span className="font-mono font-medium text-foreground text-xs">{o.id}</span>,
    },
    {
      key: "article",
      header: "Article",
      render: (o: MockOrder) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate max-w-[160px]">{o.article}</p>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Acheteur",
      className: "hidden md:table-cell",
      render: (o: MockOrder) => <span className="text-muted-foreground">{o.buyer}</span>,
    },
    {
      key: "seller",
      header: "Vendeur",
      className: "hidden md:table-cell",
      render: (o: MockOrder) => <span className="text-muted-foreground">{o.seller}</span>,
    },
    {
      key: "amount",
      header: "Montant",
      render: (o: MockOrder) => (
        <span className="font-medium text-foreground">{o.amount.toLocaleString("fr-FR")} F</span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      className: "hidden lg:table-cell",
      render: (o: MockOrder) => (
        <span className="text-primary font-medium">{o.commission.toLocaleString("fr-FR")} F</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (o: MockOrder) => {
        const config = statusConfig[o.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (o: MockOrder) => (
        <span className="text-muted-foreground text-xs">
          {new Date(o.date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (o: MockOrder) => (
        <button
          onClick={() => setSelectedOrder(o)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <FiEye className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivi des transactions sur la plateforme</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Commandes</p>
          <p className="text-xl font-bold text-foreground mt-1">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Volume total</p>
          <p className="text-xl font-bold text-foreground mt-1">{totalAmount.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Commissions totales</p>
          <p className="text-xl font-bold text-primary mt-1">{totalCommission.toLocaleString("fr-FR")} F</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par ID, acheteur, vendeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payé</option>
          <option value="shipped">Expédié</option>
          <option value="delivered">Livré</option>
          <option value="disputed">En litige</option>
          <option value="refunded">Remboursé</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} emptyMessage="Aucune commande trouvée" />

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{selectedOrder.id}</h2>
              <Badge variant={statusConfig[selectedOrder.status].variant}>
                {statusConfig[selectedOrder.status].label}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Article</span>
                <span className="font-medium text-foreground">{selectedOrder.article}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Acheteur</span>
                <span className="font-medium">{selectedOrder.buyer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{selectedOrder.seller}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Montant article</span>
                <span className="font-medium">{selectedOrder.amount.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Frais de port</span>
                <span className="font-medium">{selectedOrder.shippingCost.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Commission FripCash</span>
                <span className="font-bold text-primary">{selectedOrder.commission.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Total payé par l&apos;acheteur</span>
                <span className="font-bold text-foreground">
                  {(selectedOrder.amount + selectedOrder.shippingCost).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Reçu par le vendeur</span>
                <span className="font-medium">
                  {(selectedOrder.amount - selectedOrder.commission).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(selectedOrder.date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
