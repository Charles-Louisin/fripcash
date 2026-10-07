"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartCourierPerf } from "@/components/admin/charts/chart-courier-perf";
import { ChartPieDonutActive } from "@/components/admin/charts/chart-pie-donut-active";
import { ChartPieLegend } from "@/components/admin/charts/chart-pie-legend";
import { ChartProductsGmv } from "@/components/admin/charts/chart-products-gmv";
import { ChartPieDonutText } from "@/components/admin/charts/chart-pie-donut-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/use-admin";
import { formatGnf } from "@/lib/admin-platform";
import { listingImageUrl } from "@/lib/api";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";

export default function AdminAnalyticsPage() {
  const range = useAdminDateRange();
  const { data, isLoading } = useAdminDashboard(range.days);

  const topListings = (data?.topListingsByGmv ?? []).slice(0, 6);
  const topByDestination = data?.destinationChart ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rapports & analytics"
        description={`GMV, commissions et livraisons — ${range.label}`}
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartProductsGmv
            data={(data?.topListingsByGmv ?? []).slice(0, 8).map((c: any) => ({
              name: String(c.title || "Article").slice(0, 18),
              gmv: c.gmv,
            }))}
            title="GMV par article"
            description="Somme des commandes non remboursées"
            valueLabel="GMV"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Répartition destinations</CardTitle>
            </CardHeader>
            <CardContent>
              {topByDestination.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aucune annonce
                </p>
              ) : (
                <div className="space-y-3">
                  {topByDestination.map((row: any, i: number) => (
                    <div
                      key={row.category}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-medium">{row.category}</span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{row.volume} annonces</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ChartPieDonutText
            title="Catalogue par catégorie"
            description="Annonces live"
            data={data?.categoryChart ?? []}
          />

          <ChartPieDonutActive data={data?.ordersByZone ?? []} />

          <ChartPieLegend data={data?.ordersByStatus ?? []} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chiffre d&apos;affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatGnf(data?.gmv ?? 0)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                GMV total · commissions {formatGnf(data?.totalRevenue ?? 0)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Catalogue actif : {formatGnf(data?.catalogValueGnf ?? 0)}
              </p>
              {topListings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {topListings.map((a: any) => {
                    const img = listingImageUrl(a.media?.[0]);
                    return (
                      <div key={a.id} className="flex items-center gap-3">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm truncate flex-1">{a.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatGnf(a.gmv)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="xl:col-span-2">
            <ChartCourierPerf data={data?.courierPerf ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
