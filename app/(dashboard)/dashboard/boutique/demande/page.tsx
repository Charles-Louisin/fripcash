"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSellerVerification,
  sendSellerVerificationMessage,
  addSellerVerificationDocument,
} from "@/lib/api";
import { ShopVerificationThread } from "@/components/shop-verification-thread";
import { ShopVerificationBanner } from "@/components/account/shop-verification-banner";
import { useMe } from "@/hooks/use-auth";
import { resolveAccountType, verificationLabel } from "@/lib/account-type";

export default function BoutiqueDemandePage() {
  const { data: me } = useMe();
  const account = resolveAccountType(me);
  const qc = useQueryClient();
  const { data: verification, isLoading } = useQuery({
    queryKey: ["seller-verification"],
    queryFn: fetchSellerVerification,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/boutique" className="text-sm text-primary underline">
          ← Ma boutique
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Dossier de validation</h1>
        <p className="text-sm text-muted-foreground">
          Statut : {verificationLabel(account.verificationStatus)} — échange avec
          l&apos;admin même si la boutique n&apos;est pas encore validée.
        </p>
      </div>
      <ShopVerificationBanner type={account} />
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <ShopVerificationThread
          messages={verification?.messages || []}
          documents={verification?.documents || []}
          onSend={async (payload) => {
            await sendSellerVerificationMessage(payload);
            await qc.invalidateQueries({ queryKey: ["seller-verification"] });
          }}
          onUploadDoc={async (payload) => {
            await addSellerVerificationDocument(payload);
            await qc.invalidateQueries({ queryKey: ["seller-verification"] });
          }}
        />
      )}
    </div>
  );
}
