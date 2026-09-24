"use client";

import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { StatsCarousel } from "@/components/admin/stats-carousel";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { ChartBarInteractive } from "@/components/admin/charts/chart-bar-interactive";
import { ChartPieDonutText } from "@/components/admin/charts/chart-pie-donut-text";
import { ChartRadialStacked } from "@/components/admin/charts/chart-radial-stacked";
import { RecentActivity } from "@/components/admin/recent-activity";
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
import { useAdminDashboard } from "@/hooks/use-admin";
import { formatGnf } from "@/lib/admin-platform";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";
import { listingImageUrl } from "@/lib/api";

export default function AdminDashboardPage() {
  const range = useAdminDateRange();
  const { data, isLoading, isError, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Impossible de charger le tableau de bord
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Réessaie dans un instant."}
        </p>
      </div>
    );
  }

  const {
    totalListings,
    activeListings,
    pendingListings,
    pendingListingCount,
    pendingShopCount,
    catalogValueGnf,
    commissionRatePercent,
    categoryChart,
    activity,
    openDisputeCount,
    escrowGmv,
    escrowHoldCount,
    totalUsers,
    activeDeliveries,
    draftListings,
    soldListings,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Vue d&apos;ensemble
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Données live de la plateforme · {range.label}
        </p>
      </div>

      <StatsCarousel gridClassName="sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Litiges ouverts"
          value={`${openDisputeCount}`}
          description="À examiner ou résoudre"
          href="/admin/litiges"
          actionLabel="Voir les litiges"
          icon={HiOutlineScale}
        />
        <StatCard
          label="Paiement bloqué"
          value={formatGnf(escrowGmv)}
          description={
            escrowHoldCount === 0
              ? "Aucun séquestre"
              : `${escrowHoldCount} séquestres actives`
          }
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
          value={
            totalUsers == null ? "—" : totalUsers.toLocaleString("fr-FR")
          }
          description="Comptes Better Auth (list-users)"
          href="/admin/utilisateurs"
          actionLabel="Voir les utilisateurs"
          icon={FiUsers}
        />
      </StatsCarousel>

      <StatsCarousel gridClassName="sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Articles"
          value={totalListings.toLocaleString("fr-FR")}
          description={`${activeListings} actifs · ${draftListings ?? 0} brouillons · ${soldListings ?? 0} vendus`}
          href="/admin/articles"
          actionLabel="Voir les articles"
          icon={FiShoppingBag}
        />
        <StatCard
          label="Valeur catalogue"
          value={formatGnf(catalogValueGnf)}
          description="Somme des annonces actives"
          href="/admin/articles"
          actionLabel="Voir le catalogue"
          icon={HiArrowTrendingUp}
        />
        <StatCard
          label="Livraisons actives"
          value={activeDeliveries.toString()}
          description={
            activeDeliveries > 0 ? "Missions en cours" : "Aucune livraison active"
          }
          href="/admin/livreurs"
          actionLabel="Voir livreurs"
          icon={FiTruck}
        />
        <StatCard
          label="Commission"
          value={
            commissionRatePercent == null
              ? "—"
              : `${commissionRatePercent} %`
          }
          description={
            commissionRatePercent == null
              ? "Paramètres plateforme non configurés"
              : "Taux plateforme actuel"
          }
          href="/admin/parametres"
          actionLabel="Paramètres"
          icon={HiArrowTrendingUp}
        />
      </StatsCarousel>

      <ChartAreaInteractive />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartBarInteractive />
        <ChartRadialStacked />
        <ChartPieDonutText
          title="Catalogue par catégorie"
          description="Annonces live regroupées par catégorie"
          data={categoryChart}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <h3 className="mb-4 font-semibold text-foreground">
            Activité récente (audit)
          </h3>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun événement d&apos;audit pour le moment
            </p>
          ) : (
            <RecentActivity items={activity} />
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Articles en attente
              </h3>
              <Badge variant="secondary">{pendingListingCount}</Badge>
            </div>
            <div className="space-y-2">
              {pendingListings.slice(0, 3).map((a) => {
                const img = listingImageUrl(a.media?.[0]);
                return (
                  <div key={a.id} className="flex items-center gap-3 py-1.5">
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={a.title}
                        className="h-9 w-9 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.status}</p>
                    </div>
                  </div>
                );
              })}
              {pendingListingCount === 0 && (
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
              <Badge variant="destructive">{openDisputeCount}</Badge>
            </div>
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun litige ouvert
            </p>
            <Link
              href="/admin/litiges"
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir tout <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
