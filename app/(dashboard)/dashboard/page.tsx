"use client";

import * as React from "react";
import Link from "next/link";
import {
  FiShoppingBag,
  FiShoppingCart,
  FiCreditCard,
  FiTrendingUp,
  FiArrowRight,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { useMe } from "@/hooks/use-auth";
import { useMyArticles } from "@/hooks/use-articles";
import { useMyOrders } from "@/hooks/use-orders";
import { useWalletBalance } from "@/hooks/use-wallet";
import { Badge } from "@/components/ui/badge";
import { GetAppBanner } from "@/components/dashboard/get-app-banner";

export default function DashboardOverviewPage() {
  const { data: user, isLoading: userLoading, isError: userError, isFetched } =
    useMe();
  const { data: articles = [], isLoading: articlesLoading } = useMyArticles();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: wallet, isLoading: walletLoading } = useWalletBalance();

  const activeListings = articles.filter((l) => l.status === "active").length;
  const totalSales = orders.filter((o) => o.role === "seller").length;
  const totalPurchases = orders.filter((o) => o.role === "buyer").length;
  const balanceGnf = wallet?.balance ?? wallet?.balanceGnf ?? 0;

  const recentActivity = React.useMemo(() => {
    const items: {
      id: string;
      type: "sale" | "purchase" | "listing";
      label: string;
      date: string;
      link: string;
    }[] = [];

    orders.forEach((o) => {
      const title =
        typeof o.article === "object" && o.article?.title
          ? o.article.title
          : o.raw?.orderNumber || "Commande";
      items.push({
        id: o._id || o.id,
        type: o.role === "seller" ? "sale" : "purchase",
        label:
          o.role === "seller" ? `Vente: ${title}` : `Achat: ${title}`,
        date: o.createdAt || new Date().toISOString(),
        link: "/dashboard/commandes",
      });
    });

    [...articles]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 3)
      .forEach((a) => {
        items.push({
          id: `art-${a._id}`,
          type: "listing",
          label: `Annonce: ${a.title || "Sans titre"}`,
          date: a.createdAt,
          link: "/dashboard/articles",
        });
      });

    return items
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 6);
  }, [orders, articles]);

  const stats = [
    {
      label: "Annonces actives",
      value: articlesLoading ? "…" : String(activeListings),
      icon: FiShoppingBag,
      color: "bg-primary/10 text-primary",
      href: "/dashboard/articles",
    },
    {
      label: "Achats",
      value: ordersLoading ? "…" : String(totalPurchases),
      icon: FiShoppingCart,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/commandes",
    },
    {
      label: "Ventes",
      value: ordersLoading ? "…" : String(totalSales),
      icon: FiTrendingUp,
      color: "bg-emerald-100 text-emerald-700",
      href: "/dashboard/commandes",
    },
    {
      label: "Solde (GNF)",
      value: walletLoading
        ? "…"
        : Number(balanceGnf).toLocaleString("fr-FR"),
      icon: FiCreditCard,
      color: "bg-amber-100 text-amber-700",
      href: "/dashboard/porte-monnaie",
    },
  ];

  if (userLoading || !isFetched) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium">
          Connecte-toi pour voir ton tableau de bord
        </p>
        <Link
          href="/connexion"
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {user.firstName || "Utilisateur"} !
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Données live — achats, ventes, annonces et porte-monnaie.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <FiPlus className="h-4 w-4" />
          Publier une annonce
        </Link>
        <Link
          href="/produits"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <FiSearch className="h-4 w-4 text-muted-foreground" />
          Parcourir le catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
            <Badge variant="secondary" className="text-[10px]">
              {recentActivity.length}
            </Badge>
          </div>
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune activité pour l&apos;instant. Achète ou publie une
                annonce pour commencer.
              </p>
            </div>
          ) : (
            <div className="max-h-[280px] space-y-2 overflow-y-auto">
              {recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.type === "sale"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.type === "purchase"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.type === "listing" ? (
                      <FiShoppingBag className="h-4 w-4" />
                    ) : item.type === "sale" ? (
                      <FiTrendingUp className="h-4 w-4" />
                    ) : (
                      <FiShoppingCart className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Mon porte-monnaie
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {walletLoading
                ? "…"
                : Number(balanceGnf).toLocaleString("fr-FR")}{" "}
              <span className="text-base font-medium text-muted-foreground">
                GNF
              </span>
            </p>
            <Link
              href="/dashboard/porte-monnaie"
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir les transactions <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Mon profil
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                {user.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.phone || `@${user.pseudo}`}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profil"
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Modifier le profil <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <GetAppBanner />
    </div>
  );
}
