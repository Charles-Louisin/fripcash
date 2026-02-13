"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { mockCategories, type MockCategory } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState(mockCategories);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MockCategory | null>(null);
  const [formName, setFormName] = useState("");

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEnabled = (id: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    const cat = categories.find((c) => c.id === id);
    toast(
      cat?.enabled
        ? `${cat.name} a été désactivée.`
        : `${cat?.name} a été activée.`,
      "info"
    );
  };

  const handleDelete = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast(`${cat?.name} a été supprimée.`, "info");
  };

  const openAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setShowDialog(true);
  };

  const openEdit = (cat: MockCategory) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast("Le nom est requis.", "error");
      return;
    }
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formName, slug: formName.toLowerCase().replace(/\s+/g, "-") }
            : c
        )
      );
      toast(`${formName} a été modifiée.`, "success");
    } else {
      const newCat: MockCategory = {
        id: Date.now(),
        name: formName,
        slug: formName.toLowerCase().replace(/\s+/g, "-"),
        articlesCount: 0,
        enabled: true,
        subCategories: [],
      };
      setCategories((prev) => [...prev, newCat]);
      toast(`${formName} a été ajoutée.`, "success");
    }
    setShowDialog(false);
    setFormName("");
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les catégories de la plateforme</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const isExpanded = expandedIds.includes(cat.id);
          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Category Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0"
                >
                  {isExpanded ? (
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
                    {cat.articlesCount} articles · {cat.subCategories.length} sous-catégories
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleEnabled(cat.id)}
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
                    onClick={() => openEdit(cat)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                  >
                    <FiEdit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Sub-categories */}
              {isExpanded && cat.subCategories.length > 0 && (
                <div className="border-t border-border bg-muted/30">
                  {cat.subCategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-4 py-2.5 pl-14 border-b border-border last:border-b-0"
                    >
                      <span className="text-sm text-foreground">{sub.name}</span>
                      <span className="text-xs text-muted-foreground">{sub.articlesCount} articles</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDialog(false)} />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-sm p-6 z-10">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  placeholder="Ex: Femme, Homme, Sport..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {editingCategory ? "Enregistrer" : "Ajouter"}
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
