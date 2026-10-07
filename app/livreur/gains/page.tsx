"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCourierGains } from "@/lib/api";

export default function LivreurGainsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["courier", "gains"],
    queryFn: fetchCourierGains,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const entries = data?.entries ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gains</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Disponible</p>
          <p className="text-3xl font-bold">
            {(data?.availableGnf ?? 0).toLocaleString("fr-FR")} GNF
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Frais encaissés</p>
          <p className="text-3xl font-bold">
            {(data?.totalFeesGnf ?? 0).toLocaleString("fr-FR")} GNF
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Courses livrées</p>
          <p className="text-3xl font-bold">{data?.deliveredCount ?? 0}</p>
        </div>
      </div>
      <div className="space-y-2">
        {entries.map((t: any) => (
          <div
            key={t.id}
            className="flex justify-between rounded-xl border border-border p-3 text-sm"
          >
            <span>{t.label}</span>
            <span className={t.isCredit ? "text-emerald-700" : "text-destructive"}>
              {t.isCredit ? "+" : "-"}
              {(t.amountGnf ?? 0).toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun mouvement pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
