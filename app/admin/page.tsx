"use client";

import { StatCard } from "@/components/admin/stat-card";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { Badge } from "@/components/ui/badge";
import { FiUsers, FiShoppingBag, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { useAdminStats } from "@/hooks/use-admin";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const totalUsers = stats?.totalUsers ?? 0;
  const totalArticles = stats?.totalArticles ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const openDisputes = stats?.openDisputes ?? 0;
  const pendingArticles = stats?.pendingArticles ?? [];
  const openDisputesList = stats?.recentDisputes ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d&apos;ensemble de la plateforme FripCash</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs"
          value={totalUsers.toLocaleString("fr-FR")}
          change={stats?.usersChange ?? "—"}
          changeType={stats?.usersChange?.startsWith("-") ? "negative" : "positive"}
          icon={FiUsers}
        />
        <StatCard
          title="Articles"
          value={totalArticles.toLocaleString("fr-FR")}
          change={stats?.articlesChange ?? "—"}
          changeType={stats?.articlesChange?.startsWith("-") ? "negative" : "positive"}
          icon={FiShoppingBag}
        />
        <StatCard
          title="Revenus (GNF)"
          value={totalRevenue.toLocaleString("fr-FR")}
          change={stats?.revenueChange ?? "—"}
          changeType={stats?.revenueChange?.startsWith("-") ? "negative" : "positive"}
          icon={HiArrowTrendingUp}
        />
        <StatCard
          title="Litiges ouverts"
          value={openDisputes.toString()}
          change={openDisputes > 0 ? "À traiter" : "Aucun"}
          changeType={openDisputes > 0 ? "negative" : "positive"}
          icon={FiAlertTriangle}
        />
      </div>

      {/* Area Chart */}
      <ChartAreaInteractive />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">L&apos;activité récente apparaîtra ici</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Pending Articles */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Articles en attente</h3>
              <Badge variant="secondary">{pendingArticles.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingArticles.slice(0, 3).map((a: any) => (
                <div key={a._id} className="flex items-center gap-3 py-1.5">
                  {a.images?.[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={a.images[0]} alt={a.title} className="h-9 w-9 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{typeof a.seller === "object" ? a.seller.pseudo : "Vendeur"}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">{(a.price || 0).toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
            <Link href="/admin/articles" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
              Voir tout <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Open Disputes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Litiges à traiter</h3>
              <Badge variant="destructive">{openDisputesList.length}</Badge>
            </div>
            <div className="space-y-2">
              {openDisputesList.slice(0, 3).map((d: any) => (
                <div key={d._id} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof d.buyer === "object" ? d.buyer.pseudo : "Acheteur"} vs {typeof d.seller === "object" ? d.seller.pseudo : "Vendeur"}
                    </p>
                  </div>
                  <Badge
                    variant={d.status === "escalated" ? "destructive" : d.status === "open" ? "warning" : "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {d.status === "open" ? "Ouvert" : d.status === "in-review" ? "En cours" : "Escaladé"}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/admin/litiges" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
              Voir tout <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
