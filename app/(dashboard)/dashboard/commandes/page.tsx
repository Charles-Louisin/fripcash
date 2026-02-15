"use client";

import { useState } from "react";
import { mockUserOrders, type UserOrder, type OrderStatus, type DeliveryMode } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiLock,
  FiUnlock,
  FiShield,
  FiCopy,
} from "react-icons/fi";
import { LuHandshake } from "react-icons/lu";

const orderTabs = [
  { id: "all", label: "Toutes" },
  { id: "purchase", label: "Mes achats" },
  { id: "sale", label: "Mes ventes" },
];

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
  pending: { label: "En attente", variant: "secondary", icon: FiClock },
  paid_escrow: { label: "Payé (séquestre)", variant: "default", icon: FiLock },
  in_delivery: { label: "En livraison", variant: "default", icon: FiTruck },
  awaiting_confirmation: { label: "En attente de confirmation", variant: "default", icon: FiShield },
  delivered: { label: "Livré", variant: "default", icon: FiCheckCircle },
  disputed: { label: "En litige", variant: "destructive", icon: FiAlertTriangle },
  refunded: { label: "Remboursé", variant: "secondary", icon: FiPackage },
};

const deliveryModeLabels: Record<DeliveryMode, { label: string; icon: React.ElementType }> = {
  "main-propre": { label: "Main propre", icon: LuHandshake },
  "buyer-delivery": { label: "Livraison (acheteur)", icon: FiTruck },
  "seller-delivery": { label: "Livraison (vendeur)", icon: FiPackage },
};

const statusFilters: OrderStatus[] = ["pending", "paid_escrow", "in_delivery", "awaiting_confirmation", "delivered", "disputed"];

export default function MyOrdersPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>(mockUserOrders);

  // Buyer confirmation code input
  const [confirmCode, setConfirmCode] = useState(["", "", "", "", "", ""]);

  const filtered = orders
    .filter((o) => activeTab === "all" || o.type === activeTab)
    .filter((o) => statusFilter === "all" || o.status === statusFilter);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...confirmCode];
    newCode[index] = value;
    setConfirmCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById(`confirm-code-${index + 1}`);
      next?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !confirmCode[index] && index > 0) {
      const prev = document.getElementById(`confirm-code-${index - 1}`);
      prev?.focus();
    }
  };

  const handleConfirmReception = (order: UserOrder) => {
    const enteredCode = confirmCode.join("");
    if (enteredCode.length !== 6) {
      showToast("Saisis le code complet à 6 chiffres.", "error");
      return;
    }
    if (enteredCode === order.confirmationCode) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "delivered" as OrderStatus, escrowStatus: "released" as const } : o
        )
      );
      setSelectedOrder({ ...order, status: "delivered", escrowStatus: "released" });
      setConfirmCode(["", "", "", "", "", ""]);
      showToast("Réception confirmée ! Le paiement a été libéré vers le vendeur.", "success");
    } else {
      showToast("Code incorrect. Vérifie auprès du vendeur ou livreur.", "error");
    }
  };

  const handleMarkShipped = (order: UserOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: "in_delivery" as OrderStatus } : o
      )
    );
    setSelectedOrder({ ...order, status: "in_delivery" });
    showToast("Commande marquée comme expédiée.", "success");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Code copié !", "info");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivez vos achats et ventes — le paiement est sécurisé par séquestre</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {orderTabs.map((tab) => {
          const count = tab.id === "all" ? orders.length : orders.filter((o) => o.type === tab.id).length;
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
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Tous
        </button>
        {statusFilters.map((s) => (
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
            {statusConfig[s]?.label || s}
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
            const deliveryInfo = deliveryModeLabels[order.deliveryMode];
            const DeliveryIcon = deliveryInfo?.icon || FiPackage;
            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedOrder(order);
                  setConfirmCode(["", "", "", "", "", ""]);
                }}
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{order.amount.toLocaleString("fr-FR")} GNF</p>
                        {/* Escrow indicator */}
                        {order.escrowStatus === "blocked" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <FiLock className="h-2.5 w-2.5" /> Séquestre
                          </span>
                        )}
                        {order.escrowStatus === "released" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            <FiUnlock className="h-2.5 w-2.5" /> Libéré
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <DeliveryIcon className="h-3 w-3" />
                          {deliveryInfo?.label}
                        </span>
                        <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Order Detail Dialog ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-xl border border-border shadow-lg max-h-[90vh] overflow-y-auto">
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

              {/* Order details */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-medium">{selectedOrder.amount.toLocaleString("fr-FR")} GNF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span className="font-medium">{selectedOrder.shippingCost.toLocaleString("fr-FR")} GNF</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">{(selectedOrder.amount + selectedOrder.shippingCost).toLocaleString("fr-FR")} GNF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode de livraison</span>
                  <span className="font-medium flex items-center gap-1">
                    {(() => {
                      const dInfo = deliveryModeLabels[selectedOrder.deliveryMode];
                      const DIcon = dInfo.icon;
                      return (<><DIcon className="h-3.5 w-3.5 text-primary" /> {dInfo.label}</>);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paiement</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    selectedOrder.escrowStatus === "blocked" ? "text-amber-600" : "text-green-600"
                  }`}>
                    {selectedOrder.escrowStatus === "blocked" ? (
                      <><FiLock className="h-3 w-3" /> Bloqué en séquestre</>
                    ) : (
                      <><FiUnlock className="h-3 w-3" /> Paiement libéré</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selectedOrder.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>

              {/* ─── SELLER: Show confirmation code ─── */}
              {selectedOrder.type === "sale" && selectedOrder.escrowStatus === "blocked" && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FiShield className="h-4 w-4 text-primary" />
                    Code de confirmation
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Donne ce code à l&apos;acheteur ou au livreur lors de la remise de l&apos;article.
                    L&apos;acheteur saisira ce code pour confirmer la réception et libérer ton paiement.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {selectedOrder.confirmationCode.split("").map((digit, i) => (
                        <div
                          key={i}
                          className="h-12 w-10 rounded-lg bg-background border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(selectedOrder.confirmationCode)}
                      className="h-10 w-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Copier le code"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mark as shipped button */}
                  {selectedOrder.status === "paid_escrow" && (
                    <button
                      type="button"
                      onClick={() => handleMarkShipped(selectedOrder)}
                      className="mt-4 w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiTruck className="h-4 w-4" />
                      Marquer comme expédié
                    </button>
                  )}

                </div>
              )}

              {/* ─── BUYER: Code input to confirm reception ─── */}
              {selectedOrder.type === "purchase" && selectedOrder.escrowStatus === "blocked" &&
                (selectedOrder.status === "in_delivery" || selectedOrder.status === "awaiting_confirmation" || selectedOrder.status === "paid_escrow") && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FiLock className="h-4 w-4 text-amber-600" />
                    Confirmer la réception
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Saisis le code à 6 chiffres fourni par le vendeur ou le livreur
                    pour confirmer que tu as bien reçu l&apos;article et libérer le paiement.
                  </p>

                  {/* 6-digit code input */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {confirmCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`confirm-code-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        className="h-12 w-10 rounded-lg border-2 border-amber-300 bg-white text-center text-lg font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConfirmReception(selectedOrder)}
                    className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="h-4 w-4" />
                    Confirmer la réception
                  </button>

                  <p className="text-[10px] text-amber-700 mt-2 flex items-center gap-1">
                    <FiShield className="h-3 w-3 shrink-0" />
                    Ce code ne fonctionne que depuis ton compte. Ne le partage pas.
                  </p>
                </div>
              )}

              {/* ─── Delivered: Payment released ─── */}
              {selectedOrder.status === "delivered" && selectedOrder.escrowStatus === "released" && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <FiCheckCircle className="h-4 w-4" />
                    {selectedOrder.type === "sale"
                      ? "Livraison confirmée — paiement reçu"
                      : "Réception confirmée — paiement libéré"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    La transaction est terminée avec succès.
                  </p>
                </div>
              )}

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
