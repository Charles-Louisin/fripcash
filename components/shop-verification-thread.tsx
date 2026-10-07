"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadCatalogueImage } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export type ShopThreadMessage = {
  fromAdmin?: boolean;
  body?: string;
  attachments?: Array<{ url?: string; name?: string; mimeType?: string }>;
  createdAt?: string;
};

export function ShopVerificationThread({
  messages,
  documents,
  onSend,
  onUploadDoc,
  sending,
  readOnly,
  adminView,
}: {
  messages: ShopThreadMessage[];
  documents?: Array<{ url?: string; name?: string }>;
  onSend: (payload: {
    body: string;
    attachments?: Array<{ url: string; storageKey?: string; mimeType?: string; name?: string }>;
  }) => Promise<void>;
  onUploadDoc?: (payload: {
    url: string;
    storageKey?: string;
    mimeType?: string;
    name?: string;
  }) => Promise<void>;
  sending?: boolean;
  readOnly?: boolean;
  adminView?: boolean;
}) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);

  const send = async () => {
    if (!draft.trim()) return;
    await onSend({ body: draft.trim() });
    setDraft("");
  };

  const upload = async (file: File | null, asDoc: boolean) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadCatalogueImage(file, "kyc");
      if (asDoc && onUploadDoc) {
        await onUploadDoc({
          url: uploaded.secure_url,
          storageKey: uploaded.public_id,
          mimeType: file.type,
          name: file.name,
        });
        showToast("Document ajouté", "success");
      } else {
        await onSend({
          body: file.name,
          attachments: [
            {
              url: uploaded.secure_url,
              storageKey: uploaded.public_id,
              mimeType: file.type,
              name: file.name,
            },
          ],
        });
        showToast("Pièce envoyée", "success");
      }
    } catch (e: any) {
      showToast(e.message || "Upload impossible", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {documents && documents.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Pièces jointes
          </p>
          <div className="flex flex-wrap gap-2">
            {documents.map((d, i) =>
              d.url ? (
                <a key={i} href={d.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.url} alt={d.name || ""} className="h-16 w-16 rounded-md object-cover" />
                </a>
              ) : null
            )}
          </div>
        </div>
      )}
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">Aucun message pour le moment.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <p className="text-[10px] uppercase text-muted-foreground">
              {m.fromAdmin ? "Admin" : adminView ? "Vendeur" : "Moi"}
              {m.createdAt
                ? ` · ${new Date(m.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </p>
            {m.body ? <p>{m.body}</p> : null}
            {(m.attachments || []).map((a, j) =>
              a.url ? (
                a.mimeType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={j}
                    src={a.url}
                    alt=""
                    className="mt-1 h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <a
                    key={j}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-primary underline"
                  >
                    {a.name || "Ouvrir"}
                  </a>
                )
              ) : null
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm">
              {uploading ? "Envoi…" : "Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => upload(e.target.files?.[0] || null, false)}
              />
            </label>
            {onUploadDoc && (
              <label className="inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm">
                Document KYC
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => upload(e.target.files?.[0] || null, true)}
                />
              </label>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Écrire un message…"
              className="h-11 rounded-xl"
            />
            <Button
              className="rounded-full"
              disabled={sending || !draft.trim()}
              onClick={send}
            >
              {sending ? "…" : "Envoyer"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
