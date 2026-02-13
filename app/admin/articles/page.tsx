"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockArticles, type MockArticle } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { FiSearch, FiMoreHorizontal, FiCheck, FiX, FiFlag, FiEye, FiTrash2 } from "react-icons/fi";

const statusConfig = {
  pending: { label: "En attente", variant: "warning" as const },
  approved: { label: "Approuvé", variant: "success" as const },
  rejected: { label: "Rejeté", variant: "destructive" as const },
  flagged: { label: "Signalé", variant: "destructive" as const },
};

export default function ArticlesPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState(mockArticles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tab, setTab] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<MockArticle | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.seller.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
      const matchTab =
        tab === "all" ||
        (tab === "pending" && a.status === "pending") ||
        (tab === "flagged" && a.status === "flagged");
      return matchSearch && matchCategory && matchTab;
    });
  }, [articles, search, categoryFilter, tab]);

  const handleApprove = (article: MockArticle) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, status: "approved" as const } : a))
    );
    toast(`"${article.title}" a été approuvé.`, "success");
  };

  const handleReject = (article: MockArticle) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, status: "rejected" as const } : a))
    );
    toast(`"${article.title}" a été rejeté.`, "warning");
  };

  const handleFlag = (article: MockArticle) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, status: "flagged" as const } : a))
    );
    toast(`"${article.title}" a été signalé.`, "warning");
  };

  const handleDelete = (article: MockArticle) => {
    setArticles((prev) => prev.filter((a) => a.id !== article.id));
    toast(`"${article.title}" a été supprimé.`, "info");
  };

  const categories = [...new Set(mockArticles.map((a) => a.category))];

  const columns = [
    {
      key: "article",
      header: "Article",
      render: (a: MockArticle) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image} alt={a.title} className="h-10 w-10 rounded object-cover" />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate max-w-[200px]">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.seller}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      className: "hidden md:table-cell",
      render: (a: MockArticle) => <span className="text-muted-foreground">{a.category}</span>,
    },
    {
      key: "price",
      header: "Prix",
      render: (a: MockArticle) => (
        <span className="font-medium text-foreground">{a.price.toLocaleString("fr-FR")} F</span>
      ),
    },
    {
      key: "condition",
      header: "État",
      className: "hidden lg:table-cell",
      render: (a: MockArticle) => <span className="text-muted-foreground text-xs">{a.condition}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (a: MockArticle) => {
        const config = statusConfig[a.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (a: MockArticle) => (
        <span className="text-muted-foreground text-xs">
          {new Date(a.postedDate).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (a: MockArticle) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
              <FiMoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setSelectedArticle(a)} className="cursor-pointer">
              <FiEye className="h-4 w-4 mr-2" />
              Voir détail
            </DropdownMenuItem>
            {a.status !== "approved" && (
              <DropdownMenuItem onClick={() => handleApprove(a)} className="cursor-pointer text-green-600">
                <FiCheck className="h-4 w-4 mr-2" />
                Approuver
              </DropdownMenuItem>
            )}
            {a.status !== "rejected" && (
              <DropdownMenuItem onClick={() => handleReject(a)} className="cursor-pointer text-orange-500">
                <FiX className="h-4 w-4 mr-2" />
                Rejeter
              </DropdownMenuItem>
            )}
            {a.status !== "flagged" && (
              <DropdownMenuItem onClick={() => handleFlag(a)} className="cursor-pointer text-red-500">
                <FiFlag className="h-4 w-4 mr-2" />
                Signaler
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(a)} className="cursor-pointer text-destructive">
              <FiTrash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const pendingCount = articles.filter((a) => a.status === "pending").length;
  const flaggedCount = articles.filter((a) => a.status === "flagged").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">Modérer les annonces publiées</p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({articles.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
          <TabsTrigger value="flagged">Signalés ({flaggedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un article ou vendeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <p className="text-sm text-muted-foreground mt-4">
            <span className="font-semibold text-primary">{filtered.length}</span> article{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Table */}
          <div className="mt-4">
            <DataTable columns={columns} data={filtered} emptyMessage="Aucun article trouvé" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Article Detail Dialog */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedArticle(null)} />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-bold text-foreground mb-1">{selectedArticle.title}</h2>
            <Badge variant={statusConfig[selectedArticle.status].variant} className="mb-4">
              {statusConfig[selectedArticle.status].label}
            </Badge>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{selectedArticle.seller}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Catégorie</span>
                <span className="font-medium">{selectedArticle.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Prix</span>
                <span className="font-bold text-primary">{selectedArticle.price.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">État</span>
                <span className="font-medium">{selectedArticle.condition}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Publié le</span>
                <span className="font-medium">{new Date(selectedArticle.postedDate).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
            {selectedArticle.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { handleApprove(selectedArticle); setSelectedArticle(null); }}
                  className="flex-1 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Approuver
                </button>
                <button
                  onClick={() => { handleReject(selectedArticle); setSelectedArticle(null); }}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
