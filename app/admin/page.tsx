"use client";

import { StatCard } from "@/components/admin/stat-card";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { RecentActivity } from "@/components/admin/recent-activity";
import { Badge } from "@/components/ui/badge";
import { FiUsers, FiShoppingBag, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import {
  mockUsers,
  mockArticles,
  mockOrders,
  mockDisputes,
  recentActivity,
} from "@/lib/mock-data";
import Link from "next/link";

export default function AdminDashboardPage() {
  const totalUsers = mockUsers.length;
  const totalArticles = mockArticles.length;
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.commission, 0);
  const openDisputes = mockDisputes.filter((d) => d.status === "open" || d.status === "in-review").length;
  const pendingArticles = mockArticles.filter((a) => a.status === "pending");
  const openDisputesList = mockDisputes.filter((d) => d.status === "open" || d.status === "in-review" || d.status === "escalated");

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
          change="+12% ce mois"
          changeType="positive"
          icon={FiUsers}
        />
        <StatCard
          title="Articles"
          value={totalArticles.toLocaleString("fr-FR")}
          change="+8% ce mois"
          changeType="positive"
          icon={FiShoppingBag}
        />
        <StatCard
          title="Revenus (GNF)"
          value={totalRevenue.toLocaleString("fr-FR")}
          change="+23% ce mois"
          changeType="positive"
          icon={HiArrowTrendingUp}
        />
        <StatCard
          title="Litiges ouverts"
          value={openDisputes.toString()}
          change="2 en attente"
          changeType="negative"
          icon={FiAlertTriangle}
        />
      </div>

      {/* Area Chart */}
      <ChartAreaInteractive />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
          </div>
          <RecentActivity items={recentActivity} />
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
              {pendingArticles.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className="h-9 w-9 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.seller}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">{a.price.toLocaleString("fr-FR")} F</span>
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
              {openDisputesList.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.reason}</p>
                    <p className="text-xs text-muted-foreground">{d.buyer} vs {d.seller}</p>
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
