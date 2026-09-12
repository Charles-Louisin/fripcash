"use client";

import { useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { formatGnf, shippingKey } from "@/lib/admin-platform";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { FiGrid, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { ArrowRight } from "lucide-react";

export default function AdminShippingRatesPage() {
  const { zones, shippingRates, setShippingRate } = useAdminPlatformStore();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const values = Object.values(shippingRates).filter((v) => v > 0);
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { min, max, avg };
  }, [shippingRates]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tarifs livraison"
        description="Matrice des frais de livraison entre zones (GNF)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tarif moyen"
          value={formatGnf(stats.avg)}
          change="Toutes liaisons"
          changeType="neutral"
          icon={FiGrid}
        />
        <StatCard
          title="Tarif minimum"
          value={formatGnf(stats.min)}
          change="Même zone"
          changeType="positive"
          icon={FiTrendingDown}
        />
        <StatCard
          title="Tarif maximum"
          value={formatGnf(stats.max)}
          change="Zone croisée"
          changeType="neutral"
          icon={FiTrendingUp}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary/15 border border-primary/30" />
          Même zone (tarif local)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500/15 border border-amber-500/30" />
          Zone différente (inter-zone)
        </span>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-36 sticky left-0 bg-muted/40 z-10">
                Départ
              </th>
              {zones.map((z) => (
                <th key={z.id} className="px-3 py-3 text-center font-medium min-w-[140px]">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{z.name}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Arrivée
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((from) => (
              <tr key={from.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium sticky left-0 bg-card z-10 border-r">
                  {from.name}
                </td>
                {zones.map((to) => {
                  const key = shippingKey(from.id, to.id);
                  const value = shippingRates[key] ?? 0;
                  const sameZone = from.id === to.id;
                  return (
                    <td
                      key={to.id}
                      className={`px-3 py-3 text-center ${
                        sameZone ? "bg-primary/5" : "bg-amber-500/5"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[48px]">{from.name}</span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[48px]">{to.name}</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          step={500}
                          value={value}
                          onChange={(e) => {
                            const next = parseInt(e.target.value, 10) || 0;
                            setShippingRate(from.id, to.id, next);
                          }}
                          onBlur={() =>
                            toast(
                              `${from.name} → ${to.name} : ${formatGnf(value)}`,
                              "success"
                            )
                          }
                          className="h-8 w-24 text-center text-sm font-semibold mx-auto"
                        />
                        <Badge
                          variant={sameZone ? "secondary" : "outline"}
                          className="text-[10px] font-normal"
                        >
                          {formatGnf(value)}
                        </Badge>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
