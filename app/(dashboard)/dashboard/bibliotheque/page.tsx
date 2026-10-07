"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLibraryItem, fetchProductLibrary } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequireShop } from "@/components/dashboard/require-role";
import { useMe } from "@/hooks/use-auth";
import { resolveAccountType } from "@/lib/account-type";
import {
  FeatureLockedNotice,
  ShopVerificationBanner,
} from "@/components/account/shop-verification-banner";

function BibliothequeInner() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { data: user } = useMe();
  const account = resolveAccountType(user);
  const locked = !account.productLibrary;
  const { data = [], isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const raw = await fetchProductLibrary();
      return Array.isArray(raw) ? raw : (raw as any)?.items || [];
    },
  });
  const [title, setTitle] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bibliothèque produits</h1>
        <p className="text-sm text-muted-foreground">Modèles réutilisables — commerce local validé.</p>
      </div>
      {account.requiresAdminApproval && <ShopVerificationBanner type={account} />}
      {locked && <FeatureLockedNotice type={account} feature="Bibliothèque produits" />}
      <div className="flex gap-2">
        <Input className="h-11 rounded-xl" placeholder="Titre du modèle" value={title} onChange={(e) => setTitle(e.target.value)} disabled={locked} />
        <Button
          className="rounded-full"
          disabled={locked}
          onClick={async () => {
            if (locked || !title.trim()) return;
            await createLibraryItem({ title });
            setTitle("");
            qc.invalidateQueries({ queryKey: ["library"] });
            showToast("Modèle créé", "success");
          }}
        >
          Ajouter
        </Button>
      </div>
      {isLoading && <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />}
      <div className="space-y-2">
        {data.map((item: any) => (
          <div key={item.id || item._id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun modèle pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}

export default function BibliothequePage() {
  return (
    <RequireShop library>
      <BibliothequeInner />
    </RequireShop>
  );
}
