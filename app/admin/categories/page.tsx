"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAllCategories } from "@/hooks/use-categories";
import { categoriesApi } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";

type EditLevel = "category" | "subGroup" | "item";

interface SheetState {
  open: boolean;
  level: EditLevel;
  editing: boolean;
  // For category-level edits
  categoryDbId?: string;
  // For subGroup-level: which category and which subGroup index
  parentCategoryDbId?: string;
  subGroupIndex?: number;
  // For item-level: which subGroup index and item index
  parentSubGroupIndex?: number;
  itemIndex?: number;
  // Form fields
  name: string;
  slug: string;
  enabled: boolean;
}

const emptySheet: SheetState = {
  open: false,
  level: "category",
  editing: false,
  name: "",
  slug: "",
  enabled: true,
};

export default function CategoriesPage() {
  const { showToast: toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useAllCategories();

  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<SheetState>(emptySheet);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    name: string;
    onConfirm: (() => void) | null;
  }>({ open: false, name: "", onConfirm: null });

  // Refresh data from API
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["categories", "all"] });

  // ── Expand/collapse ──
  const toggleCat = (id: string) =>
    setExpandedCats((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleSub = (key: string) =>
    setExpandedSubs((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  // ── Toggle enabled ──
  const toggleEnabled = async (cat: any) => {
    try {
      await categoriesApi.update(cat._id, { enabled: !cat.enabled });
      toast(cat.enabled ? `${cat.name} désactivée.` : `${cat.name} activée.`, "info");
      refresh();
    } catch {
      toast("Erreur lors de la mise à jour.", "error");
    }
  };

  // ── Delete category ──
  const askDeleteCategory = (cat: any) => {
    setDeleteConfirm({
      open: true,
      name: cat.name,
      onConfirm: async () => {
        const prev = queryClient.getQueryData(["categories", "all"]);
        queryClient.setQueryData(["categories", "all"], (old: any) =>
          Array.isArray(old) ? old.filter((c: any) => c._id !== cat._id) : old
        );
        setDeleteConfirm({ open: false, name: "", onConfirm: null });
        try {
          await categoriesApi.delete(cat._id);
          toast(`${cat.name} supprimée.`, "info");
          refresh();
        } catch {
          queryClient.setQueryData(["categories", "all"], prev);
          toast("Erreur lors de la suppression.", "error");
        }
      },
    });
  };

  // ── Delete subGroup ──
  const askDeleteSubGroup = (cat: any, subIndex: number, subName: string) => {
    setDeleteConfirm({
      open: true,
      name: subName,
      onConfirm: async () => {
        const newSubGroups = cat.subGroups.filter((_: any, i: number) => i !== subIndex);
        const prev = queryClient.getQueryData(["categories", "all"]);
        queryClient.setQueryData(["categories", "all"], (old: any) =>
          Array.isArray(old)
            ? old.map((c: any) =>
                c._id === cat._id ? { ...c, subGroups: newSubGroups } : c
              )
            : old
        );
        setDeleteConfirm({ open: false, name: "", onConfirm: null });
        try {
          await categoriesApi.update(cat._id, { subGroups: newSubGroups });
          toast("Sous-catégorie supprimée.", "info");
          refresh();
        } catch {
          queryClient.setQueryData(["categories", "all"], prev);
          toast("Erreur lors de la suppression.", "error");
        }
      },
    });
  };

  // ── Delete item ──
  const askDeleteItem = (cat: any, subIndex: number, itemIndex: number, itemName: string) => {
    setDeleteConfirm({
      open: true,
      name: itemName,
      onConfirm: async () => {
        const newSubGroups = cat.subGroups.map((sg: any, si: number) => {
          if (si !== subIndex) return sg;
          return {
            ...sg,
            items: sg.items.filter((_: any, ii: number) => ii !== itemIndex),
          };
        });
        const prev = queryClient.getQueryData(["categories", "all"]);
        queryClient.setQueryData(["categories", "all"], (old: any) =>
          Array.isArray(old)
            ? old.map((c: any) =>
                c._id === cat._id ? { ...c, subGroups: newSubGroups } : c
              )
            : old
        );
        setDeleteConfirm({ open: false, name: "", onConfirm: null });
        try {
          await categoriesApi.update(cat._id, { subGroups: newSubGroups });
          toast("Type supprimé.", "info");
          refresh();
        } catch {
          queryClient.setQueryData(["categories", "all"], prev);
          toast("Erreur lors de la suppression.", "error");
        }
      },
    });
  };

  // ── Open sheet for add/edit ──
  const openAddCategory = () =>
    setSheet({ ...emptySheet, open: true, level: "category" });

  const openEditCategory = (cat: any) =>
    setSheet({ ...emptySheet, open: true, level: "category", editing: true, categoryDbId: cat._id, name: cat.name, slug: cat.slug, enabled: cat.enabled });

  const openAddSubGroup = (catDbId: string) =>
    setSheet({ ...emptySheet, open: true, level: "subGroup", parentCategoryDbId: catDbId });

  const openEditSubGroup = (catDbId: string, subIndex: number, subName: string) =>
    setSheet({ ...emptySheet, open: true, level: "subGroup", editing: true, parentCategoryDbId: catDbId, subGroupIndex: subIndex, name: subName });

  const openAddItem = (catDbId: string, subIndex: number) =>
    setSheet({ ...emptySheet, open: true, level: "item", parentCategoryDbId: catDbId, parentSubGroupIndex: subIndex });

  const openEditItem = (catDbId: string, subIndex: number, itemIndex: number, itemName: string) =>
    setSheet({ ...emptySheet, open: true, level: "item", editing: true, parentCategoryDbId: catDbId, parentSubGroupIndex: subIndex, itemIndex, name: itemName });

  const closeSheet = () => setSheet(emptySheet);

  // ── Save handler ──
  const handleSave = async () => {
    if (!sheet.name.trim()) {
      toast("Le nom est requis.", "error");
      return;
    }

    setSaving(true);
    try {
      if (sheet.level === "category") {
        if (sheet.editing && sheet.categoryDbId) {
          await categoriesApi.update(sheet.categoryDbId, {
            name: sheet.name,
            slug: sheet.slug || sheet.name.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, "-").replace(/^-|-$/g, ""),
            enabled: sheet.enabled,
          });
          toast(`${sheet.name} modifiée.`, "success");
        } else {
          await categoriesApi.create({
            name: sheet.name,
            slug: sheet.slug || sheet.name.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, "-").replace(/^-|-$/g, ""),
            enabled: sheet.enabled,
            subGroups: [],
          });
          toast(`${sheet.name} ajoutée.`, "success");
        }
      } else if (sheet.level === "subGroup" && sheet.parentCategoryDbId) {
        const cat = categories.find((c: any) => c._id === sheet.parentCategoryDbId);
        if (!cat) throw new Error("Catégorie introuvable");

        let newSubGroups;
        if (sheet.editing && sheet.subGroupIndex !== undefined) {
          newSubGroups = cat.subGroups.map((sg: any, i: number) =>
            i === sheet.subGroupIndex ? { ...sg, name: sheet.name } : sg
          );
        } else {
          newSubGroups = [...cat.subGroups, { name: sheet.name, items: [] }];
        }
        await categoriesApi.update(cat._id, { subGroups: newSubGroups });
        toast(`${sheet.name} ${sheet.editing ? "modifiée" : "ajoutée"}.`, "success");
      } else if (sheet.level === "item" && sheet.parentCategoryDbId && sheet.parentSubGroupIndex !== undefined) {
        const cat = categories.find((c: any) => c._id === sheet.parentCategoryDbId);
        if (!cat) throw new Error("Catégorie introuvable");

        const newSubGroups = cat.subGroups.map((sg: any, si: number) => {
          if (si !== sheet.parentSubGroupIndex) return sg;
          if (sheet.editing && sheet.itemIndex !== undefined) {
            return {
              ...sg,
              items: sg.items.map((it: any, ii: number) =>
                ii === sheet.itemIndex ? { ...it, name: sheet.name } : it
              ),
            };
          } else {
            return { ...sg, items: [...sg.items, { name: sheet.name }] };
          }
        });
        await categoriesApi.update(cat._id, { subGroups: newSubGroups });
        toast(`${sheet.name} ${sheet.editing ? "modifié" : "ajouté"}.`, "success");
      }

      refresh();
      closeSheet();
    } catch (error: any) {
      toast(error?.message || "Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ──
  const filtered = search
    ? categories.filter(
        (c: any) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.subGroups?.some(
            (s: any) =>
              s.name.toLowerCase().includes(search.toLowerCase()) ||
              s.items?.some((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
          )
      )
    : categories;

  const totalArticles = categories.reduce((sum: number, c: any) => sum + (c.articlesCount || 0), 0);
  const totalSubGroups = categories.reduce((sum: number, c: any) => sum + (c.subGroups?.length || 0), 0);
  const totalItems = categories.reduce(
    (sum: number, c: any) => sum + (c.subGroups || []).reduce((s2: number, sg: any) => s2 + (sg.items?.length || 0), 0),
    0
  );

  const sheetTitle = sheet.editing
    ? sheet.level === "category"
      ? "Modifier la catégorie"
      : sheet.level === "subGroup"
      ? "Modifier la sous-catégorie"
      : "Modifier le type"
    : sheet.level === "category"
    ? "Nouvelle catégorie"
    : sheet.level === "subGroup"
    ? "Nouvelle sous-catégorie"
    : "Nouveau type";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} catégories · {totalSubGroups} sous-catégories · {totalItems} types · {totalArticles.toLocaleString()} articles
          </p>
        </div>
        <button
          onClick={openAddCategory}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors self-start"
        >
          <FiPlus className="h-4 w-4" />
          <span>Ajouter une catégorie</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Categories Tree */}
      <div className="space-y-2">
        {filtered.map((cat: any) => {
          const isCatExpanded = expandedCats.includes(cat._id);
          return (
            <div key={cat._id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* ── Level 1: Category Row ── */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleCat(cat._id)}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0"
                >
                  {isCatExpanded ? (
                    <FiChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FiChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    {!cat.enabled && (
                      <Badge variant="secondary" className="text-[10px]">Désactivée</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(cat.articlesCount || 0).toLocaleString()} articles · {cat.subGroups?.length || 0} sous-catégories
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAddSubGroup(cat._id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                    title="Ajouter une sous-catégorie"
                  >
                    <FiPlus className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => toggleEnabled(cat)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                    title={cat.enabled ? "Désactiver" : "Activer"}
                  >
                    {cat.enabled ? (
                      <FiToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <FiToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                    title="Modifier"
                  >
                    <FiEdit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => askDeleteCategory(cat)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* ── Level 2: SubGroups ── */}
              {isCatExpanded && cat.subGroups?.length > 0 && (
                <div className="border-t border-border bg-muted/20">
                  {cat.subGroups.map((sub: any, subIdx: number) => {
                    const subKey = `${cat._id}-${subIdx}`;
                    const isSubExpanded = expandedSubs.includes(subKey);
                    return (
                      <div key={subKey} className="border-b border-border last:border-b-0">
                        <div className="flex items-center gap-3 px-4 py-2.5 pl-10">
                          <button
                            onClick={() => toggleSub(subKey)}
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0"
                          >
                            {sub.items?.length > 0 ? (
                              isSubExpanded ? (
                                <FiChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <FiChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{sub.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {sub.articlesCount || 0} articles{sub.items?.length > 0 && ` · ${sub.items.length} types`}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => openAddItem(cat._id, subIdx)}
                              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                              title="Ajouter un type"
                            >
                              <FiPlus className="h-3.5 w-3.5 text-primary" />
                            </button>
                            <button
                              onClick={() => openEditSubGroup(cat._id, subIdx, sub.name)}
                              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                              title="Modifier"
                            >
                              <FiEdit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => askDeleteSubGroup(cat, subIdx, sub.name)}
                              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>

                        {/* ── Level 3: Items ── */}
                        {isSubExpanded && sub.items?.length > 0 && (
                          <div className="bg-muted/10">
                            {sub.items.map((item: any, itemIdx: number) => (
                              <div
                                key={`${subKey}-${itemIdx}`}
                                className="flex items-center justify-between px-4 py-2 pl-20 border-t border-border/50"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                                  <span className="text-sm text-foreground">{item.name}</span>
                                  <span className="text-xs text-muted-foreground">{item.articlesCount || 0} articles</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => openEditItem(cat._id, subIdx, itemIdx, item.name)}
                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                    title="Modifier"
                                  >
                                    <FiEdit2 className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => askDeleteItem(cat, subIdx, itemIdx, item.name)}
                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                                    title="Supprimer"
                                  >
                                    <FiTrash2 className="h-3 w-3 text-destructive" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {isCatExpanded && (!cat.subGroups || cat.subGroups.length === 0) && (
                <div className="border-t border-border bg-muted/20 px-4 py-4 pl-14">
                  <p className="text-sm text-muted-foreground italic">Aucune sous-catégorie.</p>
                  <button
                    onClick={() => openAddSubGroup(cat._id)}
                    className="mt-2 text-sm text-primary font-medium hover:underline"
                  >
                    + Ajouter une sous-catégorie
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Aucune catégorie trouvée.</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Sheet ── */}
      <Sheet open={sheet.open} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:w-[420px] overflow-y-auto px-5">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>
              {sheet.level === "category" && "Remplis les informations de la catégorie principale."}
              {sheet.level === "subGroup" && "Remplis le nom de la sous-catégorie."}
              {sheet.level === "item" && "Remplis le nom du type d'article."}
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Nom *
              </label>
              <input
                type="text"
                placeholder={
                  sheet.level === "category"
                    ? "Ex: Femme, Homme, Sport..."
                    : sheet.level === "subGroup"
                    ? "Ex: Vêtements, Chaussures..."
                    : "Ex: Robes, Baskets, Jeans..."
                }
                value={sheet.name}
                onChange={(e) =>
                  setSheet({
                    ...sheet,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, "-").replace(/^-|-$/g, ""),
                  })
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                autoFocus
              />
            </div>

            {/* Slug (only for categories) */}
            {sheet.level === "category" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="auto-generated"
                  value={sheet.slug}
                  onChange={(e) => setSheet({ ...sheet, slug: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">URL: /categories/{sheet.slug || "..."}</p>
              </div>
            )}

            {/* Enabled toggle (only for categories) */}
            {sheet.level === "category" && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Activée</p>
                  <p className="text-xs text-muted-foreground">Visible sur la plateforme</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSheet({ ...sheet, enabled: !sheet.enabled })}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
                >
                  {sheet.enabled ? (
                    <FiToggleRight className="h-6 w-6 text-primary" />
                  ) : (
                    <FiToggleLeft className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            {/* Context info */}
            {sheet.level === "subGroup" && sheet.parentCategoryDbId && (
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Catégorie parente : <span className="font-semibold text-foreground">{categories.find((c: any) => c._id === sheet.parentCategoryDbId)?.name}</span>
                </p>
              </div>
            )}

            {sheet.level === "item" && sheet.parentCategoryDbId && sheet.parentSubGroupIndex !== undefined && (
              <div className="rounded-lg bg-muted/50 px-4 py-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Catégorie : <span className="font-semibold text-foreground">{categories.find((c: any) => c._id === sheet.parentCategoryDbId)?.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Sous-catégorie : <span className="font-semibold text-foreground">
                    {categories.find((c: any) => c._id === sheet.parentCategoryDbId)?.subGroups?.[sheet.parentSubGroupIndex]?.name}
                  </span>
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="flex flex-row gap-3 px-0">
            <button
              type="button"
              onClick={closeSheet}
              className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                sheet.editing ? "Enregistrer" : "Ajouter"
              )}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ── */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, name: "", onConfirm: null })} />
          <div className="relative z-10 w-full max-w-sm bg-background rounded-xl border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <FiAlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Confirmer la suppression</h3>
              <p className="text-sm text-muted-foreground">
                Es-tu sûr de vouloir supprimer <span className="font-medium text-foreground">&quot;{deleteConfirm.name}&quot;</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, name: "", onConfirm: null })}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteConfirm.onConfirm?.()}
                className="flex-1 h-10 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
