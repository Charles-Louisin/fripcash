"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { mockDisputes, type MockDispute } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import {
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiRotateCcw,
} from "react-icons/fi";

const statusConfig: Record<MockDispute["status"], { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  open: { label: "Ouvert", variant: "warning" },
  "in-review": { label: "En cours", variant: "secondary" },
  resolved: { label: "Résolu", variant: "success" },
  escalated: { label: "Escaladé", variant: "destructive" },
};

export default function LitigesPage() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState(mockDisputes);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<MockDispute | null>(null);

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.buyer.toLowerCase().includes(search.toLowerCase()) ||
        d.seller.toLowerCase().includes(search.toLowerCase()) ||
        d.reason.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [disputes, search, statusFilter]);

  const handleResolve = (dispute: MockDispute) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === dispute.id ? { ...d, status: "resolved" as const } : d))
    );
    toast(`Litige ${dispute.id} résolu.`, "success");
    setSelectedDispute(null);
  };

  const handleEscalate = (dispute: MockDispute) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === dispute.id ? { ...d, status: "escalated" as const } : d))
    );
    toast(`Litige ${dispute.id} escaladé.`, "warning");
    setSelectedDispute(null);
  };

  const handleRefund = (dispute: MockDispute) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === dispute.id ? { ...d, status: "resolved" as const } : d))
    );
    toast(`Acheteur remboursé. Litige ${dispute.id} résolu.`, "success");
    setSelectedDispute(null);
  };

  const columns = [
    {
      key: "id",
      header: "N° Litige",
      render: (d: MockDispute) => <span className="font-mono font-medium text-foreground text-xs">{d.id}</span>,
    },
    {
      key: "reason",
      header: "Motif",
      render: (d: MockDispute) => (
        <p className="font-medium text-foreground truncate max-w-[200px]">{d.reason}</p>
      ),
    },
    {
      key: "buyer",
      header: "Acheteur",
      className: "hidden md:table-cell",
      render: (d: MockDispute) => <span className="text-muted-foreground">{d.buyer}</span>,
    },
    {
      key: "seller",
      header: "Vendeur",
      className: "hidden md:table-cell",
      render: (d: MockDispute) => <span className="text-muted-foreground">{d.seller}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (d: MockDispute) => {
        const config = statusConfig[d.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (d: MockDispute) => (
        <span className="text-muted-foreground text-xs">
          {new Date(d.createdDate).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (d: MockDispute) => (
        <button
          onClick={() => setSelectedDispute(d)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <FiEye className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
    },
  ];

  const openCount = disputes.filter((d) => d.status === "open").length;
  const inReviewCount = disputes.filter((d) => d.status === "in-review").length;
  const escalatedCount = disputes.filter((d) => d.status === "escalated").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Litiges</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérer les différends entre acheteurs et vendeurs</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{openCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Ouverts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{inReviewCount}</p>
          <p className="text-xs text-muted-foreground mt-1">En cours</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{escalatedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Escaladés</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un litige..."
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
          <option value="open">Ouvert</option>
          <option value="in-review">En cours</option>
          <option value="escalated">Escaladé</option>
          <option value="resolved">Résolu</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} emptyMessage="Aucun litige trouvé" />

      {/* Dispute Detail Dialog */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedDispute(null)} />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDispute(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedDispute.id}</h2>
                <Badge variant={statusConfig[selectedDispute.status].variant}>
                  {statusConfig[selectedDispute.status].label}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Motif</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{selectedDispute.reason}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Acheteur</span>
                <span className="font-medium">{selectedDispute.buyer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{selectedDispute.seller}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Article</span>
                <span className="font-medium">{selectedDispute.article}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium">{new Date(selectedDispute.createdDate).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-1">Description du litige</p>
              <p className="text-sm text-foreground">{selectedDispute.description}</p>
            </div>

            {/* Actions */}
            {selectedDispute.status !== "resolved" && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Actions de résolution</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRefund(selectedDispute)}
                    className="flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <FiRotateCcw className="h-3.5 w-3.5" />
                    Rembourser
                  </button>
                  <button
                    onClick={() => handleResolve(selectedDispute)}
                    className="flex items-center justify-center gap-2 h-9 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <FiCheckCircle className="h-3.5 w-3.5" />
                    Résoudre
                  </button>
                  {selectedDispute.status !== "escalated" && (
                    <button
                      onClick={() => handleEscalate(selectedDispute)}
                      className="flex items-center justify-center gap-2 h-9 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      <FiAlertTriangle className="h-3.5 w-3.5" />
                      Escalader
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
