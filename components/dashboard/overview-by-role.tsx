"use client";

import Link from "next/link";
import {
  FiShoppingBag,
  FiShoppingCart,
  FiCreditCard,
  FiTrendingUp,
  FiArrowRight,
  FiPlus,
  FiSearch,
  FiHeart,
  FiHome,
  FiGrid,
} from "react-icons/fi";
import { useMyArticles } from "@/hooks/use-articles";
import { useMyOrders } from "@/hooks/use-orders";
import { useWalletBalance } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { resolveAccountType, type AccountType } from "@/lib/account-type";
import { AccountTypeBadge } from "@/components/account/account-type-badge";
import { ShopVerificationBanner } from "@/components/account/shop-verification-banner";

type UiUser = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  pseudo?: string;
  avatar?: string;
  seller?: {
    kind?: string;
    shopKind?: string | null;
    verificationStatus?: string | null;
  } | null;
  role?: string;
  shopKind?: string | null;
  isAdmin?: boolean;
  courier?: unknown;
};

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

export function DashboardOverviewByRole({ user }: { user: UiUser }) {
  const type = resolveAccountType(user);
  const { data: articles = [], isLoading: articlesLoading } = useMyArticles();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders({
    isSeller: type.isSeller,
  });
  const { data: wallet, isLoading: walletLoading } = useWalletBalance();

  const activeListings = articles.filter((l) => l.status === "active").length;
  const sellerOrders = orders.filter((o) => o.role === "seller");
  const totalSales = sellerOrders.length;
  const releasedSalesGnf = sellerOrders
    .filter((o) => o.status === "fundsReleased" || o.escrowStatus === "released")
    .reduce((s, o) => s + (o.amount || 0) - (o.commission || 0), 0);
  const totalPurchases = orders.filter((o) => o.role === "buyer").length;
  const availableGnf = Number(
    wallet?.availableBalance ?? wallet?.availableBalanceGnf ?? wallet?.availableGnf ?? 0
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {user.firstName || "Utilisateur"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
        </div>
        <AccountTypeBadge user={user} size="md" />
      </div>

      {type.requiresAdminApproval && <ShopVerificationBanner type={type} />}

      {type.id === "acheteur" ? (
        <BuyerStats
          purchases={ordersLoading ? "…" : String(totalPurchases)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Annonces actives"
            value={articlesLoading ? "…" : String(activeListings)}
            href="/dashboard/articles"
            icon={FiShoppingBag}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            label="Ventes"
            value={ordersLoading ? "…" : String(totalSales)}
            href="/dashboard/commandes"
            icon={FiTrendingUp}
            color="bg-emerald-100 text-emerald-700"
          />
          {user && (
            <StatCard
              label="Achats"
              value={ordersLoading ? "…" : String(totalPurchases)}
              href="/dashboard/commandes"
              icon={FiShoppingCart}
              color="bg-blue-100 text-blue-600"
            />
          )}
          <StatCard
            label="Disponible (GNF)"
            value={
              walletLoading
                ? "…"
                : availableGnf.toLocaleString("fr-FR")
            }
            href="/dashboard/porte-monnaie"
            icon={FiCreditCard}
            color="bg-emerald-100 text-emerald-700"
          />
          <StatCard
            label="Séquestre (GNF)"
            value={
              walletLoading
                ? "…"
                : Number(wallet?.reservedBalance ?? wallet?.reservedGnf ?? 0).toLocaleString(
                    "fr-FR"
                  )
            }
            href="/dashboard/porte-monnaie"
            icon={FiCreditCard}
            color="bg-amber-100 text-amber-700"
          />
          <StatCard
            label="Ventes libérées (GNF)"
            value={ordersLoading ? "…" : releasedSalesGnf.toLocaleString("fr-FR")}
            href="/dashboard/porte-monnaie"
            icon={FiTrendingUp}
            color="bg-primary/10 text-primary"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        {type.isSeller ? (
          <Link
            href="/dashboard/articles"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <FiPlus className="h-4 w-4" />
            {type.canPublish
              ? type.isShop
                ? "Ajouter un article"
                : "Publier une annonce"
              : "Voir mes articles"}
          </Link>
        ) : (
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <FiSearch className="h-4 w-4" />
            Parcourir le catalogue
          </Link>
        )}
        {type.isSeller && (
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <FiSearch className="h-4 w-4 text-muted-foreground" />
            Catalogue
          </Link>
        )}
      </div>

      <RoleShortcuts type={type} />

      {type.id === "acheteur" && (
        <Link
          href="/dashboard/parametres"
          className="block rounded-xl border border-border p-4 text-sm hover:border-primary/40"
        >
          Tu veux vendre ? Passe en vendeur particulier depuis les paramètres →
        </Link>
      )}
    </div>
  );
}

function BuyerStats({ purchases }: { purchases: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard
        label="Mes achats"
        value={purchases}
        href="/dashboard/commandes"
        icon={FiShoppingCart}
        color="bg-blue-100 text-blue-600"
      />
      <StatCard
        label="Favoris"
        value="—"
        href="/dashboard/favoris"
        icon={FiHeart}
        color="bg-rose-100 text-rose-600"
      />
      <StatCard
        label="Catalogue"
        value="Explorer"
        href="/produits"
        icon={FiSearch}
        color="bg-primary/10 text-primary"
      />
    </div>
  );
}

function RoleShortcuts({ type }: { type: AccountType }) {
  const shopLinks = [
    type.isShop && {
      href: "/dashboard/boutique",
      label: "Ma boutique",
      icon: FiHome,
    },
    type.seesExcel && {
      href: "/dashboard/import-excel",
      label: type.excelImport ? "Import Excel" : "Import Excel (verrouillé)",
      icon: FiGrid,
    },
    type.seesLibrary && {
      href: "/dashboard/bibliotheque",
      label: type.productLibrary ? "Bibliothèque" : "Bibliothèque (verrouillée)",
      icon: FiGrid,
    },
    type.isSeller && {
      href: "/dashboard/porte-monnaie",
      label: "Gains / séquestre",
      icon: FiCreditCard,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];

  if (shopLinks.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shopLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary/40"
        >
          <span className="flex items-center gap-2 font-medium">
            <link.icon className="h-4 w-4 text-primary" />
            {link.label}
          </span>
          <FiArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      ))}
      {type.destination && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="text-xs text-muted-foreground">
            {type.canPublish
              ? "Tes annonces apparaissent dans"
              : "Univers après validation"}
          </p>
          <p className="font-semibold text-foreground">{type.destination}</p>
          <Badge variant="secondary" className="mt-2 text-[10px]">
            {type.label}
          </Badge>
        </div>
      )}
    </div>
  );
}
