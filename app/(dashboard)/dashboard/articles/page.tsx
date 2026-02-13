"use client";

import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiEye, FiHeart } from "react-icons/fi";
import { mockUserListings, type UserListing } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const tabs = [
  { id: "active", label: "En vente" },
  { id: "sold", label: "Vendus" },
  { id: "draft", label: "Brouillons" },
];

const categories = ["Femme", "Homme", "Enfant", "Maison", "Électronique", "Loisirs", "Sport", "Divertissement"];
const conditions = ["Neuf avec étiquette", "Neuf", "Très bon état", "Bon état", "Satisfaisant"];

export default function MyArticlesPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [listings, setListings] = useState<UserListing[]>(mockUserListings);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "", description: "", category: categories[0], condition: conditions[0], price: "", size: "",
  });

  const filtered = listings.filter((l) => l.status === activeTab);

  const handleDelete = (id: number) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    showToast("Article supprimé", "success");
  };

  const handleMarkSold = (id: number) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "sold" as const } : l)));
    showToast("Article marqué comme vendu", "success");
  };

  const handleAddArticle = () => {
    if (!newArticle.title || !newArticle.price) {
      showToast("Veuillez remplir les champs obligatoires", "error");
      return;
    }
    const article: UserListing = {
      id: Date.now(),
      title: newArticle.title,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      category: newArticle.category,
      price: parseInt(newArticle.price),
      condition: newArticle.condition,
      size: newArticle.size || undefined,
      description: newArticle.description,
      status: "active",
      views: 0,
      favorites: 0,
      postedDate: new Date().toISOString().split("T")[0],
    };
    setListings((prev) => [article, ...prev]);
    setNewArticle({ title: "", description: "", category: categories[0], condition: conditions[0], price: "", size: "" });
    setShowAddDialog(false);
    showToast("Article ajouté avec succès", "success");
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
          onClick={() => setShowAddDialog(true)}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucun article dans cette catégorie</p>
          {activeTab === "active" && (
            <button
              type="button"
              onClick={() => setShowAddDialog(true)}
              className="mt-4 h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ajouter votre premier article
            </button>
          )}
        </div>
      ) : (
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
                <p className="text-sm font-bold text-primary mt-1">{item.price.toLocaleString("fr-FR")} FCFA</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FiEye className="h-3 w-3" /> {item.views}</span>
                  <span className="flex items-center gap-1"><FiHeart className="h-3 w-3" /> {item.favorites}</span>
                </div>

                {/* Actions */}
                {item.status === "active" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button type="button" className="flex-1 h-8 rounded-md text-xs font-medium border border-border hover:bg-accent transition-colors flex items-center justify-center gap-1">
                      <FiEdit2 className="h-3 w-3" /> Modifier
                    </button>
                    <button type="button" onClick={() => handleMarkSold(item.id)} className="h-8 px-2 rounded-md text-xs font-medium text-green-600 border border-green-200 hover:bg-green-50 transition-colors flex items-center justify-center gap-1">
                      <FiCheck className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="h-8 px-2 rounded-md text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1">
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Article Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddDialog(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-background rounded-xl border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Ajouter un article</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Titre *</label>
                  <input type="text" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ex: Robe d'été fleurie" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea value={newArticle.description} onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Décrivez votre article..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
                    <select value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">État</label>
                    <select value={newArticle.condition} onChange={(e) => setNewArticle({ ...newArticle, condition: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Prix (FCFA) *</label>
                    <input type="number" value={newArticle.price} onChange={(e) => setNewArticle({ ...newArticle, price: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="5000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Taille</label>
                    <input type="text" value={newArticle.size} onChange={(e) => setNewArticle({ ...newArticle, size: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="M, L, 42..." />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button type="button" onClick={() => setShowAddDialog(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">Annuler</button>
                <button type="button" onClick={handleAddArticle} className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Publier</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
