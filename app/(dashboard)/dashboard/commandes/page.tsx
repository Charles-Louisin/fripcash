"use client";

import { useState } from "react";
import { mockUserOrders, type UserOrder } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { FiPackage, FiTruck, FiCheckCircle, FiAlertTriangle, FiClock } from "react-icons/fi";

const orderTabs = [
  { id: "all", label: "Toutes" },
  { id: "purchase", label: "Mes achats" },
  { id: "sale", label: "Mes ventes" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
  pending: { label: "En attente", variant: "secondary", icon: FiClock },
  paid: { label: "Payé", variant: "default", icon: FiCheckCircle },
  shipped: { label: "Expédié", variant: "default", icon: FiTruck },
  delivered: { label: "Livré", variant: "default", icon: FiCheckCircle },
  disputed: { label: "En litige", variant: "destructive", icon: FiAlertTriangle },
  refunded: { label: "Remboursé", variant: "secondary", icon: FiPackage },
};

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  const filtered = mockUserOrders
    .filter((o) => activeTab === "all" || o.type === activeTab)
    .filter((o) => statusFilter === "all" || o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivez vos achats et ventes</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {orderTabs.map((tab) => {
          const count = tab.id === "all" ? mockUserOrders.length : mockUserOrders.filter((o) => o.type === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Statut :</span>
        {["all", "pending", "paid", "shipped", "delivered", "disputed"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {s === "all" ? "Tous" : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config?.icon || FiPackage;
            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={order.articleImage} alt={order.article} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.article}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.type === "purchase" ? "Acheté à" : "Vendu à"}{" "}
                          <span className="font-medium text-foreground">{order.otherParty}</span>
                        </p>
                      </div>
                      <Badge
                        variant={config?.variant || "secondary"}
                        className="shrink-0 text-[10px]"
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config?.label || order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-foreground">{order.amount.toLocaleString("fr-FR")} FCFA</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-xl border border-border shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Commande {selectedOrder.id}</h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedOrder.articleImage} alt={selectedOrder.article} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedOrder.article}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.type === "purchase" ? "Vendu par" : "Acheté par"} {selectedOrder.otherParty}
                  </p>
                  <Badge variant={statusConfig[selectedOrder.status]?.variant || "secondary"} className="mt-1 text-[10px]">
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-medium">{selectedOrder.amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span className="font-medium">{selectedOrder.shippingCost.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">{(selectedOrder.amount + selectedOrder.shippingCost).toLocaleString("fr-FR")} FCFA</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">N° de suivi</span>
                    <span className="font-mono text-xs">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selectedOrder.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-6 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
