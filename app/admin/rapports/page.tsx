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

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminDashboard();

  const topListings = (data?.pendingListings?.length
    ? data.pendingListings
    : []
  ).slice(0, 0);

  // Top by price from live catalog value — use destination chart as proxy rankings
  const topByDestination = data?.destinationChart ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rapports & analytics"
        description="Indicateurs live catalogue — commandes/GMV dès que l’API les expose"
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartProductsGmv
            data={(data?.categoryChart ?? []).slice(0, 8).map((c) => ({
              name: c.category.slice(0, 18),
              gmv: c.volume,
            }))}
            title="Articles par catégorie"
            description="Volume d’annonces live (pas GMV commandes)"
            valueLabel="Annonces"
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
                  {topByDestination.map((row, i) => (
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

          <ChartPieDonutActive data={[]} />

          <ChartPieLegend data={[]} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valeur catalogue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatGnf(data?.catalogValueGnf ?? 0)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Somme des prix × quantités des annonces actives
              </p>
              {topListings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {topListings.map((a) => {
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
                        <span className="text-sm truncate">{a.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="xl:col-span-2">
            <ChartCourierPerf data={[]} />
          </div>
        </div>
      )}
    </div>
  );
}
