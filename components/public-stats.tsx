"use client";

import { usePublicStats } from "@/hooks/use-admin";

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  return n.toString();
}

export function PublicStats() {
  const { data } = usePublicStats();

  const stats = [
    { value: data ? formatCount(data.totalUsers) : "—", label: "Utilisateurs actifs" },
    { value: data ? formatCount(data.totalSold) : "—", label: "Articles vendus" },
    { value: data ? `${data.avgRating || 0}/5` : "—", label: "Note moyenne" },
    { value: data ? formatCount(data.totalArticles) : "—", label: "Articles en ligne" },
  ];

  return (
    <div className="bg-primary/5 rounded-2xl p-8 sm:p-12">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        FripCash en chiffres
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
