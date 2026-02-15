"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { FiShoppingBag, FiShoppingCart, FiCreditCard, FiTrendingUp, FiArrowRight, FiPlus, FiSearch } from "react-icons/fi";
import {
  mockCurrentUser,
  mockUserListings,
  mockUserOrders,
  mockUserActivity,
  mockUserSalesChart,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  ventes: {
    label: "Ventes",
    color: "var(--chart-1)",
  },
  achats: {
    label: "Achats",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function DashboardOverviewPage() {
  const activeListings = mockUserListings.filter((l) => l.status === "active").length;
  const totalSales = mockUserOrders.filter((o) => o.type === "sale").length;
  const totalPurchases = mockUserOrders.filter((o) => o.type === "purchase").length;

  const stats = [
    { label: "Articles en vente", value: activeListings, icon: FiShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Ventes", value: totalSales, icon: FiTrendingUp, color: "bg-green-100 text-green-600" },
    { label: "Achats", value: totalPurchases, icon: FiShoppingCart, color: "bg-blue-100 text-blue-600" },
    { label: "Solde (GNF)", value: mockCurrentUser.walletBalance.toLocaleString("fr-FR"), icon: FiCreditCard, color: "bg-amber-100 text-amber-600" },
  ];

  const activityIcons: Record<string, string> = {
    sale: "bg-green-100 text-green-600",
    purchase: "bg-blue-100 text-blue-600",
    message: "bg-purple-100 text-purple-600",
    favorite: "bg-pink-100 text-pink-600",
    listing: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {mockCurrentUser.name.split(" ")[0]} !
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenue sur votre espace FripCash
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          Vendre un article
        </Link>
        <Link
          href="/produits"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <FiSearch className="h-4 w-4 text-muted-foreground" />
          Parcourir les articles
        </Link>
      </div>

      {/* Sales/Purchases Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Mes ventes & achats</CardTitle>
            <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
            <AreaChart data={mockUserSalesChart}>
              <defs>
                <linearGradient id="fillVentes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ventes)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-ventes)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillAchats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-achats)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-achats)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="achats"
                type="natural"
                fill="url(#fillAchats)"
                stroke="var(--color-achats)"
                stackId="a"
              />
              <Area
                dataKey="ventes"
                type="natural"
                fill="url(#fillVentes)"
                stroke="var(--color-ventes)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
            <Badge variant="secondary" className="text-[10px]">{mockUserActivity.length}</Badge>
          </div>
          <div className="space-y-3">
            {mockUserActivity.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activityIcons[item.type] || "bg-muted text-muted-foreground"}`}>
                  {item.type === "sale" && <FiTrendingUp className="h-3.5 w-3.5" />}
                  {item.type === "purchase" && <FiShoppingCart className="h-3.5 w-3.5" />}
                  {item.type === "message" && <span className="text-xs">💬</span>}
                  {item.type === "favorite" && <span className="text-xs">❤</span>}
                  {item.type === "listing" && <FiShoppingBag className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="space-y-4">
          {/* Wallet */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Mon porte-monnaie</h3>
            <p className="text-3xl font-bold text-primary">{mockCurrentUser.walletBalance.toLocaleString("fr-FR")} <span className="text-base font-medium">GNF</span></p>
            <Link href="/dashboard/porte-monnaie" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
              Voir les transactions <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Profile summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Mon profil</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mockCurrentUser.avatar} alt={mockCurrentUser.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{mockCurrentUser.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-amber-500">★ {mockCurrentUser.rating}</span>
                  <span className="text-xs text-muted-foreground">({mockCurrentUser.reviewsCount} avis)</span>
                </div>
              </div>
            </div>
            <Link href="/dashboard/profil" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
              Modifier le profil <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
