"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { formatGnf } from "@/lib/admin-platform";
import { FiGrid, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import {
  useAdminCatalogZones,
  useAdminTariffs,
  useSaveAdminTariffs,
} from "@/hooks/use-admin";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

export default function AdminShippingRatesPage() {
  const { toast } = useToast();
  const { data: zones = [], isLoading, isError } = useAdminCatalogZones();
  const { data: tariffs = [] } = useAdminTariffs();
  const save = useSaveAdminTariffs();

  const activeZones = useMemo(
    () => zones.filter((z) => z.isActive),
    [zones]
  );

  const [grid, setGrid] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    const list = Array.isArray(tariffs) ? tariffs : [];
    for (const t of list as any[]) {
      next[`${t.fromZoneId}:${t.toZoneId}`] = String(t.amountGnf ?? "");
    }
    setGrid(next);
  }, [tariffs]);

  const amounts = Object.values(grid)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);
  const avg = amounts.length
    ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
    : 0;
  const min = amounts.length ? Math.min(...amounts) : 0;
  const max = amounts.length ? Math.max(...amounts) : 0;

  const handleSave = async () => {
    const items: Array<{ fromZoneId: string; toZoneId: string; amountGnf: number }> =
      [];
    for (const from of activeZones) {
      for (const to of activeZones) {
        const raw = grid[`${from.id}:${to.id}`];
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 0) {
          items.push({ fromZoneId: from.id, toZoneId: to.id, amountGnf: n });
        }
      }
    }
    try {
      await save.mutateAsync(items);
      toast("Tarifs enregistrés", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Enregistrement impossible",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tarifs livraison"
        description="Frais de course par zone, appliqués aux livraisons via livreur."
        action={
          <Button size="sm" onClick={handleSave} disabled={save.isPending}>
            Enregistrer
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tarif moyen"
          value={formatGnf(avg)}
          change={amounts.length ? `${amounts.length} trajets` : "Aucune grille"}
          changeType="neutral"
          icon={FiGrid}
        />
        <StatCard
          title="Tarif minimum"
          value={formatGnf(min)}
          change="—"
          changeType="positive"
          icon={FiTrendingDown}
        />
        <StatCard
          title="Tarif maximum"
          value={formatGnf(max)}
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
                      const key = `${from.id}:${to.id}`;
                      const same = from.id === to.id;
                      return (
                        <td key={to.id} className="px-3 py-2 text-center">
                          <div
                            className={`inline-flex items-center justify-center rounded-md border px-2 py-1.5 min-w-[100px] ${
                              same
                                ? "bg-primary/10 border-primary/30"
                                : "bg-muted/30 border-border"
                            }`}
                          >
                            <input
                              type="number"
                              min={0}
                              value={grid[key] ?? ""}
                              onChange={(e) =>
                                setGrid((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder="GNF"
                              className="w-24 bg-transparent text-center text-sm outline-none"
                            />
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
            Ces tarifs s&apos;affichent sur les livraisons via livreur. Les vendeurs ne
            les définissent plus.
          </p>
        </div>
      )}
    </div>
  );
}
