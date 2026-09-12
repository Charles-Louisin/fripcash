"use client";

import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { FiCheck, FiX, FiShield, FiHome, FiBriefcase } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  mockAdminUsers,
  pendingShopValidations,
  type MockAdminUser,
} from "@/lib/admin-mock-data";
import {
  accountRoleLabels,
  listingDestinationLabels,
  shopKindLabels,
  type AccountRole,
  type ListingDestination,
  type ShopKind,
} from "@/lib/seller-domain";
import { useToast } from "@/components/ui/toast";

export default function AdminValidationsPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<MockAdminUser[]>(() =>
    pendingShopValidations(mockAdminUsers)
  );
  const [filter, setFilter] = useState<"all" | "commerceLocal" | "grandeSurface">(
    "all"
  );

  const filtered = useMemo(
    () =>
      filter === "all" ? queue : queue.filter((u) => u.role === filter),
    [queue, filter]
  );

  const stats = useMemo(
    () => ({
      total: queue.length,
      local: queue.filter((u) => u.role === "commerceLocal").length,
      enseigne: queue.filter((u) => u.role === "grandeSurface").length,
    }),
    [queue]
  );

  const approve = (user: MockAdminUser) => {
    setQueue((prev) => prev.filter((u) => u._id !== user._id));
    toast(
      `${user.shopName || user.pseudo} validé — visible dans l'annuaire app.`,
      "success"
    );
  };

  const reject = (user: MockAdminUser) => {
    setQueue((prev) => prev.filter((u) => u._id !== user._id));
    toast(`${user.shopName || user.pseudo} refusé.`, "warning");
  };

  const columns = [
    {
      key: "shop",
      header: "Boutique",
      render: (u: MockAdminUser) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={u.avatar} alt={u.pseudo} />
            <AvatarFallback>{(u.firstName || "B").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {u.shopName || `${u.firstName} ${u.lastName}`}
            </p>
            <p className="text-xs text-muted-foreground">@{u.pseudo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Type",
      render: (u: MockAdminUser) => (
        <div className="space-y-1">
          <Badge variant="secondary">
            {accountRoleLabels[u.role as AccountRole] ?? u.role}
          </Badge>
          {u.shopKind && (
            <p className="text-[10px] text-muted-foreground">
              {shopKindLabels[u.shopKind as ShopKind]}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "destination",
      header: "Univers",
      className: "hidden md:table-cell",
      render: (u: MockAdminUser) =>
        u.listingDestination ? (
          <span className="text-xs text-muted-foreground">
            {listingDestinationLabels[u.listingDestination as ListingDestination]}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "phone",
      header: "Contact",
      className: "hidden lg:table-cell",
      render: (u: MockAdminUser) => (
        <span className="text-muted-foreground text-sm">{u.phone}</span>
      ),
    },
    {
      key: "date",
      header: "Demandé le",
      className: "hidden sm:table-cell",
      render: (u: MockAdminUser) => (
        <span className="text-muted-foreground text-xs">
          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-40",
      render: (u: MockAdminUser) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => reject(u)}
          >
            <FiX className="h-3.5 w-3.5" />
            Refuser
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => approve(u)}>
            <FiCheck className="h-3.5 w-3.5" />
            Valider
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Validations boutique"
        description="File d'attente manuelle — commerce local & enseignes (comme SellerVerificationService dans l'app)"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="En attente"
          value={String(stats.total)}
          description="Validations à traiter"
          icon={FiShield}
        />
        <StatCard
          label="Commerce local"
          value={String(stats.local)}
          description="Boutiques de quartier · 5%"
          icon={FiHome}
          href="/admin/utilisateurs"
          actionLabel="Voir utilisateurs"
        />
        <StatCard
          label="Grandes surfaces"
          value={String(stats.enseigne)}
          description="Enseignes partenaires · SLA"
          icon={FiBriefcase}
          href="/admin/partenaires"
          actionLabel="Voir enseignes"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Tous"],
            ["commerceLocal", "Commerce local"],
            ["grandeSurface", "Grande surface"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`h-8 rounded-lg border px-3 text-sm transition-colors ${
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <BadgeCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-foreground">File vide</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Aucune boutique en attente de validation manuelle.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="Aucune demande en attente"
        />
      )}
    </div>
  );
}
