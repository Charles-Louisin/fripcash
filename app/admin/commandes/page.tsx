"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { useAdminOrders } from "@/hooks/use-admin";
import {
  fulfillmentModeLabels,
  normalizeOrderStatus,
  orderStatusLabels,
  type FulfillmentMode,
  type OrderStatus,
} from "@/lib/seller-domain";
import { FiSearch, FiEye } from "react-icons/fi";

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  ordered: "warning",
  paid: "default",
  sellerNotified: "secondary",
  preparing: "secondary",
  readyForPickup: "warning",
  courierAssigned: "secondary",
  collected: "secondary",
  inTransit: "default",
  delivered: "success",
  fundsReleased: "success",
  feedbackPending: "outline",
  disputed: "destructive",
  refunded: "outline",
};

export default function CommandesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { data, isLoading, isError } = useAdminOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const orders = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o: any) => {
      if (!q) return true;
      return (
        String(o._id || o.id || "").toLowerCase().includes(q) ||
        String(o.article?.title || "").toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  const totalAmount = filtered.reduce(
    (sum: number, o: any) => sum + (o.amount || 0),
    0
  );
  const totalCommission = filtered.reduce(
    (sum: number, o: any) => sum + (o.commission || 0),
    0
  );

  const getArticleTitle = (o: any) =>
    typeof o.article === "object" ? o.article.title : "Article";
  const getBuyer = (o: any) =>
    typeof o.buyer === "object" ? o.buyer.pseudo : "Acheteur";
  const getSeller = (o: any) =>
    typeof o.seller === "object" ? o.seller.pseudo : "Vendeur";

  const resolveStatus = (raw: string): OrderStatus => normalizeOrderStatus(raw);

  const columns = [
    {
      key: "id",
      header: "N° Commande",
      render: (o: any) => (
        <span className="font-mono font-medium text-foreground text-xs">
          #{o._id?.slice(-6)}
        </span>
      ),
    },
    {
      key: "article",
      header: "Article",
      render: (o: any) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate max-w-[160px]">
            {getArticleTitle(o)}
          </p>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Acheteur",
      className: "hidden md:table-cell",
      render: (o: any) => (
        <span className="text-muted-foreground">{getBuyer(o)}</span>
      ),
    },
    {
      key: "seller",
      header: "Vendeur",
      className: "hidden md:table-cell",
      render: (o: any) => (
        <span className="text-muted-foreground">{getSeller(o)}</span>
      ),
    },
    {
      key: "fulfillment",
      header: "Livraison",
      className: "hidden lg:table-cell",
      render: (o: any) => {
        const mode = (o.fulfillmentMode as FulfillmentMode) || "courier";
        return (
          <span className="text-xs text-muted-foreground">
            {fulfillmentModeLabels[mode] ?? mode}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Montant",
      render: (o: any) => (
        <span className="font-medium text-foreground">
          {(o.amount || 0).toLocaleString("fr-FR")} F
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      className: "hidden lg:table-cell",
      render: (o: any) => (
        <span className="font-medium text-foreground">
          {(o.commission || 0).toLocaleString("fr-FR")} F
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (o: any) => {
        const status = resolveStatus(o.status);
        return (
          <Badge variant={statusVariant[status]}>
            {orderStatusLabels[status]}
          </Badge>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (o: any) => (
        <span className="text-muted-foreground text-xs">
          {new Date(o.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (o: any) => (
        <button
          onClick={() => setSelectedOrder(o)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <FiEye className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
    },
  ];

  if (isLoading && !isError && filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pipeline aligné avec l&apos;app — livreur, retrait boutique, livraison
          locale
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-500 mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          {data?.unavailableReason ||
            "Liste vide : GET /admin/orders n’existe pas encore (seed ~20 commandes)."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Commandes</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Volume total</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {totalAmount.toLocaleString("fr-FR")} F
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Commissions totales</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {totalCommission.toLocaleString("fr-FR")} F
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
          <option value="ordered">Commandée</option>
          <option value="paid">Payée</option>
          <option value="preparing">En préparation</option>
          <option value="readyForPickup">Prête à récupérer</option>
          <option value="inTransit">En transit</option>
          <option value="delivered">Livrée</option>
          <option value="fundsReleased">Fonds libérés</option>
          <option value="disputed">En litige</option>
          <option value="refunded">Remboursée</option>
        </select>
        <select
          value={fulfillmentFilter}
          onChange={(e) => setFulfillmentFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tous modes livraison</option>
          <option value="courier">Livreur FripCash</option>
          <option value="pickup">Retrait boutique</option>
          <option value="shopLocalDelivery">Livraison locale</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="Aucune commande trouvée"
      />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                #{selectedOrder._id?.slice(-6)}
              </h2>
              <Badge
                variant={
                  statusVariant[resolveStatus(selectedOrder.status)] ||
                  "secondary"
                }
              >
                {orderStatusLabels[resolveStatus(selectedOrder.status)]}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Article</span>
                <span className="font-medium text-foreground">
                  {getArticleTitle(selectedOrder)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Acheteur</span>
                <span className="font-medium">{getBuyer(selectedOrder)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{getSeller(selectedOrder)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Mode livraison</span>
                <span className="font-medium">
                  {fulfillmentModeLabels[
                    (selectedOrder.fulfillmentMode as FulfillmentMode) ||
                      "courier"
                  ]}
                </span>
              </div>
              {selectedOrder.pickupCode && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Code retrait</span>
                  <span className="font-mono font-medium">
                    {selectedOrder.pickupCode}
                  </span>
                </div>
              )}
              {selectedOrder.courierName && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Livreur</span>
                  <span className="font-medium">{selectedOrder.courierName}</span>
                </div>
              )}
              {selectedOrder.buyerAddress && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {selectedOrder.buyerAddress}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span className="font-medium">
                  {(selectedOrder.deliveryFeeGnf ?? selectedOrder.shippingCost ?? 0).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  F
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-medium">
                  {(selectedOrder.amount || 0).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Commission FripCash</span>
                <span className="font-bold text-foreground">
                  {(selectedOrder.commission || 0).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
