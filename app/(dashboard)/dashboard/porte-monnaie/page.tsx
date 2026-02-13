"use client";

import { useState } from "react";
import { FiArrowDownCircle, FiArrowUpCircle, FiRefreshCw, FiGift, FiCreditCard } from "react-icons/fi";
import { mockCurrentUser, mockUserTransactions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sale: { label: "Vente", icon: FiArrowDownCircle, color: "text-green-600 bg-green-100" },
  withdrawal: { label: "Retrait", icon: FiArrowUpCircle, color: "text-red-600 bg-red-100" },
  refund: { label: "Remboursement", icon: FiRefreshCw, color: "text-blue-600 bg-blue-100" },
  bonus: { label: "Bonus", icon: FiGift, color: "text-amber-600 bg-amber-100" },
};

const filterOptions = [
  { id: "all", label: "Toutes" },
  { id: "sale", label: "Ventes" },
  { id: "withdrawal", label: "Retraits" },
  { id: "refund", label: "Remboursements" },
  { id: "bonus", label: "Bonus" },
];

export default function WalletPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState(mockCurrentUser.phone);

  const filtered = filter === "all"
    ? mockUserTransactions
    : mockUserTransactions.filter((t) => t.type === filter);

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      showToast("Veuillez entrer un montant valide", "error");
      return;
    }
    if (amount > mockCurrentUser.walletBalance) {
      showToast("Solde insuffisant", "error");
      return;
    }
    showToast(`Retrait de ${amount.toLocaleString("fr-FR")} FCFA initié`, "success");
    setShowWithdraw(false);
    setWithdrawAmount("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Porte-monnaie</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez votre solde et vos transactions</p>
      </div>

      {/* Balance Card */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Solde disponible</p>
            <p className="text-4xl font-bold text-foreground">
              {mockCurrentUser.walletBalance.toLocaleString("fr-FR")}{" "}
              <span className="text-lg font-medium text-muted-foreground">FCFA</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <FiCreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWithdraw(true)}
          className="mt-4 h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retirer des fonds
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Historique des transactions</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx) => {
              const config = typeConfig[tx.type];
              const TxIcon = config?.icon || FiRefreshCw;
              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config?.color || "bg-muted text-muted-foreground"}`}>
                    <TxIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <Badge
                        variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        {tx.status === "completed" ? "Terminé" : tx.status === "pending" ? "En cours" : "Échoué"}
                      </Badge>
                    </div>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString("fr-FR")} F
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw Dialog */}
      {showWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWithdraw(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">Retirer des fonds</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Solde disponible : <span className="font-semibold text-foreground">{mockCurrentUser.walletBalance.toLocaleString("fr-FR")} FCFA</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Montant (FCFA)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Numéro Mobile Money</label>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">Annuler</button>
                <button type="button" onClick={handleWithdraw} className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Retirer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
