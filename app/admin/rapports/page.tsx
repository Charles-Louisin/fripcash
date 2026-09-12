"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartCourierPerf } from "@/components/admin/charts/chart-courier-perf";
import { ChartPieDonutActive } from "@/components/admin/charts/chart-pie-donut-active";
import { ChartPieLegend } from "@/components/admin/charts/chart-pie-legend";
import { ChartProductsGmv } from "@/components/admin/charts/chart-products-gmv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";

export default function AdminAnalyticsPage() {
  const { analytics } = useAdminPlatformStore();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rapports & analytics"
        description="Performance produits, boutiques et livreurs (données mock)"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartProductsGmv />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top boutiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topShops.map((shop, i) => (
                <div
                  key={shop.name}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium">{shop.name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{shop.orders} cmd.</p>
                    <p className="text-muted-foreground">★ {shop.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ChartPieLegend />
        <ChartPieDonutActive />

        <div className="xl:col-span-2">
          <ChartCourierPerf />
        </div>
      </div>
    </div>
  );
}
