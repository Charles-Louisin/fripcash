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
import { mockUsers, type MockUser } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { FiSearch, FiMoreHorizontal, FiEye, FiShield, FiSlash, FiTrash2 } from "react-icons/fi";

const statusConfig = {
  active: { label: "Actif", variant: "success" as const },
  banned: { label: "Banni", variant: "destructive" as const },
  pending: { label: "En attente", variant: "warning" as const },
};

export default function UtilisateursPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.pseudo.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const handleBan = (user: MockUser) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "banned" ? "active" as const : "banned" as const } : u
      )
    );
    toast(
      user.status === "banned" ? `${user.name} a été débanni.` : `${user.name} a été banni.`,
      user.status === "banned" ? "success" : "warning"
    );
  };

  const handleVerify = (user: MockUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: "active" as const } : u))
    );
    toast(`${user.name} a été vérifié.`, "success");
  };

  const handleDelete = (user: MockUser) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast(`${user.name} a été supprimé.`, "info");
  };

  const columns = [
    {
      key: "user",
      header: "Utilisateur",
      render: (u: MockUser) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={u.avatar} alt={u.name} />
            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{u.name}</p>
            <p className="text-xs text-muted-foreground">@{u.pseudo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      className: "hidden md:table-cell",
      render: (u: MockUser) => <span className="text-muted-foreground">{u.phone}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (u: MockUser) => {
        const config = statusConfig[u.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "articles",
      header: "Articles",
      className: "hidden lg:table-cell",
      render: (u: MockUser) => <span className="text-muted-foreground">{u.articlesCount}</span>,
    },
    {
      key: "revenue",
      header: "Revenus",
      className: "hidden lg:table-cell",
      render: (u: MockUser) => (
        <span className="font-medium text-foreground">{u.totalRevenue.toLocaleString("fr-FR")} F</span>
      ),
    },
    {
      key: "joined",
      header: "Inscrit le",
      className: "hidden sm:table-cell",
      render: (u: MockUser) => (
        <span className="text-muted-foreground">
          {new Date(u.joinedDate).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (u: MockUser) => (
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(u)} className="cursor-pointer text-destructive">
              <FiTrash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérer les comptes utilisateurs</p>
      </div>

      {/* Toolbar */}
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

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-primary">{filtered.length}</span> utilisateur{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <DataTable columns={columns} data={filtered} emptyMessage="Aucun utilisateur trouvé" />

      {/* User Detail Dialog */}
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
                <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedUser.name}</h2>
                <p className="text-sm text-muted-foreground">@{selectedUser.pseudo}</p>
                <Badge variant={statusConfig[selectedUser.status].variant} className="mt-1">
                  {statusConfig[selectedUser.status].label}
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
                <span className="font-medium text-foreground">{new Date(selectedUser.joinedDate).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Articles publiés</span>
                <span className="font-medium text-foreground">{selectedUser.articlesCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Ventes réalisées</span>
                <span className="font-medium text-foreground">{selectedUser.salesCount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Revenus totaux</span>
                <span className="font-bold text-primary">{selectedUser.totalRevenue.toLocaleString("fr-FR")} GNF</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
