"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrder, progressMission } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderChat } from "@/components/order-chat";

const NEXT: Record<string, { status: "COLLECTED" | "IN_TRANSIT" | "DELIVERED"; label: string }> = {
  COURIER_ASSIGNED: { status: "COLLECTED", label: "Marquer collecté" },
  COLLECTED: { status: "IN_TRANSIT", label: "En route vers l'acheteur" },
  IN_TRANSIT: { status: "DELIVERED", label: "Marquer livré" },
};

const STATUS: Record<string, string> = {
  READY_FOR_PICKUP: "À récupérer",
  COURIER_ASSIGNED: "Acceptée",
  COLLECTED: "Collectée",
  IN_TRANSIT: "En livraison",
  DELIVERED: "Livrée — en attente de confirmation acheteur",
  FUNDS_RELEASED: "Terminée",
  DISPUTED: "Litige",
};

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const next = NEXT[data.status];
  const fee = data.shippingCostGnf ?? data.shippingCost ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {data.listing?.title || data.article?.title || "Mission"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Course {fee.toLocaleString("fr-FR")} GNF
          </p>
        </div>
        <Badge variant="secondary">{STATUS[data.status] || data.status}</Badge>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Vendeur : </span>
          {data.seller?.pseudo || "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Acheteur : </span>
          {data.buyer?.pseudo || "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Adresse : </span>
          {data.address?.line || data.address?.city || "Non précisée"}
          {data.address?.phone ? ` · ${data.address.phone}` : ""}
        </p>
        {data.seller?.id && (
          <OrderChat
            orderId={id}
            peerId={data.seller.id}
            peerName={data.seller.pseudo}
          />
        )}
      </div>

      {next ? (
        <Button
          className="rounded-full"
          onClick={async () => {
            await progressMission(id, next.status);
            qc.invalidateQueries({ queryKey: ["order", id] });
            qc.invalidateQueries({ queryKey: ["courier"] });
          }}
        >
          {next.label}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune action livreur restante sur cette mission.
        </p>
      )}
    </div>
  );
}
