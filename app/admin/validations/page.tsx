"use client";

import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import {
  FiCheck,
  FiX,
  FiShield,
  FiBriefcase,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSellerVerifications,
  useApproveSellerVerification,
  useRejectSellerVerification,
  useAdminIndividualKyc,
  useAdminOrgKyc,
  useReviewIndividualKyc,
  useReviewOrgKyc,
} from "@/hooks/use-admin";
import { useToast } from "@/components/ui/toast";
import { listingImageUrl } from "@/lib/api";

type VerificationRow = {
  id: string;
  shopName: string;
  shopKind: string;
  phone?: string;
  createdAt?: string;
  displayName?: string;
};

type KycRow = {
  id: string;
  label: string;
  status: string;
  createdAt?: string;
  docs: string[];
  raw: any;
};

function mapVerification(v: any): VerificationRow {
  return {
    id: v.id || v._id || v.sellerProfileId,
    shopName:
      v.shopName ||
      v.name ||
      v.sellerProfile?.shopName ||
      v.displayName ||
      "Boutique",
    shopKind: (v.shopKind || v.sellerProfile?.shopKind || "STANDARD")
      .toString()
      .toLowerCase(),
    phone: v.phone || v.user?.phone || v.sellerProfile?.phone,
    createdAt: v.createdAt || v.submittedAt,
    displayName: v.displayName || v.user?.name || v.user?.displayName,
  };
}

function mapKyc(v: any, kind: "individual" | "org"): KycRow {
  const docs = (v.documents || v.docs || [])
    .map((d: any) =>
      typeof d === "string"
        ? d
        : listingImageUrl(d.storageKey || d.key) || d.storageKey || d.url
    )
    .filter(Boolean);
  return {
    id: v.id || v._id,
    label:
      kind === "org"
        ? v.organizationName ||
          v.orgName ||
          v.name ||
          v.legalName ||
          "Organisation"
        : v.user?.name ||
          v.displayName ||
          v.fullName ||
          v.user?.phoneNumber ||
          "Individu",
    status: String(v.status || v.verificationStatus || "PENDING"),
    createdAt: v.createdAt || v.submittedAt,
    docs,
    raw: v,
  };
}

function notePrompt(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const note = window.prompt("Note du reviewer (obligatoire)", fallback);
  return note?.trim() || null;
}

export default function AdminValidationsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("boutiques");
  const [shopFilter, setShopFilter] = useState<
    "all" | "proximite" | "enseigne"
  >("all");

  const {
    data: shopRows = [],
    isLoading: shopsLoading,
    isError: shopsError,
  } = useSellerVerifications();
  const { data: individualRows = [], isLoading: indLoading } =
    useAdminIndividualKyc();
  const { data: orgRows = [], isLoading: orgLoading } = useAdminOrgKyc();

  const approveShop = useApproveSellerVerification();
  const rejectShop = useRejectSellerVerification();
  const reviewIndividual = useReviewIndividualKyc();
  const reviewOrg = useReviewOrgKyc();

  const shops = useMemo(
    () => (Array.isArray(shopRows) ? shopRows : []).map(mapVerification),
    [shopRows]
  );
  const individuals = useMemo(
    () =>
      (Array.isArray(individualRows) ? individualRows : []).map((v) =>
        mapKyc(v, "individual")
      ),
    [individualRows]
  );
  const orgs = useMemo(
    () =>
      (Array.isArray(orgRows) ? orgRows : []).map((v) => mapKyc(v, "org")),
    [orgRows]
  );

  const filteredShops = useMemo(
    () =>
      shopFilter === "all"
        ? shops
        : shops.filter((u) => u.shopKind.includes(shopFilter)),
    [shops, shopFilter]
  );

  const shopStats = useMemo(
    () => ({
      total: shops.length,
      local: shops.filter((u) => u.shopKind.includes("proximite")).length,
      enseigne: shops.filter((u) => u.shopKind.includes("enseigne")).length,
    }),
    [shops]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Validations"
        description="Boutiques · KYC individus · KYC organisations (API admin live)"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Boutiques"
          value={shopsLoading ? "…" : String(shopStats.total)}
          description="Seller verifications"
          icon={FiShield}
        />
        <StatCard
          label="KYC individus"
          value={indLoading ? "…" : String(individuals.length)}
          description="File /admin/kyc/individuals"
          icon={FiUser}
        />
        <StatCard
          label="KYC orgs"
          value={orgLoading ? "…" : String(orgs.length)}
          description="File /admin/kyc/organizations"
          icon={FiBriefcase}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="boutiques">
            Boutiques ({shopStats.total})
          </TabsTrigger>
          <TabsTrigger value="individus">
            KYC individus ({individuals.length})
          </TabsTrigger>
          <TabsTrigger value="orgs">KYC orgs ({orgs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="boutiques" className="space-y-4 mt-4">
          {shopsError && (
            <p className="text-sm text-destructive">
              Impossible de charger les validations boutique.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Tous"],
                ["proximite", "Proximité"],
                ["enseigne", "Enseigne"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setShopFilter(value)}
                className={`h-8 rounded-lg border px-3 text-sm transition-colors ${
                  shopFilter === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!shopsLoading && filteredShops.length === 0 ? (
            <EmptyQueue title="Aucune boutique en attente" />
          ) : (
            <DataTable
              data={filteredShops}
              getRowKey={(u) => u.id}
              emptyMessage="Aucune demande"
              columns={[
                {
                  key: "shop",
                  header: "Boutique",
                  render: (u) => (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {(u.shopName || "B").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.shopName}</p>
                        {u.displayName && (
                          <p className="text-xs text-muted-foreground">
                            {u.displayName}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "role",
                  header: "Type",
                  render: (u) => (
                    <Badge variant="secondary">{u.shopKind}</Badge>
                  ),
                },
                {
                  key: "phone",
                  header: "Contact",
                  render: (u) => (
                    <span className="text-sm text-muted-foreground">
                      {u.phone || "—"}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Demandé le",
                  render: (u) => (
                    <span className="text-xs text-muted-foreground">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  render: (u) => (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        disabled={rejectShop.isPending}
                        onClick={async () => {
                          try {
                            await rejectShop.mutateAsync({
                              id: u.id,
                              reviewerNote: "Refusé depuis l'admin web",
                            });
                            toast(`${u.shopName} refusé.`, "warning");
                          } catch {
                            toast("Impossible de refuser.", "error");
                          }
                        }}
                      >
                        <FiX className="h-3.5 w-3.5" /> Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        disabled={approveShop.isPending}
                        onClick={async () => {
                          try {
                            await approveShop.mutateAsync({ id: u.id });
                            toast(`${u.shopName} validé.`, "success");
                          } catch {
                            toast("Impossible de valider.", "error");
                          }
                        }}
                      >
                        <FiCheck className="h-3.5 w-3.5" /> Valider
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="individus" className="space-y-4 mt-4">
          {!indLoading && individuals.length === 0 ? (
            <EmptyQueue title="Aucun KYC individu en file" />
          ) : (
            <DataTable
              data={individuals}
              getRowKey={(r) => r.id}
              emptyMessage="File vide"
              columns={kycColumns({
                onApprove: async (row) => {
                  try {
                    await reviewIndividual.mutateAsync({
                      id: row.id,
                      action: "approve",
                    });
                    toast(`${row.label} approuvé.`, "success");
                  } catch {
                    toast("Approbation impossible.", "error");
                  }
                },
                onReject: async (row) => {
                  const note = notePrompt("Document illisible");
                  if (!note) {
                    toast("Une note est requise pour refuser.", "error");
                    return;
                  }
                  try {
                    await reviewIndividual.mutateAsync({
                      id: row.id,
                      action: "reject",
                      reviewerNote: note,
                    });
                    toast(`${row.label} refusé.`, "warning");
                  } catch {
                    toast("Refus impossible.", "error");
                  }
                },
                pending:
                  reviewIndividual.isPending,
              })}
            />
          )}
        </TabsContent>

        <TabsContent value="orgs" className="space-y-4 mt-4">
          {!orgLoading && orgs.length === 0 ? (
            <EmptyQueue title="Aucun KYC organisation en file" />
          ) : (
            <DataTable
              data={orgs}
              getRowKey={(r) => r.id}
              emptyMessage="File vide"
              columns={kycColumns({
                onApprove: async (row) => {
                  try {
                    await reviewOrg.mutateAsync({
                      id: row.id,
                      action: "approve",
                    });
                    toast(`${row.label} approuvée.`, "success");
                  } catch {
                    toast("Approbation impossible.", "error");
                  }
                },
                onReject: async (row) => {
                  const note = notePrompt("RCCM illisible");
                  if (!note) {
                    toast("Une note est requise pour refuser.", "error");
                    return;
                  }
                  try {
                    await reviewOrg.mutateAsync({
                      id: row.id,
                      action: "reject",
                      reviewerNote: note,
                    });
                    toast(`${row.label} refusée.`, "warning");
                  } catch {
                    toast("Refus impossible.", "error");
                  }
                },
                onResubmit: async (row) => {
                  const note = notePrompt("Merci de renvoyer les documents");
                  if (!note) {
                    toast("Une note est requise.", "error");
                    return;
                  }
                  try {
                    await reviewOrg.mutateAsync({
                      id: row.id,
                      action: "resubmit",
                      reviewerNote: note,
                    });
                    toast(`Resoumission demandée pour ${row.label}.`, "info");
                  } catch {
                    toast("Action impossible.", "error");
                  }
                },
                pending: reviewOrg.isPending,
                showResubmit: true,
              })}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyQueue({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
      <BadgeCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Les nouvelles demandes apparaîtront ici dès qu&apos;elles seront en base.
      </p>
    </div>
  );
}

function kycColumns({
  onApprove,
  onReject,
  onResubmit,
  pending,
  showResubmit,
}: {
  onApprove: (row: KycRow) => void;
  onReject: (row: KycRow) => void;
  onResubmit?: (row: KycRow) => void;
  pending: boolean;
  showResubmit?: boolean;
}) {
  return [
    {
      key: "who",
      header: "Demandeur",
      render: (r: KycRow) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{(r.label || "?").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{r.label}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {r.id.slice(-8)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (r: KycRow) => <Badge variant="secondary">{r.status}</Badge>,
    },
    {
      key: "docs",
      header: "Docs",
      render: (r: KycRow) =>
        r.docs.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {r.docs.slice(0, 3).map((url, i) => (
              <a
                key={`${r.id}-doc-${i}`}
                href={url.startsWith("http") ? url : undefined}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Doc {i + 1}
              </a>
            ))}
          </div>
        ),
    },
    {
      key: "date",
      header: "Soumis",
      render: (r: KycRow) => (
        <span className="text-xs text-muted-foreground">
          {r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("fr-FR")
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r: KycRow) => (
        <div className="flex justify-end gap-1">
          {showResubmit && onResubmit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1"
              disabled={pending}
              onClick={() => onResubmit(r)}
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            disabled={pending}
            onClick={() => onReject(r)}
          >
            <FiX className="h-3.5 w-3.5" /> Refuser
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1"
            disabled={pending}
            onClick={() => onApprove(r)}
          >
            <FiCheck className="h-3.5 w-3.5" /> Approuver
          </Button>
        </div>
      ),
    },
  ];
}
