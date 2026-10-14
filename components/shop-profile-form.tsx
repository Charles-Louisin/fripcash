"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { FiMapPin, FiPhone, FiPlus, FiZap } from "react-icons/fi";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchZones } from "@/lib/api";
import { readPageDraft, writePageDraft } from "@/lib/page-draft";
import { parseGnMobile } from "@/lib/gn-phone";
import {
  KycDocumentsField,
  ShopCoverField,
  type KycDoc,
} from "@/components/kyc-documents-field";

export type ShopKindApi = "STANDARD" | "PROXIMITE" | "ENSEIGNE";

export type ShopApplicationInput = {
  shopKind: ShopKindApi;
  name: string;
  description: string;
  coverUrl?: string;
  storeAddress?: string;
  soldCategories?: string[];
  deliveredCommunes?: string[];
  deliveryDelay?: string;
  neighborhood?: string;
  landmark?: string;
  orangeMoneyPhone?: string;
  openingTime?: string;
  closingTime?: string;
  documents?: KycDoc[];
};

type ShopFormDraft = {
  name: string;
  description: string;
  coverUrl: string;
  docs: KycDoc[];
  storeAddress: string;
  soldCategories: string[];
  deliveredCommunes: string[];
  deliveryDelay: string;
  neighborhood: string;
  landmark: string;
  orangeMoneyPhone: string;
  openingTime: string;
  closingTime: string;
};

export type ShopProfileFormHandle = {
  submit: () => boolean;
};

export async function finalizeShopApplication(
  body: ShopApplicationInput
): Promise<ShopApplicationInput> {
  const documents = (body.documents || []).filter(
    (doc) => doc.url && !doc.url.startsWith("blob:")
  );
  return {
    ...body,
    description: (body.description || "").trim(),
    coverUrl: body.coverUrl && !body.coverUrl.startsWith("blob:") ? body.coverUrl : undefined,
    documents,
  };
}

const SELL_PRESETS = ["Électroménager", "High-tech", "Mode", "Maison"];
const COMMUNE_PRESETS = ["Ratoma", "Matam", "Dixinn", "Kaloum"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

function TagField({
  label,
  hint,
  presets,
  values,
  onChange,
  single,
}: {
  label: string;
  hint?: string;
  presets: string[];
  values: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const options = [...new Set([...presets, ...values])];

  const toggle = (value: string) => {
    if (single) {
      onChange(values[0] === value ? [] : [value]);
      return;
    }
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  };

  const add = () => {
    const next = draft.trim();
    if (!next) return;
    if (single) onChange([next]);
    else if (!values.includes(next)) onChange([...values, next]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div>
      <Label className="text-base font-semibold">{label}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            active={values.includes(option)}
            onClick={() => toggle(option)}
          />
        ))}
        {adding ? (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Ajouter"
            className="h-10 w-36 rounded-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            <FiPlus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-base font-semibold">{label}</Label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 rounded-2xl pl-11 text-base"
        />
      </div>
    </div>
  );
}

export const ShopProfileForm = forwardRef<
  ShopProfileFormHandle,
  {
    kind: ShopKindApi;
    loading?: boolean;
    submitLabel?: string;
    embedded?: boolean;
    storageKey?: string;
    onDraftChange?: (body: ShopApplicationInput) => void;
    onSubmit: (body: ShopApplicationInput) => void | Promise<void>;
  }
>(function ShopProfileForm(
  {
    kind,
    loading,
    submitLabel = "Envoyer le dossier",
    embedded,
    storageKey,
    onDraftChange,
    onSubmit,
  },
  ref
) {
  const { data: zones = [] } = useQuery({
    queryKey: ["catalog-zones"],
    queryFn: fetchZones,
  });
  const zoneNames = zones
    .filter((zone) => zone.isActive !== false)
    .map((zone) => zone.nameFr);
  const communes = [...new Set([...COMMUNE_PRESETS, ...zoneNames])];

  const draftKey = storageKey ? `${storageKey}:${kind}` : "";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [docs, setDocs] = useState<KycDoc[]>([]);
  const [storeAddress, setStoreAddress] = useState("");
  const [soldCategories, setSoldCategories] = useState<string[]>([
    "Électroménager",
    "High-tech",
  ]);
  const [deliveredCommunes, setDeliveredCommunes] = useState<string[]>([
    "Ratoma",
    "Matam",
    "Dixinn",
  ]);
  const [deliveryDelay, setDeliveryDelay] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [landmark, setLandmark] = useState("");
  const [orangeMoneyPhone, setOrangeMoneyPhone] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [error, setError] = useState("");
  const [draftReady, setDraftReady] = useState(!draftKey);

  const currentDraft = (): ShopApplicationInput => ({
    shopKind: kind,
    name: name.trim(),
    description: description.trim(),
    coverUrl: coverUrl || undefined,
    documents: docs,
    storeAddress: storeAddress.trim() || undefined,
    soldCategories,
    deliveredCommunes,
    deliveryDelay: deliveryDelay.trim() || undefined,
    neighborhood: neighborhood || undefined,
    landmark: landmark.trim() || undefined,
    orangeMoneyPhone: orangeMoneyPhone.trim() || undefined,
    openingTime: openingTime.trim() || undefined,
    closingTime: closingTime.trim() || undefined,
  });

  useEffect(() => {
    if (!draftKey) {
      setDraftReady(true);
      return;
    }
    const saved = readPageDraft<ShopFormDraft>(draftKey);
    if (saved) {
      setName(saved.name || "");
      setDescription(saved.description || "");
      setCoverUrl(saved.coverUrl || "");
      setDocs(saved.docs || []);
      setStoreAddress(saved.storeAddress || "");
      if (saved.soldCategories?.length) setSoldCategories(saved.soldCategories);
      if (saved.deliveredCommunes?.length) setDeliveredCommunes(saved.deliveredCommunes);
      setDeliveryDelay(saved.deliveryDelay || "");
      setNeighborhood(saved.neighborhood || "");
      setLandmark(saved.landmark || "");
      setOrangeMoneyPhone(saved.orangeMoneyPhone || "");
      setOpeningTime(saved.openingTime || "");
      setClosingTime(saved.closingTime || "");
    }
    setDraftReady(true);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftReady) return;
    writePageDraft<ShopFormDraft>(draftKey, {
      name,
      description,
      coverUrl,
      docs,
      storeAddress,
      soldCategories,
      deliveredCommunes,
      deliveryDelay,
      neighborhood,
      landmark,
      orangeMoneyPhone,
      openingTime,
      closingTime,
    });
    onDraftChange?.(currentDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draftReady,
    draftKey,
    name,
    description,
    coverUrl,
    docs,
    storeAddress,
    soldCategories,
    deliveredCommunes,
    deliveryDelay,
    neighborhood,
    landmark,
    orangeMoneyPhone,
    openingTime,
    closingTime,
  ]);

  const buildAndSubmit = () => {
    if (!name.trim()) {
      setError("Indique le nom de la boutique.");
      return;
    }
    if (!description.trim()) {
      setError("Ajoute une description.");
      return;
    }
    if (docs.length === 0) {
      setError("Ajoute au moins une pièce KYC (image ou PDF).");
      return;
    }

    const extras = {
      description: description.trim(),
      coverUrl: coverUrl || undefined,
      documents: docs,
    };

    if (kind === "STANDARD") {
      setError("");
      void onSubmit({ shopKind: "STANDARD", name: name.trim(), ...extras });
      return true;
    }

    if (kind === "ENSEIGNE") {
      if (!storeAddress.trim()) {
        setError("Indique l'adresse du magasin.");
        return;
      }
      if (!soldCategories.length || !deliveredCommunes.length || !deliveryDelay.trim()) {
        setError("Ajoute ce que tu vends, les communes livrées et le délai.");
        return;
      }
      setError("");
      void onSubmit({
        shopKind: "ENSEIGNE",
        name: name.trim(),
        storeAddress: storeAddress.trim(),
        soldCategories,
        deliveredCommunes,
        deliveryDelay: deliveryDelay.trim(),
        ...extras,
      });
      return true;
    }

    if (
      !neighborhood ||
      !landmark.trim() ||
      !orangeMoneyPhone.trim() ||
      !openingTime.trim() ||
      !closingTime.trim()
    ) {
      setError("Remplis le quartier, le repère, le Mobile Money et les horaires.");
      return;
    }
    const payoutPhone = parseGnMobile(orangeMoneyPhone);
    if (!payoutPhone) {
      setError("Le numéro Mobile Money doit être un mobile guinéen Orange (62) ou MTN (65).");
      return;
    }
    setError("");
    void onSubmit({
      shopKind: "PROXIMITE",
      name: name.trim(),
      neighborhood,
      landmark: landmark.trim(),
      orangeMoneyPhone: payoutPhone.e164,
      openingTime: openingTime.trim(),
      closingTime: closingTime.trim(),
      ...extras,
    });
    return true;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    buildAndSubmit();
  };

  useImperativeHandle(ref, () => ({
    submit: () => Boolean(buildAndSubmit()),
  }));

  const fields = (
    <>
      {kind === "STANDARD" && (
        <>
          <Field
            label="Nom de la boutique"
            icon={<HiOutlineBuildingStorefront className="h-4 w-4" />}
            value={name}
            onChange={setName}
            placeholder="Ma boutique"
          />
          <div>
            <Label className="text-base font-semibold">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présente ta boutique et tes articles…"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base"
            />
          </div>
          <ShopCoverField url={coverUrl} onChange={setCoverUrl} />
        </>
      )}
      {kind === "ENSEIGNE" && (
        <>
          <Field
            label="Nom de l'enseigne"
            icon={<HiOutlineBuildingStorefront className="h-4 w-4" />}
            value={name}
            onChange={setName}
            placeholder="Tech Guinée"
          />
          <div>
            <Label className="text-base font-semibold">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présente l'enseigne, ce que tu vends, tes horaires…"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base"
            />
          </div>
          <ShopCoverField url={coverUrl} onChange={setCoverUrl} />
          <Field
            label="Adresse du magasin"
            icon={<FiMapPin className="h-4 w-4 text-red-500" />}
            value={storeAddress}
            onChange={setStoreAddress}
            placeholder="Matam, route Le Prince"
          />
          <TagField
            label="Ce que tu vends"
            presets={SELL_PRESETS}
            values={soldCategories}
            onChange={setSoldCategories}
          />
          <TagField
            label="Communes livrées"
            hint="C'est ce champ qui alimente le filtre « livraison vers »."
            presets={communes}
            values={deliveredCommunes}
            onChange={setDeliveredCommunes}
          />
          <Field
            label="Délai de livraison annoncé"
            icon={<FiZap className="h-4 w-4 text-amber-500" />}
            value={deliveryDelay}
            onChange={setDeliveryDelay}
            placeholder="4 heures"
          />
        </>
      )}
      {kind === "PROXIMITE" && (
        <>
          <Field
            label="Nom de la boutique"
            icon={<HiOutlineBuildingStorefront className="h-4 w-4" />}
            value={name}
            onChange={setName}
            placeholder="Alimentation Bah"
          />
          <div>
            <Label className="text-base font-semibold">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présente ton commerce de quartier…"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base"
            />
          </div>
          <ShopCoverField url={coverUrl} onChange={setCoverUrl} />
          <TagField
            label="Quartier"
            hint="Un seul quartier : c'est ce qui te fera apparaître aux voisins."
            presets={communes}
            values={neighborhood ? [neighborhood] : []}
            onChange={(next) => setNeighborhood(next[0] || "")}
            single
          />
          <Field
            label="Point de repère"
            icon={<FiMapPin className="h-4 w-4" />}
            value={landmark}
            onChange={setLandmark}
            placeholder="rue du marché, en face de la pharmacie"
          />
          <Field
            label="Mobile Money (Orange ou MTN)"
            icon={<FiPhone className="h-4 w-4" />}
            value={orangeMoneyPhone}
            onChange={setOrangeMoneyPhone}
            placeholder="+224 62X XXX XXX"
          />
          <div>
            <Label className="text-base font-semibold">Horaires</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Input
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="08 h 00"
                className="h-14 rounded-2xl text-center text-base"
              />
              <Input
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="22 h 00"
                className="h-14 rounded-2xl text-center text-base"
              />
            </div>
          </div>
        </>
      )}

      <KycDocumentsField docs={docs} onChange={setDocs} />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!embedded && (
        <Button type="submit" className="h-12 w-full rounded-full" disabled={loading}>
          {loading ? "Envoi…" : submitLabel}
        </Button>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{fields}</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {fields}
    </form>
  );
});

export function readShopDetails(source: any) {
  const bags = [
    source,
    source?.shop,
    source?.sellerProfile,
    source?.profile,
    source?.details,
    source?.shopDetails,
  ].filter((item) => item && typeof item === "object");

  const pick = (keys: string[]) => {
    for (const bag of bags) {
      for (const key of keys) {
        const value = bag[key];
        if (value != null && value !== "") return value;
      }
    }
    return undefined;
  };

  const list = (keys: string[]) => {
    const value = pick(keys);
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [] as string[];
  };

  return {
    storeAddress: String(pick(["storeAddress", "address", "shopAddress"]) || ""),
    soldCategories: list(["soldCategories", "categories", "whatYouSell"]),
    deliveredCommunes: list(["deliveredCommunes", "communes", "deliveryCommunes"]),
    deliveryDelay: String(pick(["deliveryDelay", "announcedDelay", "deliverySla"]) || ""),
    neighborhood: String(pick(["neighborhood", "quartier", "district"]) || ""),
    landmark: String(pick(["landmark", "pointDeRepere", "referencePoint"]) || ""),
    orangeMoneyPhone: String(
      pick(["orangeMoneyPhone", "omPhone", "payoutPhone"]) || ""
    ),
    openingTime: String(pick(["openingTime", "opensAt"]) || ""),
    closingTime: String(pick(["closingTime", "closesAt"]) || ""),
    description: String(pick(["shopDescription", "description", "bio"]) || ""),
    coverUrl: String(pick(["coverUrl"]) || ""),
  };
}
