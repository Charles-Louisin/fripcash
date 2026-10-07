"use client";

import { useMyOffers, useRespondToOffer } from "@/hooks/use-offers";
import { useMe } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export default function OffresPage() {
  const { data: me } = useMe();
  const { data: offers = [], isLoading } = useMyOffers();
  const respond = useRespondToOffer();
  const { showToast } = useToast();
  const uid = me?.id;

  const received = offers.filter((o: any) => o.sellerId === uid);
  const sent = offers.filter((o: any) => o.buyerId === uid);

  const act = async (id: string, action: "accept" | "reject") => {
    try {
      await respond.mutateAsync({ id, action });
      showToast(action === "accept" ? "Offre acceptée" : "Offre refusée", "success");
    } catch (e: any) {
      showToast(e.message || "Erreur", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Offres</h1>
        <p className="text-sm text-muted-foreground">Négociations envoyées et reçues</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Reçues
        </h2>
        {received.length === 0 && (
          <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">
            Aucune offre reçue.
          </p>
        )}
        {received.map((o: any) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="font-medium">{o.amountGnf?.toLocaleString("fr-FR")} GNF</p>
              <p className="text-xs text-muted-foreground">{o.message || "Sans message"} · {o.status}</p>
            </div>
            {o.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full" onClick={() => act(o.id, "accept")}>
                  Accepter
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => act(o.id, "reject")}>
                  Refuser
                </Button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Envoyées
        </h2>
        {sent.length === 0 && (
          <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">
            Tu n&apos;as pas encore fait d&apos;offre.
          </p>
        )}
        {sent.map((o: any) => (
          <div key={o.id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{o.amountGnf?.toLocaleString("fr-FR")} GNF</p>
            <p className="text-xs text-muted-foreground">{o.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
