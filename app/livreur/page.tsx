"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptMission,
  fetchCourierMe,
  fetchCourierMissions,
  fetchOpenMissions,
  updateCourierAvailability,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  return [];
}

const STATUS: Record<string, string> = {
  READY_FOR_PICKUP: "À récupérer",
  COURIER_ASSIGNED: "Acceptée",
  COLLECTED: "Collectée",
  IN_TRANSIT: "En livraison",
  DELIVERED: "Livrée",
  FUNDS_RELEASED: "Terminée",
  DISPUTED: "Litige",
};

export default function LivreurHomePage() {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["courier", "me"], queryFn: fetchCourierMe });
  const open = useQuery({
    queryKey: ["courier", "open"],
    queryFn: async () => asArray(await fetchOpenMissions()),
  });
  const mine = useQuery({
    queryKey: ["courier", "mine"],
    queryFn: async () => asArray(await fetchCourierMissions()),
  });

  const active = (mine.data || []).filter((o) =>
    ["COURIER_ASSIGNED", "COLLECTED", "IN_TRANSIT"].includes(o.status)
  );
  const done = (mine.data || []).filter((o) =>
    ["DELIVERED", "FUNDS_RELEASED", "FEEDBACK_PENDING"].includes(o.status)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Missions</h1>
          <p className="text-sm text-muted-foreground">{me.data?.name}</p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={async () => {
            await updateCourierAvailability(!me.data?.courier?.isAvailable);
            qc.invalidateQueries({ queryKey: ["courier", "me"] });
          }}
        >
          {me.data?.courier?.isAvailable ? "Disponible" : "Indisponible"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Ouvertes</p>
          <p className="text-2xl font-bold">{open.data?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">En cours</p>
          <p className="text-2xl font-bold">{active.length}</p>
        </div>
        <div className="rounded-xl border border-border p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Livrées</p>
          <p className="text-2xl font-bold">{done.length}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Ouvertes
        </h2>
        {open.data?.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">
                {o.listing?.title || o.article?.title || "Course"}
              </p>
              <p className="text-xs text-muted-foreground">
                {(o.shippingCostGnf || 0).toLocaleString("fr-FR")} GNF de course
                {o.address?.city ? ` · ${o.address.city}` : ""}
              </p>
            </div>
            <Button
              className="rounded-full shrink-0"
              onClick={async () => {
                await acceptMission(o.id);
                qc.invalidateQueries({ queryKey: ["courier"] });
              }}
            >
              Accepter
            </Button>
          </div>
        ))}
        {open.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">Pas de mission ouverte.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Mes courses
        </h2>
        {mine.data?.map((o) => (
          <Link
            key={o.id}
            href={`/livreur/missions/${o.id}`}
            className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/40"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">
                {o.listing?.title || o.article?.title || "Course"}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.address?.line || o.address?.city || "Adresse non précisée"}
              </p>
            </div>
            <Badge variant="secondary">{STATUS[o.status] || o.status}</Badge>
          </Link>
        ))}
        {mine.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune course assignée.</p>
        )}
      </section>
    </div>
  );
}
