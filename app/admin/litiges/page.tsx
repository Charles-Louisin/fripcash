"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { FilterStatCard } from "@/components/admin/filter-stat-card";
import { StatsCarousel } from "@/components/admin/stats-carousel";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  type AdminDispute,
  type AdminDisputeOutcome,
  type AdminDisputePayment,
  DISPUTE_OUTCOME_LABELS,
  DISPUTE_OUTCOMES,
  DISPUTE_PAYMENT_KIND_LABELS,
  DISPUTE_STATUS_LABELS,
} from "@/lib/admin-disputes";
import { useAdminDisputes, useAskDisputeParty, useMarkDisputeReview, useResolveAdminDispute } from "@/hooks/use-admin";
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiSearch,
} from "react-icons/fi";
import { FaShieldHalved } from "react-icons/fa6";
import { HiOutlineScale } from "react-icons/hi2";
import { MdPendingActions, MdVerified } from "react-icons/md";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  open: "warning",
  under_review: "secondary",
  resolved: "success",
  closed: "outline",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGnf(amount: number) {
  return `${amount.toLocaleString("fr-FR")} GNF`;
}

function normalizeId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as { id?: unknown; _id?: unknown };
    if (o.id) return String(o.id);
    if (o._id) return String(o._id);
  }
  const raw = String(value);
  return raw === "[object Object]" ? "" : raw;
}

function disputeMessageAuthor(m: any, dispute: AdminDispute) {
  if (m?.fromAdmin || m?.senderRole === "admin") return "Admin";
  if (m?.senderRole === "seller") return dispute.sellerName || "Vendeur";
  if (m?.senderRole === "buyer") return dispute.buyerName || "Acheteur";
  const senderId = normalizeId(m?.senderId);
  if (senderId && senderId === normalizeId(dispute.sellerId)) {
    return dispute.sellerName || "Vendeur";
  }
  if (senderId && senderId === normalizeId(dispute.buyerId)) {
    return dispute.buyerName || "Acheteur";
  }
  return m?.senderName || "Partie";
}

export default function LitigesPage() {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmOutcome, setConfirmOutcome] =
    useState<AdminDisputeOutcome | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [buyerPercent, setBuyerPercent] = useState(50);

  const { data: disputesRes, isLoading } = useAdminDisputes();
  const markReviewApi = useMarkDisputeReview();
  const resolveDisputeApi = useResolveAdminDispute();
  const askParty = useAskDisputeParty();

  const disputes: AdminDispute[] = useMemo(() => {
    const rows = disputesRes?.data ?? [];
    return rows.map((d: any) => ({
      id: d.id,
      orderId: d.orderId,
      productTitle: d.productTitle || "Article",
      productImage: d.productImage || d.listingImageUrl || "",
      buyerId: d.buyerId,
      sellerId: d.sellerId,
      buyerName: d.buyerName || "Acheteur",
      sellerName: d.sellerName || "Vendeur",
      amount: d.amount || 0,
      reason: d.reason || "",
      initiatedBy: d.initiatedBy === "seller" ? "seller" : "buyer",
      initiatorName: d.initiatorName || d.buyerName || "Acheteur",
      openedVia: "order_page",
      status:
        d.status === "resolved"
          ? "resolved"
          : d.status === "under_review"
            ? "under_review"
            : d.status === "closed"
              ? "closed"
              : "open",
      outcome: d.outcome,
      openedAt: d.openedAt || d.createdAt,
      resolvedAt: d.resolvedAt,
      notes: d.notes || d.note || "",
      evidence: Array.isArray(d.evidence)
        ? d.evidence.map((e: any) => (typeof e === "string" ? e : e.url)).filter(Boolean)
        : [],
      messages: d.messages || [],
    }));
  }, [disputesRes]);
  const payments: AdminDisputePayment[] = [];
  const orderStatuses: Record<string, string> = {};

  const selectedDispute = useMemo(
    () => disputes.find((d) => d.id === selectedId) ?? null,
    [disputes, selectedId],
  );

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.sellerName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.productTitle.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter]);

  const openCount = disputes.filter((d) => d.status === "open").length;
  const inReviewCount = disputes.filter(
    (d) => d.status === "under_review",
  ).length;
  const resolvedCount = disputes.filter((d) => d.status === "resolved").length;
  const lockedGmv = useMemo(
    () =>
      disputes
        .filter((d) => d.status !== "resolved")
        .reduce((sum, d) => sum + d.amount, 0),
    [disputes],
  );

  const relatedPayments = selectedDispute
    ? payments.filter((p) => p.orderId === selectedDispute.orderId)
    : [];

  function openDetail(d: AdminDispute) {
    setSelectedId(d.id);
    setNotes(d.notes ?? "");
    setConfirmOutcome(null);
  }

  function closeDetail() {
    setSelectedId(null);
    setNotes("");
    setConfirmOutcome(null);
  }

  async function handleMarkReview() {
    if (!selectedDispute) return;
    try {
      await markReviewApi.mutateAsync({ id: selectedDispute.id });
      showToast("Litige passé en revue", "success");
    } catch (err: any) {
      showToast(err?.message || "Impossible de mettre en revue", "error");
    }
  }

  async function handleConfirmOutcome() {
    if (!selectedDispute || !confirmOutcome) return;
    const note = notes.trim() || "Résolu depuis l'admin";
    const apiResolution =
      confirmOutcome === "refund_buyer"
        ? "resolved_buyer"
        : confirmOutcome === "partial_refund"
          ? "partial_refund"
          : "resolved_seller";
    try {
      await resolveDisputeApi.mutateAsync({
        id: selectedDispute.id,
        resolution: apiResolution,
        note,
        buyerPercent: confirmOutcome === "partial_refund" ? buyerPercent : undefined,
        sellerPercent:
          confirmOutcome === "partial_refund" ? 100 - buyerPercent : undefined,
      });
      showToast("Litige résolu", "success");
      setConfirmOutcome(null);
    } catch (err: any) {
      showToast(err?.message || "Impossible de résoudre le litige", "error");
    }
  }

  const outcomeImpact: Record<
    AdminDisputeOutcome,
    {
      title: string;
      description: string;
      buyerGets: string;
      sellerGets: string;
      orderStatus: string;
    }
  > | null = selectedDispute
    ? {
        release_seller: {
          title: "Libérer le paiement au vendeur ?",
          description:
            "Ferme le litige et débloque la séquestre en faveur du vendeur.",
          buyerGets: formatGnf(0),
          sellerGets: formatGnf(selectedDispute.amount),
          orderStatus: "Terminée",
        },
        partial_refund: {
          title: "Émettre un remboursement partiel ?",
          description: `${buyerPercent}% à l'acheteur, ${100 - buyerPercent}% au vendeur.`,
          buyerGets: formatGnf(
            Math.round((selectedDispute.amount * buyerPercent) / 100)
          ),
          sellerGets: formatGnf(
            Math.round((selectedDispute.amount * (100 - buyerPercent)) / 100)
          ),
          orderStatus: "Fonds libérés (partiel)",
        },
        refund_buyer: {
          title: "Rembourser l’acheteur intégralement ?",
          description:
            "Le montant séquestré revient à l’acheteur. Le vendeur ne reçoit rien.",
          buyerGets: formatGnf(selectedDispute.amount),
          sellerGets: formatGnf(0),
          orderStatus: "Remboursée",
        },
      }
    : null;

  const columns = [
    {
      key: "id",
      header: "N° Litige",
      render: (d: AdminDispute) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {d.id}
        </span>
      ),
    },
    {
      key: "product",
      header: "Article",
      render: (d: AdminDispute) => (
        <p className="max-w-[180px] truncate font-medium text-foreground">
          {d.productTitle}
        </p>
      ),
    },
    {
      key: "buyer",
      header: "Acheteur",
      className: "hidden md:table-cell",
      render: (d: AdminDispute) => (
        <span className="text-muted-foreground">{d.buyerName}</span>
      ),
    },
    {
      key: "seller",
      header: "Vendeur",
      className: "hidden md:table-cell",
      render: (d: AdminDispute) => (
        <span className="text-muted-foreground">{d.sellerName}</span>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      render: (d: AdminDispute) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatGnf(d.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (d: AdminDispute) => (
        <Badge variant={statusVariant[d.status] || "secondary"}>
          {DISPUTE_STATUS_LABELS[d.status]}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (d: AdminDispute) => (
        <span className="text-xs text-muted-foreground">
          {new Date(d.openedAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (d: AdminDispute) => (
        <button
          type="button"
          onClick={() => openDetail(d)}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
        >
          <FiEye className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Litiges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Examiner les différends et résoudre le paiement (séquestre)
        </p>
      </div>

      <StatsCarousel gridClassName="sm:grid-cols-2 xl:grid-cols-4">
        <FilterStatCard
          label="Ouverts"
          value={`${openCount}`}
          description="Besoin d’intake"
          actionLabel="Afficher ouverts"
          icon={HiOutlineScale}
          active={statusFilter === "open"}
          onClick={() => setStatusFilter("open")}
        />
        <FilterStatCard
          label="En cours"
          value={`${inReviewCount}`}
          description="Preuves en examen"
          actionLabel="Afficher en cours"
          icon={MdPendingActions}
          active={statusFilter === "under_review"}
          onClick={() => setStatusFilter("under_review")}
        />
        <FilterStatCard
          label="Résolus"
          value={`${resolvedCount}`}
          description="Issues confirmées"
          actionLabel="Afficher résolus"
          icon={MdVerified}
          active={statusFilter === "resolved"}
          onClick={() => setStatusFilter("resolved")}
        />
        <FilterStatCard
          label="Bloqué"
          value={formatGnf(lockedGmv)}
          description="Toujours en litige"
          actionLabel="Tout afficher"
          icon={FaShieldHalved}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
      </StatsCarousel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un litige..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pr-4 pl-9 text-sm placeholder:text-muted-foreground transition-colors focus:ring-1 focus:ring-ring focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="open">Ouvert</option>
          <option value="under_review">En cours</option>
          <option value="resolved">Résolu</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="Aucun litige trouvé"
        onRowClick={openDetail}
        getRowKey={(d) => d.id}
      />

      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeDetail} />
          <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-lg sm:p-8">
            <button
              type="button"
              onClick={closeDetail}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              &times;
            </button>

            <div className="mb-4 flex items-start gap-3">
              {selectedDispute.productImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedDispute.productImage}
                  alt="image"
                  className="size-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="size-16 shrink-0 rounded-md bg-muted" />
              )}
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedDispute.productTitle}
                  </h2>
                  <Badge
                    variant={
                      statusVariant[selectedDispute.status] || "secondary"
                    }
                  >
                    {DISPUTE_STATUS_LABELS[selectedDispute.status]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedDispute.id} · Ouvert{" "}
                  {formatWhen(selectedDispute.openedAt)}
                </p>
                <p className="mt-2 text-xl font-bold tabular-nums">
                  {formatGnf(selectedDispute.amount)}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    selectedDispute.status === "resolved"
                      ? "text-muted-foreground"
                      : "text-primary"
                  }`}
                >
                  {selectedDispute.status === "resolved"
                    ? "Paiement plus bloqué en litige"
                    : "Paiement bloqué pendant le litige"}
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <span className="text-muted-foreground">Acheteur</span>
                <span className="font-medium">{selectedDispute.buyerName}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{selectedDispute.sellerName}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <span className="text-muted-foreground">Commande</span>
                <span className="font-mono text-xs font-medium">
                  {selectedDispute.orderId}
                  {orderStatuses[selectedDispute.orderId]
                    ? ` · ${orderStatuses[selectedDispute.orderId]}`
                    : ""}
                </span>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <p className="text-[11px] font-bold tracking-wide text-amber-800/80 uppercase">
                Message acheteur
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-950">
                “{selectedDispute.reason}”
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Preuves à examiner
              </p>
              <ul className="flex flex-wrap gap-2">
                {selectedDispute.evidence.map((item) => (
                  <li key={item}>
                    {item.startsWith("http") || item.startsWith("/") ? (
                      /\.(png|jpe?g|webp|gif)(\?|$)/i.test(item) ||
                      item.includes("image") ? (
                        <a href={item} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item}
                            alt=""
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          href={item}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline"
                        >
                          Ouvrir la pièce
                        </a>
                      )
                    ) : (
                      <span className="text-sm">{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Discussion
              </p>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                {(selectedDispute.messages || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun message</p>
                ) : (
                  (selectedDispute.messages || []).map((m: any, i: number) => (
                    <div key={i} className="text-sm">
                      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                        {disputeMessageAuthor(m, selectedDispute)}
                        {m.createdAt
                          ? ` · ${formatWhen(m.createdAt)}`
                          : ""}
                      </p>
                      <p>{m.body}</p>
                      {(m.attachments || []).map((a: any, j: number) =>
                        a.url ? (
                          a.mimeType?.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={j}
                              src={a.url}
                              alt=""
                              className="mt-1 h-16 w-16 rounded-md object-cover"
                            />
                          ) : (
                            <a
                              key={j}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 block text-xs text-primary underline"
                            >
                              {a.name || "Pièce jointe"}
                            </a>
                          )
                        ) : null
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Demander des infos (texte, photos, documents)…"
                  className="h-9 flex-1 rounded-lg border border-input px-3 text-sm"
                />
                <button
                  type="button"
                  className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-white"
                  onClick={async () => {
                    if (!chatDraft.trim()) return;
                    await askParty.mutateAsync({
                      id: selectedDispute.id,
                      message: chatDraft.trim(),
                      kind: "info_request",
                      requestedKinds: ["text", "image", "document"],
                    });
                    setChatDraft("");
                    showToast("Demande envoyée", "success");
                  }}
                >
                  Demander
                </button>
              </div>
            </div>

            {relatedPayments.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Historique paiement
                </p>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {relatedPayments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {DISPUTE_PAYMENT_KIND_LABELS[p.kind]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatWhen(p.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatGnf(p.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDispute.outcome && (
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <FiCheckCircle className="size-4 shrink-0" />
                Issue : {DISPUTE_OUTCOME_LABELS[selectedDispute.outcome]}
                {selectedDispute.resolvedAt
                  ? ` · ${formatWhen(selectedDispute.resolvedAt)}`
                  : ""}
              </p>
            )}

            {selectedDispute.status !== "resolved" && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Résoudre le paiement
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Choisis le pourcentage acheteur / vendeur avant de libérer.
                  </p>
                </div>

                {selectedDispute.status === "open" && (
                  <button
                    type="button"
                    onClick={handleMarkReview}
                    className="inline-flex h-9 w-fit items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Marquer en cours d’examen
                  </button>
                )}

                <div>
                  <label
                    htmlFor="dispute-notes"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Notes admin
                  </label>
                  <textarea
                    id="dispute-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Quelle preuve a tranché ce dossier ?"
                    className="mt-1.5 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                  />
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Remboursement partiel — % acheteur : {buyerPercent}% · % vendeur :{" "}
                    {100 - buyerPercent}%
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={buyerPercent}
                    onChange={(e) => setBuyerPercent(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {DISPUTE_OUTCOMES.map((outcome) => (
                    <button
                      key={outcome.id}
                      type="button"
                      onClick={() => setConfirmOutcome(outcome.id)}
                      className={`inline-flex h-9 w-fit items-center rounded-lg border px-3 text-sm font-semibold transition-colors ${outcome.tone}`}
                    >
                      {outcome.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDispute && confirmOutcome && outcomeImpact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setConfirmOutcome(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <FiAlertTriangle className="size-5 text-amber-500" />
              <h3 className="text-base font-bold text-foreground">
                {outcomeImpact[confirmOutcome].title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {outcomeImpact[confirmOutcome].description}
            </p>
            <dl className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Acheteur reçoit</dt>
                <dd className="font-semibold tabular-nums">
                  {outcomeImpact[confirmOutcome].buyerGets}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Vendeur reçoit</dt>
                <dd className="font-semibold tabular-nums">
                  {outcomeImpact[confirmOutcome].sellerGets}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Statut commande</dt>
                <dd className="font-semibold">
                  {outcomeImpact[confirmOutcome].orderStatus}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOutcome(null)}
                className="inline-flex h-10 w-fit items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmOutcome}
                className="inline-flex h-10 w-fit items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
              >
                <FiCheck className="size-4" />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
