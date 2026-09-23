"use client";

import { useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatGnf } from "@/lib/admin-platform";
import { FiGrid, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import { useAdminCatalogZones } from "@/hooks/use-admin";

export default function AdminShippingRatesPage() {
  const { data: zones = [], isLoading, isError } = useAdminCatalogZones();

  const activeZones = useMemo(
    () => zones.filter((z) => z.isActive),
    [zones]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tarifs livraison"
        description="Matrice des frais entre zones — tarifs non exposés par l’API pour l’instant"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tarif moyen"
          value={formatGnf(0)}
          change="Aucune grille live"
          changeType="neutral"
          icon={FiGrid}
        />
        <StatCard
          title="Tarif minimum"
          value={formatGnf(0)}
          change="—"
          changeType="positive"
          icon={FiTrendingDown}
        />
        <StatCard
          title="Tarif maximum"
          value={formatGnf(0)}
          change="—"
          changeType="neutral"
          icon={FiTrendingUp}
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Impossible de charger les zones
        </p>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-36 sticky left-0 bg-muted/40 z-10">
                  Départ
                </th>
                {activeZones.map((z) => (
                  <th
                    key={z.id}
                    className="px-3 py-3 text-center font-medium min-w-[140px]"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{z.nameFr}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {z.code}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeZones.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(activeZones.length + 1, 2)}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Aucune zone active
                  </td>
                </tr>
              ) : (
                activeZones.map((from) => (
                  <tr key={from.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <span>{from.nameFr}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    {activeZones.map((to) => {
                      const same = from.id === to.id;
                      return (
                        <td key={to.id} className="px-3 py-2 text-center">
                          <div
                            className={`inline-flex items-center justify-center rounded-md border px-2 py-1.5 min-w-[100px] ${
                              same
                                ? "bg-primary/10 border-primary/30"
                                : "bg-amber-500/10 border-amber-500/30"
                            }`}
                          >
                            <Badge variant="outline" className="font-normal">
                              —
                            </Badge>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-muted-foreground border-t">
            Les cells resteront vides jusqu&apos;à un endpoint tarifs livraison.
          </p>
        </div>
      )}
    </div>
  );
}
