"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
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
import { useAdminCatalogStore } from "@/stores/admin-catalog-store";
import {
  SIZE_SCHEMAS,
  sizeSchemaLabels,
  type ListingSizeSchema,
} from "@/lib/listing-catalog";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const {
    catalog,
    addCategory,
    updateCategory,
    removeCategory,
    toggleCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
  } = useAdminCatalogStore();

  const [expanded, setExpanded] = useState<string[]>(["mode", "shoes"]);
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [parentCatId, setParentCatId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const [catId, setCatId] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [catSchema, setCatSchema] = useState<ListingSizeSchema>("clothing");
  const [catEnabled, setCatEnabled] = useState(true);

  const [subId, setSubId] = useState("");
  const [subLabel, setSubLabel] = useState("");
  const [subSchema, setSubSchema] = useState<ListingSizeSchema>("clothing");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        c.subcategories.some(
          (s) => s.label.toLowerCase().includes(q) || s.id.includes(q)
        )
    );
  }, [catalog, search]);

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatId("");
    setCatLabel("");
    setCatSchema("clothing");
    setCatEnabled(true);
  };

  const resetSubForm = () => {
    setEditingSubId(null);
    setParentCatId(null);
    setSubId("");
    setSubLabel("");
    setSubSchema("clothing");
  };

  const openCreateCat = () => {
    resetCatForm();
    setCatOpen(true);
  };

  const openEditCat = (id: string) => {
    const cat = catalog.find((c) => c.id === id);
    if (!cat) return;
    setEditingCatId(id);
    setCatId(cat.id);
    setCatLabel(cat.label);
    setCatSchema(cat.defaultSizeSchema);
    setCatEnabled(cat.enabled);
    setCatOpen(true);
  };

  const saveCat = () => {
    if (!catLabel.trim()) return;
    const id = (editingCatId || catId || slugify(catLabel)).trim();
    if (!id) return;

    if (editingCatId) {
      updateCategory(editingCatId, {
        label: catLabel.trim(),
        defaultSizeSchema: catSchema,
        enabled: catEnabled,
      });
      toast("Catégorie mise à jour", "success");
    } else {
      if (catalog.some((c) => c.id === id)) {
        toast("Cet identifiant existe déjà", "error");
        return;
      }
      addCategory({
        id,
        label: catLabel.trim(),
        defaultSizeSchema: catSchema,
        enabled: catEnabled,
        subcategories: [],
      });
      toast("Catégorie créée", "success");
    }
    setCatOpen(false);
    resetCatForm();
  };

  const openCreateSub = (categoryId: string) => {
    resetSubForm();
    setParentCatId(categoryId);
    const parent = catalog.find((c) => c.id === categoryId);
    setSubSchema(parent?.defaultSizeSchema ?? "clothing");
    setSubOpen(true);
  };

  const openEditSub = (categoryId: string, subIdValue: string) => {
    const cat = catalog.find((c) => c.id === categoryId);
    const sub = cat?.subcategories.find((s) => s.id === subIdValue);
    if (!sub) return;
    setParentCatId(categoryId);
    setEditingSubId(subIdValue);
    setSubId(sub.id);
    setSubLabel(sub.label);
    setSubSchema(sub.sizeSchema);
    setSubOpen(true);
  };

  const saveSub = () => {
    if (!parentCatId || !subLabel.trim()) return;
    const id = (editingSubId || subId || slugify(subLabel)).trim();
    if (!id) return;

    if (editingSubId) {
      updateSubcategory(parentCatId, editingSubId, {
        label: subLabel.trim(),
        sizeSchema: subSchema,
      });
      toast("Sous-catégorie mise à jour", "success");
    } else {
      const parent = catalog.find((c) => c.id === parentCatId);
      if (parent?.subcategories.some((s) => s.id === id)) {
        toast("Cet identifiant existe déjà", "error");
        return;
      }
      addSubcategory(parentCatId, {
        id,
        label: subLabel.trim(),
        sizeSchema: subSchema,
      });
      toast("Sous-catégorie ajoutée", "success");
      setExpanded((p) => (p.includes(parentCatId) ? p : [...p, parentCatId]));
    }
    setSubOpen(false);
    resetSubForm();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Catalogue de catégories"
        description="Taxonomie plateforme (comme listingCatalog dans l'app) — id, schéma de taille, sous-catégories"
        action={
          <Button size="sm" className="gap-2" onClick={openCreateCat}>
            <FiPlus className="h-4 w-4" />
            Catégorie
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une catégorie..."
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {filtered.map((cat) => {
          const isOpen = expanded.includes(cat.id);
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  className="text-muted-foreground"
                  onClick={() =>
                    setExpanded((p) =>
                      p.includes(cat.id)
                        ? p.filter((x) => x !== cat.id)
                        : [...p, cat.id]
                    )
                  }
                >
                  {isOpen ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{cat.label}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {cat.id}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {sizeSchemaLabels[cat.defaultSizeSchema]}
                    </Badge>
                    {!cat.enabled && (
                      <Badge variant="destructive" className="text-[10px]">
                        Désactivée
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cat.subcategories.length} sous-catégorie
                    {cat.subcategories.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={cat.enabled}
                    onCheckedChange={() => {
                      toggleCategory(cat.id);
                      toast(
                        cat.enabled ? "Catégorie désactivée" : "Catégorie activée",
                        "info"
                      );
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openCreateSub(cat.id)}
                  >
                    <FiPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditCat(cat.id)}
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      removeCategory(cat.id);
                      toast("Catégorie supprimée", "warning");
                    }}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isOpen && cat.subcategories.length > 0 && (
                <div className="border-t border-border bg-muted/30 px-4 py-2 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={`${cat.id}-${sub.id}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0 flex-1 pl-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{sub.label}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {sub.id}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {sizeSchemaLabels[sub.sizeSchema]}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditSub(cat.id, sub.id)}
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          removeSubcategory(cat.id, sub.id);
                          toast("Sous-catégorie supprimée", "warning");
                        }}
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
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Aucune catégorie trouvée
          </p>
        )}
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCatId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              Identifiant stable + schéma de taille par défaut (aligné app Flutter).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {!editingCatId && (
              <div className="grid gap-2">
                <Label>Identifiant (id)</Label>
                <Input
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  placeholder="ex. mode"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Libellé</Label>
              <Input
                value={catLabel}
                onChange={(e) => {
                  setCatLabel(e.target.value);
                  if (!editingCatId && !catId) setCatId(slugify(e.target.value));
                }}
                placeholder="Mode & Accessoires"
              />
            </div>
            <div className="grid gap-2">
              <Label>Schéma de taille par défaut</Label>
              <Select
                value={catSchema}
                onValueChange={(v) => setCatSchema(v as ListingSizeSchema)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_SCHEMAS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {sizeSchemaLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label>Activée</Label>
              <Switch checked={catEnabled} onCheckedChange={setCatEnabled} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveCat}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubId ? "Modifier la sous-catégorie" : "Sous-catégorie"}
            </DialogTitle>
            <DialogDescription>
              Chaque sous-catégorie a son propre schéma de taille (ex. pointures EU).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {!editingSubId && (
              <div className="grid gap-2">
                <Label>Identifiant (id)</Label>
                <Input
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  placeholder="ex. women"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Libellé</Label>
              <Input
                value={subLabel}
                onChange={(e) => {
                  setSubLabel(e.target.value);
                  if (!editingSubId && !subId) setSubId(slugify(e.target.value));
                }}
                placeholder="Femme"
              />
            </div>
            <div className="grid gap-2">
              <Label>Schéma de taille</Label>
              <Select
                value={subSchema}
                onValueChange={(v) => setSubSchema(v as ListingSizeSchema)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_SCHEMAS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {sizeSchemaLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveSub}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
