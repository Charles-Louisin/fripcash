"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { useToast } from "@/components/ui/toast";
import { FiSearch, FiMoreHorizontal, FiEye, FiShield, FiSlash, FiTrash2 } from "react-icons/fi";

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" }> = {
  active: { label: "Actif", variant: "success" },
  banned: { label: "Banni", variant: "destructive" },
  pending: { label: "En attente", variant: "warning" },
};

export default function UtilisateursPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { data, isLoading } = useAdminUsers({ status: statusFilter === "all" ? undefined : statusFilter, q: search || undefined });
  const updateStatus = useUpdateUserStatus();

  const users = data?.data ?? [];

  const handleBan = (user: any) => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    updateStatus.mutate(
      { id: user._id, status: newStatus },
      { onSuccess: () => showToast(newStatus === "banned" ? `${user.pseudo} a été banni.` : `${user.pseudo} a été débanni.`, newStatus === "banned" ? "warning" : "success") }
    );
  };

  const handleVerify = (user: any) => {
    updateStatus.mutate(
      { id: user._id, status: "active" },
      { onSuccess: () => showToast(`${user.pseudo} a été vérifié.`, "success") }
    );
  };

  const columns = [
    {
      key: "user",
      header: "Utilisateur",
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={u.avatar} alt={u.pseudo} />
            <AvatarFallback>{(u.firstName || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted-foreground">@{u.pseudo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      className: "hidden md:table-cell",
      render: (u: any) => <span className="text-muted-foreground">{u.phone}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (u: any) => {
        const config = statusConfig[u.status] || statusConfig.active;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "articles",
      header: "Articles",
      className: "hidden lg:table-cell",
      render: (u: any) => <span className="text-muted-foreground">{u.articlesCount ?? 0}</span>,
    },
    {
      key: "joined",
      header: "Inscrit le",
      className: "hidden sm:table-cell",
      render: (u: any) => (
        <span className="text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (u: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
              <FiMoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setSelectedUser(u)} className="cursor-pointer">
              <FiEye className="h-4 w-4 mr-2" />
              Voir le profil
            </DropdownMenuItem>
            {u.status === "pending" && (
              <DropdownMenuItem onClick={() => handleVerify(u)} className="cursor-pointer">
                <FiShield className="h-4 w-4 mr-2" />
                Vérifier
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleBan(u)} className="cursor-pointer">
              <FiSlash className="h-4 w-4 mr-2" />
              {u.status === "banned" ? "Débannir" : "Bannir"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérer les comptes utilisateurs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, pseudo ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="banned">Banni</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-primary">{users.length}</span> utilisateur{users.length !== 1 ? "s" : ""}
      </p>

      <DataTable columns={columns} data={users} emptyMessage="Aucun utilisateur trouvé" />

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedUser.avatar} alt={selectedUser.pseudo} />
                <AvatarFallback>{(selectedUser.firstName || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="text-sm text-muted-foreground">@{selectedUser.pseudo}</p>
                <Badge variant={statusConfig[selectedUser.status]?.variant || "secondary"} className="mt-1">
                  {statusConfig[selectedUser.status]?.label || selectedUser.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium text-foreground">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Inscrit le</span>
                <span className="font-medium text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Articles publiés</span>
                <span className="font-medium text-foreground">{selectedUser.articlesCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Ventes réalisées</span>
                <span className="font-medium text-foreground">{selectedUser.salesCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Solde</span>
                <span className="font-bold text-primary">{(selectedUser.walletBalance ?? 0).toLocaleString("fr-FR")} GNF</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
