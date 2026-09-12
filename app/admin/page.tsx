"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { StatsCarousel } from "@/components/admin/stats-carousel";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { ChartBarInteractive } from "@/components/admin/charts/chart-bar-interactive";
import { ChartPieDonutText } from "@/components/admin/charts/chart-pie-donut-text";
import { ChartRadialStacked } from "@/components/admin/charts/chart-radial-stacked";
import { RecentActivity } from "@/components/admin/recent-activity";
import { ActiveSessionsPanel } from "@/components/admin/active-sessions-panel";
import { Badge } from "@/components/ui/badge";
import {
  FiUsers,
  FiShoppingBag,
  FiArrowRight,
  FiTruck,
} from "react-icons/fi";
import { FaShieldHalved } from "react-icons/fa6";
import { BsShieldFillCheck } from "react-icons/bs";
import { HiArrowTrendingUp, HiOutlineScale } from "react-icons/hi2";
import { useAdminStats } from "@/hooks/use-admin";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { useAdminDisputesStore } from "@/stores/admin-disputes-store";
import { formatGnf, dashboardMock } from "@/lib/admin-platform";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";
import { mockAdminOrders, pendingShopValidations } from "@/lib/admin-mock-data";

export default function AdminDashboardPage() {
  const range = useAdminDateRange();
  const { data: stats, isLoading, isError } = useAdminStats();
  const platform = useAdminPlatformStore();
  const disputes = useAdminDisputesStore((s) => s.disputes);

  const totalUsers = stats?.totalUsers ?? 1284;
  const totalArticles = stats?.totalArticles ?? 3562;
  const totalRevenue = stats?.totalRevenue ?? 48_500_000;
  const pendingArticles =
    stats?.pendingArticles && stats.pendingArticles.length > 0
      ? stats.pendingArticles
      : dashboardMock.pendingArticles;
  const pendingShopCount = pendingShopValidations().length;

  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status !== "resolved"),
    [disputes],
  );
  const lockedGmv = useMemo(
    () => openDisputes.reduce((sum, d) => sum + d.amount, 0),
    [openDisputes],
  );
  const escrowHolds = useMemo(
    () =>
      mockAdminOrders.filter((o) =>
        ["paid", "delivered", "disputed", "inTransit", "readyForPickup"].includes(
          o.status
        )
      ),
    [],
  );
  const escrowGmv = useMemo(
    () => escrowHolds.reduce((sum, o) => sum + (o.amount || 0), 0),
    [escrowHolds],
  );
  const activeDeliveries = platform.stuckOrders.length;

  const openDisputesList = openDisputes.slice(0, 3).map((d) => ({
    _id: d.id,
    reason: d.reason,
    status: d.status,
    buyer: { pseudo: d.buyerName },
    seller: { pseudo: d.sellerName },
  }));

  const showApiFallback = isError && !stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Vue d&apos;ensemble
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paiements, litiges et confiance vendeurs · {range.label}
        </p>
        {showApiFallback && (
          <p className="mt-2 text-xs text-amber-600">
            API hors ligne — KPIs complétés avec données de démonstration.
          </p>
        )}
      </div>

      {isLoading && !showApiFallback ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <StatsCarousel gridClassName="sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Litiges ouverts"
              value={`${openDisputes.length}`}
              description="À examiner ou résoudre"
              href="/admin/litiges"
              actionLabel="Voir les litiges"
              icon={HiOutlineScale}
            />
            <StatCard
              label="Paiement bloqué"
              value={formatGnf(escrowGmv + lockedGmv)}
              description={`${escrowHolds.length + openDisputes.length} séquestres actives`}
              href="/admin/porte-monnaies"
              actionLabel="Voir les paiements"
              icon={FaShieldHalved}
            />
            <StatCard
              label="Validations boutique"
              value={`${pendingShopCount}`}
              description="Commerce local & enseignes"
              href="/admin/validations"
              actionLabel="Valider"
              icon={BsShieldFillCheck}
            />
            <StatCard
              label="Utilisateurs"
              value={totalUsers.toLocaleString("fr-FR")}
              description={`${activeDeliveries} livraisons actives`}
              href="/admin/utilisateurs"
              actionLabel="Voir les utilisateurs"
              icon={FiUsers}
            />
          </StatsCarousel>

          <StatsCarousel gridClassName="sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Articles"
              value={totalArticles.toLocaleString("fr-FR")}
              description={stats?.articlesChange ?? "Catalogue live + mock"}
              href="/admin/articles"
              actionLabel="Voir les articles"
              icon={FiShoppingBag}
            />
            <StatCard
              label="Revenus cumulés"
              value={formatGnf(totalRevenue)}
              description={stats?.revenueChange ?? "Commission plateforme"}
              href="/admin/rapports"
              actionLabel="Voir les rapports"
              icon={HiArrowTrendingUp}
            />
            <StatCard
              label="Livraisons actives"
              value={activeDeliveries.toString()}
              description={
                activeDeliveries > 0 ? "Missions en cours" : "Aucune en attente"
              }
              href="/admin/livreurs"
              actionLabel="Voir livreurs"
              icon={FiTruck}
            />
            <StatCard
              label="Commission"
              value={`${platform.commissionRate} %`}
              description="Taux plateforme actuel"
              href="/admin/parametres"
              actionLabel="Paramètres"
              icon={HiArrowTrendingUp}
            />
          </StatsCarousel>

          <ChartAreaInteractive />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <ChartBarInteractive />
            <ChartRadialStacked />
            <ChartPieDonutText />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
              <h3 className="mb-4 font-semibold text-foreground">
                Activité en direct
              </h3>
              <RecentActivity items={platform.activity} />
            </div>

            <div className="space-y-4">
              <ActiveSessionsPanel />

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Articles en attente
                  </h3>
                  <Badge variant="secondary">{pendingArticles.length}</Badge>
                </div>
                <div className="space-y-2">
                  {pendingArticles
                    .slice(0, 3)
                    .map(
                      (a: {
                        _id: string;
                        title: string;
                        price?: number;
                        images?: string[];
                        seller?: { pseudo?: string } | string;
                      }) => (
                        <div key={a._id} className="flex items-center gap-3 py-1.5">
                          {a.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.images[0]}
                              alt={a.title}
                              className="h-9 w-9 rounded object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {a.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {typeof a.seller === "object"
                                ? a.seller.pseudo
                                : "Vendeur"}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  {pendingArticles.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Aucun article en attente
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/articles"
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Voir tout <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Litiges à traiter
                  </h3>
                  <Badge variant="destructive">{openDisputes.length}</Badge>
                </div>
                <div className="space-y-2">
                  {openDisputesList.map((d) => (
                    <div key={d._id} className="py-1.5">
                      <p className="truncate text-sm font-medium">{d.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.buyer.pseudo} vs {d.seller.pseudo}
                      </p>
                    </div>
                  ))}
                  {openDisputesList.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Aucun litige ouvert
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/litiges"
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Voir tout <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
