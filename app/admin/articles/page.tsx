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
import { useAdminArticles, useUpdateArticleStatus } from "@/hooks/use-admin";
import {
  LISTING_DESTINATIONS,
  listingDestinationLabels,
  type ListingDestination,
} from "@/lib/seller-domain";
import { useToast } from "@/components/ui/toast";
import { FiSearch, FiMoreHorizontal, FiCheck, FiX, FiFlag, FiEye } from "react-icons/fi";

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "destructive" }> = {
  pending: { label: "En attente", variant: "warning" },
  active: { label: "Actif", variant: "success" },
  approved: { label: "Approuvé", variant: "success" },
  rejected: { label: "Rejeté", variant: "destructive" },
  flagged: { label: "Signalé", variant: "destructive" },
  sold: { label: "Vendu", variant: "warning" },
};

export default function ArticlesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const statusParam = tab === "all" ? undefined : tab;
  const { data, isLoading, isError } = useAdminArticles({ status: statusParam, q: search || undefined });
  const updateStatus = useUpdateArticleStatus();

  const articles = useMemo(() => {
    let rows = data?.data ?? [];
    if (destinationFilter !== "all") {
      rows = rows.filter((a: any) => a.destination === destinationFilter);
    }
    return rows;
  }, [data, destinationFilter]);

  const handleApprove = (article: any) => {
    updateStatus.mutate(
      { id: article.id || article._id, status: "active" },
      {
        onSuccess: () =>
          showToast(`"${article.title}" a été approuvé.`, "success"),
        onError: (err: any) =>
          showToast(err?.message || "Action impossible", "error"),
      }
    );
  };

  const handleReject = (article: any) => {
    updateStatus.mutate(
      { id: article.id || article._id, status: "rejected" },
      {
        onSuccess: () =>
          showToast(`"${article.title}" a été rejeté.`, "warning"),
        onError: (err: any) =>
          showToast(err?.message || "Action impossible", "error"),
      }
    );
  };

  const handleFlag = (article: any) => {
    updateStatus.mutate(
      { id: article.id || article._id, status: "flagged" },
      {
        onSuccess: () =>
          showToast(`"${article.title}" a été signalé.`, "warning"),
        onError: (err: any) =>
          showToast(err?.message || "Action impossible", "error"),
      }
    );
  };

  const getSeller = (a: any) => typeof a.seller === "object" ? a.seller.pseudo : "Vendeur";

  const columns = [
    {
      key: "article",
      header: "Article",
      render: (a: any) => (
        <div className="flex items-center gap-3">
          {a.images?.[0] && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={a.images[0]} alt={a.title} className="h-10 w-10 rounded object-cover" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate max-w-[200px]">{a.title}</p>
            <p className="text-xs text-muted-foreground">{getSeller(a)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      className: "hidden md:table-cell",
      render: (a: any) => <span className="text-muted-foreground">{a.category}</span>,
    },
    {
      key: "destination",
      header: "Univers",
      className: "hidden lg:table-cell",
      render: (a: any) => {
        const dest = (a.destination || a.listingDestination) as
          | ListingDestination
          | undefined;
        if (!dest) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge variant="secondary" className="font-normal">
            {listingDestinationLabels[dest] ?? dest}
          </Badge>
        );
      },
    },
    {
      key: "price",
      header: "Prix",
      render: (a: any) => (
        <span className="font-medium text-foreground">{(a.price || 0).toLocaleString("fr-FR")} F</span>
      ),
    },
    {
      key: "condition",
      header: "État",
      className: "hidden lg:table-cell",
      render: (a: any) => <span className="text-muted-foreground text-xs">{a.condition}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (a: any) => {
        const config = statusConfig[a.status] || { label: a.status, variant: "warning" as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "date",
      header: "Date",
      className: "hidden sm:table-cell",
      render: (a: any) => (
        <span className="text-muted-foreground text-xs">
          {new Date(a.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (a: any) => (
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
            {a.status !== "active" && a.status !== "approved" && (
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading && !isError && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Modérer les annonces par univers (Seconde main, Articles neufs, Quartier, Enseignes)
        </p>
        {(isError || !data?.data?.length) && (
          <p className="text-xs text-amber-600 mt-1">Données de démonstration</p>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">Brouillons</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="sold">Vendus</TabsTrigger>
          <TabsTrigger value="flagged">Signalés</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 flex-wrap">
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
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Tous les univers</option>
              {LISTING_DESTINATIONS.map((dest) => (
                <option key={dest} value={dest}>
                  {listingDestinationLabels[dest]}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            <span className="font-semibold text-primary">{articles.length}</span> article{articles.length !== 1 ? "s" : ""}
          </p>

          <div className="mt-4">
            <DataTable columns={columns} data={articles} emptyMessage="Aucun article trouvé" />
          </div>
        </TabsContent>
      </Tabs>

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
            {selectedArticle.images?.[0] && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedArticle.images[0]}
                alt={selectedArticle.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-lg font-bold text-foreground mb-1">{selectedArticle.title}</h2>
            <Badge variant={statusConfig[selectedArticle.status]?.variant || "warning"} className="mb-4">
              {statusConfig[selectedArticle.status]?.label || selectedArticle.status}
            </Badge>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vendeur</span>
                <span className="font-medium">{getSeller(selectedArticle)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Catégorie</span>
                <span className="font-medium">{selectedArticle.category}</span>
              </div>
              {selectedArticle.listingDestination && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Univers accueil</span>
                  <span className="font-medium">
                    {listingDestinationLabels[
                      selectedArticle.listingDestination as ListingDestination
                    ] ?? selectedArticle.listingDestination}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Prix</span>
                <span className="font-bold text-primary">{(selectedArticle.price || 0).toLocaleString("fr-FR")} GNF</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">État</span>
                <span className="font-medium">{selectedArticle.condition}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Publié le</span>
                <span className="font-medium">{new Date(selectedArticle.createdAt).toLocaleDateString("fr-FR")}</span>
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
