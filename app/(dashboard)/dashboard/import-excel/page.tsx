"use client";

import { useState } from "react";
import { queueExcelImport, uploadCatalogueImage } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { RequireShop } from "@/components/dashboard/require-role";
import { useMe } from "@/hooks/use-auth";
import { resolveAccountType } from "@/lib/account-type";
import {
  FeatureLockedNotice,
  ShopVerificationBanner,
} from "@/components/account/shop-verification-banner";

function ImportExcelInner() {
  const { showToast } = useToast();
  const { data: user } = useMe();
  const account = resolveAccountType(user);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = !account.excelImport;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Import Excel</h1>
      <p className="text-sm text-muted-foreground">
        Réservé aux boutiques validées. Envoie un fichier catalogue, puis on lance l&apos;import.
      </p>
      {account.requiresAdminApproval && <ShopVerificationBanner type={account} />}
      {locked && <FeatureLockedNotice type={account} feature="Import Excel" />}
      <input
        type="file"
        accept=".xlsx,.xls"
        disabled={locked || busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || locked) return;
          setBusy(true);
          try {
            const up = await uploadCatalogueImage(file as File, "excel");
            setKey(up.public_id);
            showToast("Fichier envoyé", "success");
          } catch (err: any) {
            showToast(err.message || "Upload impossible", "error");
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button
        className="rounded-full"
        disabled={locked || !key || busy}
        onClick={async () => {
          await queueExcelImport(key);
          showToast("Import enregistré", "success");
        }}
      >
        Lancer l&apos;import
      </Button>
    </div>
  );
}

export default function ImportExcelPage() {
  return (
    <RequireShop excel>
      <ImportExcelInner />
    </RequireShop>
  );
}
