"use client";

import { useState } from "react";
import { FiFile, FiTrash2, FiUpload } from "react-icons/fi";
import { Label } from "@/components/ui/label";
import { uploadCatalogueImage, uploadProfileImage } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export type KycDoc = {
  url: string;
  storageKey?: string;
  mimeType?: string;
  name?: string;
  documentType?: string;
};

export function KycDocumentsField({
  docs,
  onChange,
  label = "Pièces KYC",
  hint = "Carte d'identité, registre de commerce ou photo du local — images ou PDF.",
}: {
  docs: KycDoc[];
  onChange: (next: KycDoc[]) => void;
  label?: string;
  hint?: string;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const added: KycDoc[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadCatalogueImage(file, "kyc");
        added.push({
          url: uploaded.secure_url,
          storageKey: uploaded.public_id,
          mimeType: file.type,
          name: file.name,
          documentType: "kyc",
        });
      }
      onChange([...docs, ...added]);
      toast(
        added.length > 1 ? `${added.length} documents ajoutés.` : "Document ajouté.",
        "success"
      );
    } catch (err: any) {
      toast(err?.message || "Upload impossible via UploadThing.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-base font-semibold">{label}</Label>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <label className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background text-sm font-medium hover:border-primary/40">
        <FiUpload className="h-4 w-4" />
        {uploading ? "Envoi UploadThing…" : "Ajouter un fichier ou une image"}
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {docs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {docs.map((doc, i) => (
            <li
              key={`${doc.storageKey || doc.url}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border p-2"
            >
              {doc.mimeType?.startsWith("image/") && doc.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.url} alt="" className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                  <FiFile className="h-4 w-4" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm">{doc.name || "Document"}</span>
              <button
                type="button"
                onClick={() => onChange(docs.filter((_, idx) => idx !== i))}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:underline"
                aria-label="Supprimer cette image"
              >
                <FiTrash2 className="h-4 w-4" />
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ShopCoverField({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  return (
    <div>
      <Label className="text-base font-semibold">Photo de couverture</Label>
      <p className="mt-1 text-xs text-muted-foreground">
        Image de ta boutique, envoyée tout de suite via UploadThing.
      </p>
      <div className="relative mt-2">
        <label className="flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-muted/40">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-muted-foreground">
              {uploading ? "Envoi…" : "Ajouter une image"}
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                const uploaded = await uploadProfileImage(file);
                onChange(uploaded.secure_url);
                toast("Image de couverture ajoutée.", "success");
              } catch (err: any) {
                toast(err?.message || "Upload impossible via UploadThing.", "error");
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            aria-label="Supprimer cette image"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
