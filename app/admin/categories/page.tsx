"use client";

import { useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
  useAdminCatalogCategories,
  useAdminCategoryMutations,
} from "@/hooks/use-admin";
import type { CatalogCategory, ListingDestination } from "@/lib/api";
import { ApiError, uploadCatalogueImage } from "@/lib/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiLayers,
  FiFolder,
  FiFolderPlus,
  FiCheckCircle,
  FiImage,
  FiX,
} from "react-icons/fi";

const DESTINATIONS: ListingDestination[] = [
  "SECONDE_MAIN",
  "ARTICLES_NEUFS",
  "QUARTIER_BOUTIQUES",
  "ENSEIGNES",
];

const destLabels: Record<ListingDestination, string> = {
  SECONDE_MAIN: "Seconde main",
  ARTICLES_NEUFS: "Articles neufs",
  QUARTIER_BOUTIQUES: "Quartier boutiques",
  ENSEIGNES: "Enseignes",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories = [], isLoading, isError } =
    useAdminCatalogCategories();
  const { create, update, remove } = useAdminCategoryMutations();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [destination, setDestination] =
    useState<ListingDestination>("SECONDE_MAIN");
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const roots = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const stats = useMemo(() => {
    const subs = categories.filter((c) => !!c.parentId);
    const active = categories.filter((c) => c.isActive);
    return {
      total: categories.length,
      roots: roots.length,
      subs: subs.length,
      active: active.length,
    };
  }, [categories, roots]);

  const childrenOf = (id: string) =>
    categories.filter((c) => c.parentId === id);

  const filteredRoots = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return roots;
    return roots.filter((r) => {
      const kids = childrenOf(r.id);
      return (
        r.nameFr.toLowerCase().includes(q) ||
        r.slug.includes(q) ||
        kids.some((k) => k.nameFr.toLowerCase().includes(q))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roots, categories, search]);

  const resetForm = () => {
    setEditingId(null);
    setParentId(null);
    setNameFr("");
    setNameEn("");
    setSlug("");
    setDestination("SECONDE_MAIN");
    setIsActive(true);
    setImagePreview(null);
    setImageFile(null);
    setClearImage(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const openCreate = (parent?: CatalogCategory) => {
    resetForm();
    if (parent) {
      setParentId(parent.id);
      setDestination(parent.destination);
    }
    setOpen(true);
  };

  const openEdit = (cat: CatalogCategory) => {
    setEditingId(cat.id);
    setParentId(cat.parentId);
    setNameFr(cat.nameFr);
    setNameEn(cat.nameEn);
    setSlug(cat.slug);
    setDestination(cat.destination);
    setIsActive(cat.isActive);
    setImagePreview(cat.imageUrl || null);
    setImageFile(null);
    setClearImage(false);
    setOpen(true);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setClearImage(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const onClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setClearImage(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!nameFr.trim()) {
      toast("Nom requis", "error");
      return;
    }
    setSaving(true);
    try {
      // Nest PATCH validates the full category shape (image-only fails).
      const body: {
        parentId?: string | null;
        nameFr: string;
        nameEn: string;
        slug: string;
        destination: ListingDestination;
        isActive: boolean;
        imageUrl?: string | null;
        imagePublicId?: string | null;
      } = {
        parentId: parentId || null,
        nameFr: nameFr.trim(),
        nameEn: (nameEn || nameFr).trim(),
        slug: slug.trim() || slugify(nameFr),
        destination,
        isActive,
      };

      if (imageFile) {
        const uploaded = await uploadCatalogueImage(imageFile, "categories");
        body.imageUrl = uploaded.secure_url;
        body.imagePublicId = uploaded.public_id;
      } else if (clearImage) {
        body.imageUrl = null;
        body.imagePublicId = null;
      }

      if (editingId) {
        await update.mutateAsync({ id: editingId, ...body });
        toast("Catégorie mise à jour", "success");
      } else {
        await create.mutateAsync(body);
        toast("Catégorie créée", "success");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Erreur enregistrement",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CatalogCategory) => {
    try {
      await remove.mutateAsync(cat.id);
      toast(`« ${cat.nameFr} » supprimée`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Suppression impossible",
        "error"
      );
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Catégories"
        description="Catalogue live — images Cloudinary (créer / remplacer / supprimer depuis le formulaire)."
        action={
          <Button size="sm" onClick={() => openCreate()}>
            <FiPlus className="h-4 w-4 mr-1" /> Nouvelle catégorie
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total en base"
          value={isLoading ? "…" : String(stats.total)}
          description="Parents + enfants"
          icon={FiLayers}
        />
        <StatCard
          label="Catégories racines"
          value={isLoading ? "…" : String(stats.roots)}
          description="Sans parent"
          icon={FiFolder}
        />
        <StatCard
          label="Sous-catégories"
          value={isLoading ? "…" : String(stats.subs)}
          description="Avec parentId"
          icon={FiFolderPlus}
        />
        <StatCard
          label="Actives"
          value={isLoading ? "…" : String(stats.active)}
          description={`${Math.max(stats.total - stats.active, 0)} inactive(s)`}
          icon={FiCheckCircle}
        />
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Impossible de charger les catégories
        </p>
      ) : filteredRoots.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Aucune catégorie en base
        </p>
      ) : (
        <div className="space-y-2">
          {filteredRoots.map((cat) => {
            const kids = childrenOf(cat.id);
            const openRow = expanded.includes(cat.id);
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    className="p-1 text-muted-foreground"
                    onClick={() => toggleExpand(cat.id)}
                  >
                    {kids.length > 0 ? (
                      openRow ? (
                        <FiChevronDown className="h-4 w-4" />
                      ) : (
                        <FiChevronRight className="h-4 w-4" />
                      )
                    ) : (
                      <span className="w-4 inline-block" />
                    )}
                  </button>
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt=""
                      className="h-9 w-9 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-md bg-muted border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{cat.nameFr}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {cat.slug}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {destLabels[cat.destination] || cat.destination}
                  </Badge>
                  <Badge variant={cat.isActive ? "default" : "outline"}>
                    {cat.isActive ? "Active" : "Off"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openCreate(cat)}
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(cat)}
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(cat)}
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {openRow && kids.length > 0 && (
                  <div className="border-t border-border bg-muted/20 px-3 py-2 space-y-1">
                    {kids.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 py-1.5 pl-8"
                      >
                        {sub.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sub.imageUrl}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover border border-border"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-muted border border-border" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{sub.nameFr}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {sub.slug}
                          </p>
                        </div>
                        <Badge
                          variant={sub.isActive ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {sub.isActive ? "Active" : "Off"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(sub)}
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(sub)}
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "Modifier la catégorie"
                : parentId
                  ? "Sous-catégorie"
                  : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              Image : sign Cloudinary → upload →{" "}
              <code className="text-xs">imageUrl</code> /{" "}
              <code className="text-xs">imagePublicId</code> en base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Image</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground">
                    <FiImage className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {imagePreview ? "Remplacer" : "Choisir une image"}
                  </Button>
                  {imagePreview || clearImage ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="justify-start text-destructive h-8 px-2"
                      onClick={onClearImage}
                    >
                      <FiX className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  ) : null}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onPickImage}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Nom (FR)</Label>
              <Input
                value={nameFr}
                onChange={(e) => {
                  setNameFr(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <Label>Nom (EN)</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div>
              <Label>Destination</Label>
              <Select
                value={destination}
                onValueChange={(v) =>
                  setDestination(v as ListingDestination)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {destLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || create.isPending || update.isPending}
            >
              {saving ? "Envoi…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
