"use client";

import { useState } from "react";
import {
  useAddDisputeEvidence,
  useAddDisputeMessage,
  useCloseDispute,
  useDisputes,
  useReopenDispute,
} from "@/hooks/use-disputes";
import { uploadCatalogueImage } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe } from "@/hooks/use-auth";

function normalizeId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as { id?: unknown; _id?: unknown };
    if (o.id) return String(o.id);
    if (o._id) return String(o._id);
  }
  const raw = String(value);
  return raw === "[object Object]" ? "" : raw;
}

function senderLabel(m: any, d: any, currentUserId?: string) {
  if (m.fromAdmin || m.senderRole === "admin") return "Admin";
  const me = normalizeId(currentUserId);
  const buyerId = normalizeId(d.buyerId);
  const sellerId = normalizeId(d.sellerId);
  const role =
    m.senderRole === "seller" || m.senderRole === "buyer"
      ? m.senderRole
      : normalizeId(m.senderId) === sellerId
        ? "seller"
        : normalizeId(m.senderId) === buyerId
          ? "buyer"
          : "";
  const myRole = me && me === sellerId ? "seller" : me && me === buyerId ? "buyer" : "";
  if (role && myRole && role === myRole) return "Toi";
  if (role === "seller") return d.sellerName || m.senderName || "Vendeur";
  if (role === "buyer") return d.buyerName || m.senderName || "Acheteur";
  return m.senderName || "Utilisateur";
}

function buildThread(d: any, currentUserId?: string) {
  const messages = (d.messages || []).map((m: any) => ({
    at: m.createdAt || m.capturedAt || d.createdAt,
    type: "message" as const,
    sender: senderLabel(m, d, currentUserId),
    body: m.body,
    kind: m.kind,
    attachments: m.attachments || [],
  }));
  const evidence = (d.evidence || []).map((e: any) => ({
    at: e.capturedAt || e.createdAt || d.createdAt,
    type: "evidence" as const,
    sender:
      e.uploaderRole === "admin"
        ? "Admin"
        : e.uploaderRole === "seller"
          ? d.sellerName || "Vendeur"
          : d.buyerName || "Acheteur",
    url: e.url,
    body: "",
    attachments: [],
  }));
  return [...messages, ...evidence].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

export default function LitigesPage() {
  const { data: disputes = [], isLoading } = useDisputes();
  const { data: me } = useMe();
  const addEvidence = useAddDisputeEvidence();
  const addMessage = useAddDisputeMessage();
  const closeDispute = useCloseDispute();
  const reopenDispute = useReopenDispute();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const currentUserId = normalizeId(me?.id || (me as any)?._id);

  const onPhoto = async (id: string, file: File | null) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [id]: true }));
    try {
      const uploaded = await uploadCatalogueImage(file, "disputes");
      await addEvidence.mutateAsync({
        id,
        url: uploaded.secure_url,
        storageKey: uploaded.public_id,
        uploaderRole:
          normalizeId(
            disputes.find((row: any) => row.id === id)?.sellerId
          ) === currentUserId
            ? "seller"
            : "buyer",
      });
      showToast("Preuve ajoutée", "success");
    } catch (e: any) {
      showToast(e.message || "Upload impossible", "error");
    } finally {
      setUploading((p) => ({ ...p, [id]: false }));
    }
  };

  const onInfoFile = async (id: string, file: File | null) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [id]: true }));
    try {
      const uploaded = await uploadCatalogueImage(file, "disputes");
      await addMessage.mutateAsync({
        id,
        body: `Pièce jointe : ${file.name}`,
        kind: "info_response",
        attachments: [
          {
            url: uploaded.secure_url,
            storageKey: uploaded.public_id,
            mimeType: file.type,
            name: file.name,
          },
        ],
      });
      showToast("Document envoyé", "success");
    } catch (e: any) {
      showToast(e.message || "Envoi impossible", "error");
    } finally {
      setUploading((p) => ({ ...p, [id]: false }));
    }
  };

  const sendText = async (id: string, kind: string) => {
    if (!draft[id]) return;
    try {
      await addMessage.mutateAsync({
        id,
        body: draft[id],
        kind,
      });
      setDraft((p) => ({ ...p, [id]: "" }));
      showToast("Message envoyé", "success");
    } catch (e: any) {
      showToast(e.message || "Envoi impossible", "error");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Litiges</h1>
        <p className="text-sm text-muted-foreground">
          Réponds aux demandes de l&apos;admin et joins tes preuves.
        </p>
      </div>
      {disputes.length === 0 && (
        <p className="rounded-xl border border-border p-8 text-sm text-muted-foreground">
          Aucun litige ouvert. Tu peux en ouvrir un depuis une commande.
        </p>
      )}
      {disputes.map((d: any) => {
        const requests = (d.messages || []).filter(
          (m: any) => m.kind === "info_request"
        );
        const thread = buildThread(d, currentUserId);
        const closed = d.status === "closed";
        const resolved = d.status === "resolved";
        return (
          <div key={d.id} className="space-y-3 rounded-xl border border-border p-5">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{d.reason}</p>
              <span className="text-xs uppercase text-muted-foreground">{d.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">Commande {d.orderId}</p>
            {requests.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm">
                <p className="text-xs font-bold uppercase text-amber-800">
                  Demandes de l&apos;admin
                </p>
                {requests.map((m: any, i: number) => (
                  <p key={i} className="mt-1">
                    {m.body}
                  </p>
                ))}
              </div>
            )}
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
              {thread.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun message</p>
              )}
              {thread.map((item, i) => (
                <div key={i} className="text-sm">
                  <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                    {item.sender}
                    {item.at
                      ? ` · ${new Date(item.at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </p>
                  {item.body ? <p>{item.body}</p> : null}
                  {item.type === "evidence" && item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="mt-1 h-20 w-20 rounded-lg object-cover"
                    />
                  ) : null}
                  {(item.attachments || []).map((a: any, j: number) =>
                    a.mimeType?.startsWith("image/") ||
                    /\.(png|jpe?g|webp|gif)$/i.test(a.url || "") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={j}
                        src={a.url}
                        alt=""
                        className="mt-1 h-20 w-20 rounded-lg object-cover"
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
                  )}
                </div>
              ))}
            </div>
            {!resolved && (
              <>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-primary px-4 text-sm font-medium text-white">
                    {uploading[d.id] ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      "Ajouter une photo"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={uploading[d.id] || closed}
                      onChange={(ev) => onPhoto(d.id, ev.target.files?.[0] || null)}
                    />
                  </label>
                  <label className="inline-flex h-10 cursor-pointer items-center rounded-full border border-border px-4 text-sm font-medium">
                    {uploading[d.id] ? "Envoi…" : "Document"}
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      disabled={uploading[d.id] || closed}
                      onChange={(ev) =>
                        onInfoFile(d.id, ev.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {closed ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={reopenDispute.isPending}
                      onClick={async () => {
                        try {
                          await reopenDispute.mutateAsync(d.id);
                          showToast("Litige rouvert", "success");
                        } catch (e: any) {
                          showToast(e.message || "Impossible de rouvrir", "error");
                        }
                      }}
                    >
                      {reopenDispute.isPending ? "…" : "Rouvrir"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={closeDispute.isPending}
                      onClick={async () => {
                        try {
                          await closeDispute.mutateAsync(d.id);
                          showToast("Litige fermé", "success");
                        } catch (e: any) {
                          showToast(e.message || "Impossible de fermer", "error");
                        }
                      }}
                    >
                      {closeDispute.isPending ? "…" : "Fermer"}
                    </Button>
                  )}
                </div>
                {!closed && (
                  <div className="flex gap-2">
                    <Input
                      value={draft[d.id] || ""}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, [d.id]: e.target.value }))
                      }
                      placeholder="Répondre à l'enquête…"
                      className="h-11 rounded-xl"
                    />
                    <Button
                      className="rounded-full"
                      disabled={addMessage.isPending || !draft[d.id]}
                      onClick={() =>
                        sendText(d.id, requests.length ? "info_response" : "text")
                      }
                    >
                      {addMessage.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        "Envoyer"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
