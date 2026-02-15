"use client";

import { useState, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiEye, FiHeart, FiGrid, FiList, FiCamera, FiX, FiImage, FiAlertCircle } from "react-icons/fi";
import { mockUserListings, type UserListing } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

const tabs = [
  { id: "active", label: "En vente" },
  { id: "sold", label: "Vendus" },
  { id: "draft", label: "Brouillons" },
];

const categoryTree: Record<string, Record<string, string[]>> = {
  Femme: {
    Vêtements: ["Robes", "Hauts et t-shirts", "Pantalons et leggings", "Jupes", "Jeans", "Sweats et sweats à capuche", "Manteaux et vestes", "Blazers et tailleurs", "Shorts", "Maillots de bain", "Lingerie et pyjamas", "Vêtements de sport", "Maternité"],
    Chaussures: ["Baskets", "Sandales", "Talons", "Bottes"],
    Sacs: ["Sacs à main", "Sacs à dos"],
    Accessoires: ["Bijoux", "Ceintures", "Lunettes"],
    Beauté: ["Maquillage", "Soins", "Parfums"],
  },
  Homme: {
    Vêtements: ["T-shirts et polos", "Chemises", "Pantalons", "Jeans", "Sweats et hoodies", "Vestes et manteaux", "Costumes", "Shorts"],
    Chaussures: ["Baskets", "Chaussures de ville", "Bottes"],
    Accessoires: ["Montres", "Ceintures", "Sacs"],
  },
  Enfant: {
    Fille: ["Robes", "Hauts", "Pantalons"],
    Garçon: ["T-shirts", "Pantalons", "Sweats"],
    Bébé: ["Bodies", "Pyjamas"],
    Chaussures: [],
  },
  Maison: {
    Décoration: ["Coussins", "Cadres", "Bougies"],
    "Linge de maison": ["Draps", "Serviettes"],
    Cuisine: ["Vaisselle", "Ustensiles"],
  },
  Électronique: {
    Téléphones: ["Smartphones", "Coques et accessoires"],
    Informatique: ["Ordinateurs portables", "Tablettes", "Accessoires"],
    "Audio & Photo": ["Écouteurs", "Enceintes", "Appareils photo"],
  },
  Loisirs: {
    "Jeux & Jouets": ["Jeux de société", "Puzzles", "Figurines"],
    Collections: ["Vinyles", "Cartes"],
    "Loisirs créatifs": [],
  },
  Sport: {
    "Vêtements de sport": ["Running", "Fitness", "Football"],
    "Chaussures de sport": [],
    Équipement: ["Vélos", "Accessoires"],
  },
  Divertissement: {
    Livres: ["Romans", "BD & Mangas", "Manuels scolaires"],
    "Musique & Films": ["CD & Vinyles", "DVD & Blu-ray"],
    "Jeux vidéo": ["Consoles", "Jeux"],
  },
};

const categoryNames = Object.keys(categoryTree);
const conditions = ["Neuf avec étiquette", "Neuf sans étiquette", "Très bon état", "Bon état", "Satisfaisant"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "44", "46", "Unique"];

export default function MyArticlesPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [listings, setListings] = useState<UserListing[]>(mockUserListings);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserListing | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = { title: "", brand: "", description: "", category: categoryNames[0], subcategory: "", subItem: "", condition: conditions[0], price: "", size: "", color: "" };
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });

  const openAddSheet = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setImagePreviews([]);
    setSheetOpen(true);
  };

  const openEditSheet = (item: UserListing) => {
    setEditingItem(item);
    const parts = item.title.split(" – ");
    setFormData({
      title: parts.length > 1 ? parts.slice(1).join(" – ") : item.title,
      brand: parts.length > 1 ? parts[0] : "",
      description: item.description,
      category: item.category,
      subcategory: "",
      subItem: "",
      condition: item.condition,
      price: String(item.price),
      size: item.size || "",
      color: "",
    });
    setImagePreviews([item.image]);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingItem(null);
  };

  const filtered = listings.filter((l) => l.status === activeTab);

  const askDelete = (id: number) => {
    const item = listings.find((l) => l.id === id);
    setDeleteConfirm({ open: true, id, title: item?.title || "cet article" });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id !== null) {
      setListings((prev) => prev.filter((l) => l.id !== deleteConfirm.id));
      showToast("Article supprimé", "success");
    }
    setDeleteConfirm({ open: false, id: null, title: "" });
  };

  const handleMarkSold = (id: number) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "sold" as const } : l)));
    showToast("Article marqué comme vendu", "success");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (imagePreviews.length + newPreviews.length >= 5) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, ev.target?.result as string];
        });
      };
      reader.readAsDataURL(file);
      newPreviews.push("");
    });
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.price) {
      showToast("Remplis le titre et le prix.", "error");
      return;
    }
    if (!formData.subcategory) {
      showToast("Sélectionne une sous-catégorie.", "error");
      return;
    }
    if (imagePreviews.length === 0) {
      showToast("Ajoute au moins une photo.", "error");
      return;
    }
    const title = formData.brand ? `${formData.brand} – ${formData.title}` : formData.title;
    const fullCategory = [formData.category, formData.subcategory, formData.subItem].filter(Boolean).join(" > ");

    if (editingItem) {
      // Update existing
      setListings((prev) =>
        prev.map((l) =>
          l.id === editingItem.id
            ? { ...l, title, image: imagePreviews[0], category: fullCategory, price: parseInt(formData.price), condition: formData.condition, size: formData.size || undefined, description: formData.description }
            : l
        )
      );
      showToast("Article modifié avec succès !", "success");
    } else {
      // Create new
      const article: UserListing = {
        id: Date.now(),
        title,
        image: imagePreviews[0],
        category: fullCategory,
        price: parseInt(formData.price),
        condition: formData.condition,
        size: formData.size || undefined,
        description: formData.description,
        status: "active",
        views: 0,
        favorites: 0,
        postedDate: new Date().toISOString().split("T")[0],
      };
      setListings((prev) => [article, ...prev]);
      showToast("Article publié avec succès !", "success");
    }
    closeSheet();
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-primary/10 text-primary border-0">En vente</Badge>;
    if (status === "sold") return <Badge className="bg-green-100 text-green-700 border-0">Vendu</Badge>;
    return <Badge variant="secondary">Brouillon</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes articles</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos annonces</p>
        </div>
        <button
          type="button"
          onClick={openAddSheet}
          className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter un article</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const count = listings.filter((l) => l.status === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* View toggle + count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Vue grille"
          >
            <FiGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="Vue tableau"
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucun article dans cette catégorie</p>
          {activeTab === "active" && (
            <button
              type="button"
              onClick={openAddSheet}
              className="mt-4 h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ajouter votre premier article
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ─── Grid View ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden group">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">{statusBadge(item.status)}</div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.condition}</p>
                <p className="text-sm font-bold text-primary mt-1">{item.price.toLocaleString("fr-FR")} GNF</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FiEye className="h-3 w-3" /> {item.views}</span>
                  <span className="flex items-center gap-1"><FiHeart className="h-3 w-3" /> {item.favorites}</span>
                </div>

                {/* Actions */}
                {item.status === "active" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button type="button" onClick={() => openEditSheet(item)} className="flex-1 h-8 rounded-md text-xs font-medium border border-border hover:bg-accent transition-colors flex items-center justify-center gap-1">
                      <FiEdit2 className="h-3 w-3" /> Modifier
                    </button>
                    <button type="button" onClick={() => handleMarkSold(item.id)} className="h-8 px-2 rounded-md text-xs font-medium text-green-600 border border-green-200 hover:bg-green-50 transition-colors flex items-center justify-center gap-1">
                      <FiCheck className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => askDelete(item.id)} className="h-8 px-2 rounded-md text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1">
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Table View ─── */
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Article</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Catégorie</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">État</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Prix</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Vues</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Favoris</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Article (image + title) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{item.title}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-foreground">{item.category}</span>
                    </td>
                    {/* Condition */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{item.condition}</span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-primary whitespace-nowrap">{item.price.toLocaleString("fr-FR")} GNF</span>
                    </td>
                    {/* Views */}
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{item.views}</span>
                    </td>
                    {/* Favorites */}
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{item.favorites}</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {statusBadge(item.status)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "active" && (
                          <>
                            <button type="button" onClick={() => openEditSheet(item)} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Modifier">
                              <FiEdit2 className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => handleMarkSold(item.id)} className="h-8 w-8 rounded-md flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors" title="Marquer vendu">
                              <FiCheck className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => askDelete(item.id)} className="h-8 w-8 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Supprimer">
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Article Sheet ─── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-none sm:w-[50vw] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="p-5 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-lg">
                  {editingItem ? "Modifier l\u2019article" : "Ajouter un article"}
                </SheetTitle>
                <SheetDescription>
                  {editingItem
                    ? "Modifie les infos de ton article"
                    : "Remplis les infos et ajoute des photos"}
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* ─── Photos ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Photos * <span className="font-normal text-muted-foreground">({imagePreviews.length}/5)</span>
              </label>

              {imagePreviews.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <FiImage className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Clique pour ajouter des photos</p>
                    <p className="text-xs mt-0.5">JPG, PNG · max 5 photos</p>
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group/img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Photo ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Couverture
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors bg-muted/30"
                    >
                      <FiCamera className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Ajouter</span>
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* ─── Title + Brand ─── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Ex: Robe d'été fleurie"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Marque</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Ex: Nike, Zara, H&M..."
                />
              </div>
            </div>

            {/* ─── Description ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                placeholder="Décris ton article : état, détails, raison de la vente..."
              />
            </div>

            {/* ─── Category cascading selects ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Catégorie *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "", subItem: "" })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Sous-catégorie *</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value, subItem: "" })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Choisir...</option>
                  {formData.category && Object.keys(categoryTree[formData.category] || {}).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Type</label>
                <select
                  value={formData.subItem}
                  onChange={(e) => setFormData({ ...formData, subItem: e.target.value })}
                  disabled={!formData.subcategory || (categoryTree[formData.category]?.[formData.subcategory]?.length ?? 0) === 0}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choisir...</option>
                  {formData.subcategory && (categoryTree[formData.category]?.[formData.subcategory] || []).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ─── Condition ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">État *</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* ─── Size chips ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Taille</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: formData.size === s ? "" : s })}
                    className={`h-9 px-3.5 rounded-lg border text-xs font-medium transition-all ${
                      formData.size === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Color input ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Couleur</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Ex: Noir, Bleu marine, Multicolore..."
              />
            </div>

            {/* ─── Price ─── */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Prix (GNF) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full h-12 pl-4 pr-16 rounded-xl border border-input bg-background text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="0"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  GNF
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="p-5 border-t border-border flex-row gap-3">
            <button
              type="button"
              onClick={closeSheet}
              className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {editingItem ? (
                <>
                  <FiCheck className="h-4 w-4" />
                  Enregistrer
                </>
              ) : (
                <>
                  <FiPlus className="h-4 w-4" />
                  Publier
                </>
              )}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation Dialog ── */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, id: null, title: "" })} />
          <div className="relative z-10 w-full max-w-sm bg-background rounded-xl border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <FiAlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Supprimer l&apos;article</h3>
              <p className="text-sm text-muted-foreground">
                Es-tu sûr de vouloir supprimer <span className="font-medium text-foreground">&quot;{deleteConfirm.title}&quot;</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, id: null, title: "" })}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
