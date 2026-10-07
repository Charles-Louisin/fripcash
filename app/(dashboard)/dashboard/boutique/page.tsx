"use client";

import { useState } from "react";
import Link from "next/link";
import { useMe } from "@/hooks/use-auth";
import {
  applyForShop,
  fetchSellerVerification,
  sendSellerVerificationMessage,
  addSellerVerificationDocument,
  uploadCatalogueImage,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveAccountType, verificationLabel } from "@/lib/account-type";
import { ShopVerificationBanner } from "@/components/account/shop-verification-banner";
import { ShopVerificationThread } from "@/components/shop-verification-thread";

const KINDS = [
  { id: "STANDARD" as const, title: "Boutique", desc: "Articles neufs, toute la ville, 8 %." },
  { id: "PROXIMITE" as const, title: "Commerce local", desc: "Quartier, validation admin, 5 %." },
  { id: "ENSEIGNE" as const, title: "Enseigne", desc: "Grande surface, validation, pas d'offres." },
];

function BoutiqueInner() {
  const { data: me, refetch } = useMe();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [kind, setKind] = useState<"STANDARD" | "PROXIMITE" | "ENSEIGNE">("STANDARD");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<
    Array<{ url: string; storageKey?: string; mimeType?: string; name?: string }>
  >([]);
  const { data: verification, refetch: refetchVerif } = useQuery({
    queryKey: ["seller-verification"],
    queryFn: fetchSellerVerification,
  });

  const account = resolveAccountType(me);
  const seller = me?.seller;
  const alreadyShop = account.isShop && account.verificationStatus !== "rejected";

  const submit = async () => {
    if (!name.trim()) {
      showToast("Nom de boutique requis", "error");
      return;
    }
    setLoading(true);
    try {
      await applyForShop({ shopKind: kind, name, description, documents: docs });
      await qc.invalidateQueries({ queryKey: ["me"] });
      await refetch();
      showToast("Dossier envoyé", "success");
    } catch (e: any) {
      showToast(e.message || "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ma boutique</h1>
        <p className="text-sm text-muted-foreground">
          {alreadyShop
            ? "Tu es déjà vendeur. L’équipe valide seulement les outils publics."
            : "Ouvre une boutique, un commerce local ou une enseigne."}
        </p>
      </div>

      {alreadyShop && (
        <>
          <ShopVerificationBanner type={account} />
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="font-semibold text-foreground">
              {seller?.shopName || me?.pseudo || account.label}
            </p>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{account.label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Validation</dt>
                <dd className="font-medium">
                  {verificationLabel(account.verificationStatus)}
                </dd>
              </div>
              {account.destination && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Univers</dt>
                  <dd className="font-medium">{account.destination}</dd>
                </div>
              )}
            </dl>
            {(account.verificationStatus === "pending" ||
              account.verificationStatus === "rejected") && (
              <div className="pt-3">
                <p className="text-sm font-semibold mb-2">Discussion avec l&apos;admin</p>
                <ShopVerificationThread
                  messages={verification?.messages || []}
                  documents={verification?.documents || []}
                  sending={loading}
                  onSend={async (payload) => {
                    await sendSellerVerificationMessage(payload);
                    await refetchVerif();
                  }}
                  onUploadDoc={async (payload) => {
                    await addSellerVerificationDocument(payload);
                    await refetchVerif();
                  }}
                />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/dashboard/boutique/demande"
                className="text-primary text-sm underline"
              >
                Dossier de validation
              </Link>
              <Link
                href="/dashboard/articles"
                className="text-primary text-sm underline"
              >
                Mes articles
              </Link>
              <Link
                href="/dashboard/boutique/reglages"
                className="text-primary text-sm underline"
              >
                Réglages
              </Link>
              {account.seesExcel && (
                <Link
                  href="/dashboard/import-excel"
                  className="text-primary text-sm underline"
                >
                  Import Excel{account.excelImport ? "" : " (verrouillé)"}
                </Link>
              )}
              {account.seesLibrary && (
                <Link
                  href="/dashboard/bibliotheque"
                  className="text-primary text-sm underline"
                >
                  Bibliothèque{account.productLibrary ? "" : " (verrouillée)"}
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {!alreadyShop && (
        <>
          {account.verificationStatus === "rejected" && (
            <ShopVerificationBanner type={account} />
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={`rounded-xl border p-4 text-left ${
                  kind === k.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p className="font-semibold">{k.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input
                className="mt-1 h-11 rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1 h-11 rounded-xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Pièces KYC</Label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="mt-1 block text-sm"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const uploaded = await uploadCatalogueImage(file, "kyc");
                    setDocs((prev) => [
                      ...prev,
                      {
                        url: uploaded.secure_url,
                        storageKey: uploaded.public_id,
                        mimeType: file.type,
                        name: file.name,
                      },
                    ]);
                    showToast("Document ajouté", "success");
                  } catch (err: any) {
                    showToast(err.message || "Upload impossible", "error");
                  }
                }}
              />
              {docs.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {docs.length} fichier{docs.length > 1 ? "s" : ""} joint
                  {docs.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <Button className="rounded-full" disabled={loading} onClick={submit}>
              {loading ? "Envoi…" : "Envoyer le dossier"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BoutiquePage() {
  return <BoutiqueInner />;
}
