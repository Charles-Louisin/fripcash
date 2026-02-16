"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { FiShoppingBag, FiShoppingCart, FiCreditCard, FiTrendingUp, FiArrowRight, FiPlus, FiSearch } from "react-icons/fi";
import { useMe } from "@/hooks/use-auth";
import { useMyArticles } from "@/hooks/use-articles";
import { useMyOrders } from "@/hooks/use-orders";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import { useUserChartData } from "@/hooks/use-admin";

type ChartRange = "week" | "month" | "year";

const chartRangeConfig: Record<ChartRange, { description: string; selectLabel: string }> = {
  year: { description: "Évolution sur les 6 derniers mois", selectLabel: "6 derniers mois" },
  month: { description: "Évolution ce mois-ci", selectLabel: "Ce mois-ci" },
  week: { description: "Évolution cette semaine", selectLabel: "Cette semaine" },
};

export default function DashboardOverviewPage() {
  const [chartRange, setChartRange] = React.useState<ChartRange>("year");
  const { data: chartData = [], isLoading: chartLoading } = useUserChartData(chartRange);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: articles } = useMyArticles();
  const { data: orders } = useMyOrders();

  const activeListings = articles?.filter((l: any) => l.status === "active").length ?? 0;
  const totalSales = orders?.filter((o: any) => o.seller?._id === user?.id || o.seller === user?.id).length ?? 0;
  const totalPurchases = orders?.filter((o: any) => o.buyer?._id === user?.id || o.buyer === user?.id).length ?? 0;

  const stats = [
    { label: "Articles en vente", value: activeListings, icon: FiShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Ventes", value: totalSales, icon: FiTrendingUp, color: "bg-green-100 text-green-600" },
    { label: "Achats", value: totalPurchases, icon: FiShoppingCart, color: "bg-blue-100 text-blue-600" },
    { label: "Solde (GNF)", value: (user?.walletBalance ?? 0).toLocaleString("fr-FR"), icon: FiCreditCard, color: "bg-amber-100 text-amber-600" },
  ];

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {user?.firstName || "Utilisateur"} !
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
            <CardDescription>{chartRangeConfig[chartRange].description}</CardDescription>
          </div>
          <Select value={chartRange} onValueChange={(v) => setChartRange(v as ChartRange)}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Sélectionner une période"
            >
              <SelectValue placeholder="6 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {(Object.keys(chartRangeConfig) as ChartRange[]).map((range) => (
                <SelectItem key={range} value={range} className="rounded-lg">
                  {chartRangeConfig[range].selectLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full min-h-[220px]">
            <AreaChart data={chartData}>
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
                dataKey="label"
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
        {/* Recent Activity placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
            <Badge variant="secondary" className="text-[10px]">0</Badge>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">L&apos;activité récente apparaîtra ici</p>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="space-y-4">
          {/* Wallet */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Mon porte-monnaie</h3>
            <p className="text-3xl font-bold text-primary">{(user?.walletBalance ?? 0).toLocaleString("fr-FR")} <span className="text-base font-medium">GNF</span></p>
            <Link href="/dashboard/porte-monnaie" className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
              Voir les transactions <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Profile summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Mon profil</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-muted">
                {user?.avatar && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-amber-500">★ {user?.rating ?? 0}</span>
                  <span className="text-xs text-muted-foreground">({user?.reviewsCount ?? 0} avis)</span>
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
