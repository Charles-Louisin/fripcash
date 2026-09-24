"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useCreateAuthAdminUser,
  useUpdateAuthAdminUser,
  useSetAuthAdminRole,
  useSetAuthAdminPassword,
  useRemoveAuthAdminUser,
  useAuthAdminUserSessions,
  useRevokeAuthAdminUserSession,
  useRevokeAuthAdminUserSessions,
} from "@/hooks/use-admin";
import {
  ACCOUNT_ROLES,
  accountRoleLabels,
  listingDestinationLabels,
  shopKindLabels,
  type AccountRole,
  type ListingDestination,
  type ShopKind,
} from "@/lib/seller-domain";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  FiSearch,
  FiMoreHorizontal,
  FiEye,
  FiShield,
  FiSlash,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiEdit2,
  FiKey,
  FiTrash2,
  FiMonitor,
} from "react-icons/fi";
import { FaUserShield } from "react-icons/fa6";

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  active: { label: "Actif", variant: "success" },
  banned: { label: "Banni", variant: "destructive" },
  pending: { label: "En attente", variant: "warning" },
};

const roleBadgeClass: Record<string, string> = {
  admin:
    "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  acheteur:
    "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  livreur:
    "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  particulier:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  boutique:
    "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  commerceLocal:
    "border-transparent bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  grandeSurface:
    "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

type SortKey = "name" | "joined" | "articles" | null;
type SortDir = "asc" | "desc";
type DialogMode =
  | null
  | "create"
  | "edit"
  | "role"
  | "password"
  | "sessions"
  | "remove";

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  return accountRoleLabels[role as AccountRole] ?? role;
}

function errMsg(err: unknown) {
  if (err instanceof ApiError) return err.body.message;
  if (err instanceof Error) return err.message;
  return "Action impossible";
}

export default function UtilisateursPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [target, setTarget] = useState<any | null>(null);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("user");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [authRole, setAuthRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");

  const { data, isLoading, isError } = useAdminUsers({
    status: statusFilter === "all" ? undefined : statusFilter,
    q: search || undefined,
  });
  const updateStatus = useUpdateUserStatus();
  const createUser = useCreateAuthAdminUser();
  const updateUser = useUpdateAuthAdminUser();
  const setRole = useSetAuthAdminRole();
  const setPassword = useSetAuthAdminPassword();
  const removeUser = useRemoveAuthAdminUser();
  const sessionsQuery = useAuthAdminUserSessions(
    dialog === "sessions" && target?._id ? target._id : null
  );
  const revokeSession = useRevokeAuthAdminUserSession();
  const revokeAllSessions = useRevokeAuthAdminUserSessions();

  const allUsers = data?.data ?? [];

  const stats = useMemo(() => {
    const total = data?.total ?? allUsers.length;
    const active = allUsers.filter((u: any) => u.status === "active").length;
    const banned = allUsers.filter((u: any) => u.status === "banned").length;
    const admins = allUsers.filter((u: any) => u.role === "admin").length;
    const couriers = allUsers.filter((u: any) => u.role === "livreur").length;
    return { total, active, banned, admins, couriers };
  }, [allUsers, data?.total]);

  const users = useMemo(() => {
    let rows = [...allUsers];
    if (roleFilter !== "all") {
      rows = rows.filter((u: any) => u.role === roleFilter);
    }
    if (sortKey) {
      rows.sort((a: any, b: any) => {
        let cmp = 0;
        if (sortKey === "name") {
          cmp = String(`${a.firstName} ${a.lastName}`).localeCompare(
            String(`${b.firstName} ${b.lastName}`),
            "fr"
          );
        } else if (sortKey === "joined") {
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortKey === "articles") {
          cmp = (a.articlesCount ?? 0) - (b.articlesCount ?? 0);
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [allUsers, roleFilter, sortKey, sortDir]);

  const openDialog = (mode: DialogMode, user?: any) => {
    setTarget(user || null);
    setDialog(mode);
    if (mode === "create") {
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("user");
    }
    if (mode === "edit" && user) {
      setEditName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setEditEmail(user.email || "");
    }
    if (mode === "role" && user) {
      setAuthRole(user.authRole === "admin" ? "admin" : "user");
    }
    if (mode === "password") setNewPassword("");
  };

  const closeDialog = () => {
    setDialog(null);
    setTarget(null);
  };

  const handleBan = (user: any) => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    updateStatus.mutate(
      { id: user._id, status: newStatus },
      {
        onSuccess: () =>
          showToast(
            newStatus === "banned"
              ? `${user.pseudo} a été banni.`
              : `${user.pseudo} a été débanni.`,
            newStatus === "banned" ? "warning" : "success"
          ),
        onError: (err) => showToast(errMsg(err), "error"),
      }
    );
  };

  const columns = [
    {
      key: "user",
      header: "Utilisateur",
      sort: {
        active: sortKey === "name" ? sortDir : null,
        onChange: (dir: SortDir) => {
          setSortKey("name");
          setSortDir(dir);
        },
        ascLabel: "A → Z",
        descLabel: "Z → A",
      },
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={u.avatar} alt={u.pseudo} />
            <AvatarFallback>{(u.firstName || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-xs text-muted-foreground">@{u.pseudo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      className: "hidden md:table-cell",
      menu: {
        label: "Rôle",
        value: roleFilter,
        onChange: setRoleFilter,
        options: [
          { value: "all", label: "Tous les rôles" },
          { value: "admin", label: "Admin" },
          ...ACCOUNT_ROLES.map((role) => ({
            value: role,
            label: accountRoleLabels[role],
          })),
        ],
      },
      render: (u: any) => (
        <Badge
          variant="outline"
          className={
            roleBadgeClass[u.role] ||
            "border-transparent bg-secondary text-secondary-foreground"
          }
        >
          {roleLabel(u.role)}
        </Badge>
      ),
    },
    {
      key: "destination",
      header: "Univers",
      className: "hidden lg:table-cell",
      render: (u: any) => {
        const dest = u.listingDestination as ListingDestination | undefined;
        if (!dest || u.role === "acheteur" || u.role === "livreur") {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <span className="text-xs text-muted-foreground">
            {listingDestinationLabels[dest] ?? dest}
          </span>
        );
      },
    },
    {
      key: "phone",
      header: "Téléphone",
      className: "hidden xl:table-cell",
      render: (u: any) => (
        <span className="text-muted-foreground">{u.phone}</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      menu: {
        label: "Statut",
        value: statusFilter,
        onChange: setStatusFilter,
        options: [
          { value: "all", label: "Tous les statuts" },
          { value: "active", label: "Actif" },
          { value: "banned", label: "Banni" },
        ],
      },
      render: (u: any) => {
        const config = statusConfig[u.status] || statusConfig.active;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "articles",
      header: "Articles",
      className: "hidden lg:table-cell",
      sort: {
        active: sortKey === "articles" ? sortDir : null,
        onChange: (dir: SortDir) => {
          setSortKey("articles");
          setSortDir(dir);
        },
      },
      render: (u: any) => (
        <span className="text-muted-foreground">{u.articlesCount ?? 0}</span>
      ),
    },
    {
      key: "joined",
      header: "Inscrit le",
      className: "hidden sm:table-cell",
      sort: {
        active: sortKey === "joined" ? sortDir : null,
        onChange: (dir: SortDir) => {
          setSortKey("joined");
          setSortDir(dir);
        },
        ascLabel: "Plus ancien",
        descLabel: "Plus récent",
      },
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
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={() => setSelectedUser(u)}
              className="cursor-pointer"
            >
              <FiEye className="h-4 w-4 mr-2" />
              Voir le profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDialog("edit", u)}
              className="cursor-pointer"
            >
              <FiEdit2 className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDialog("role", u)}
              className="cursor-pointer"
            >
              <FiShield className="h-4 w-4 mr-2" />
              Changer le rôle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDialog("password", u)}
              className="cursor-pointer"
            >
              <FiKey className="h-4 w-4 mr-2" />
              Mot de passe
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDialog("sessions", u)}
              className="cursor-pointer"
            >
              <FiMonitor className="h-4 w-4 mr-2" />
              Sessions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleBan(u)}
              className="cursor-pointer"
            >
              <FiSlash className="h-4 w-4 mr-2" />
              {u.status === "banned" ? "Débannir" : "Bannir"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDialog("remove", u)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading && !isError && allUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const busy =
    createUser.isPending ||
    updateUser.isPending ||
    setRole.isPending ||
    setPassword.isPending ||
    removeUser.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Better Auth admin — create, rôle, mot de passe, sessions, ban
          </p>
        </div>
        <Button size="sm" onClick={() => openDialog("create")}>
          <FiPlus className="h-4 w-4 mr-1" /> Nouvel utilisateur
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={String(stats.total)}
          description={`${users.length} affiché${users.length !== 1 ? "s" : ""}`}
          icon={FiUsers}
        />
        <StatCard
          label="Actifs"
          value={String(stats.active)}
          description="Non bannis"
          icon={FiUserCheck}
        />
        <StatCard
          label="Bannés"
          value={String(stats.banned)}
          description="Accès restreint"
          icon={FiUserX}
        />
        <StatCard
          label="Admins"
          value={String(stats.admins)}
          description={`${stats.couriers} livreur${stats.couriers !== 1 ? "s" : ""}`}
          icon={FaUserShield}
        />
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par nom, pseudo ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        emptyMessage="Aucun utilisateur trouvé"
      />

      {/* Create */}
      <Dialog
        open={dialog === "create"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
            <DialogDescription>
              POST /auth/admin/create-user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Rôle Better Auth</Label>
              <Select value={createRole} onValueChange={setCreateRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              disabled={busy || !createName || !createEmail || !createPassword}
              onClick={() =>
                createUser.mutate(
                  {
                    name: createName.trim(),
                    email: createEmail.trim(),
                    password: createPassword,
                    role: createRole,
                  },
                  {
                    onSuccess: () => {
                      showToast("Utilisateur créé", "success");
                      closeDialog();
                    },
                    onError: (err) => showToast(errMsg(err), "error"),
                  }
                )
              }
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={dialog === "edit"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {target?.pseudo}</DialogTitle>
            <DialogDescription>POST /auth/admin/update-user</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              disabled={busy || !target || !editName.trim()}
              onClick={() =>
                updateUser.mutate(
                  {
                    userId: target._id,
                    data: {
                      name: editName.trim(),
                      ...(editEmail.trim()
                        ? { email: editEmail.trim() }
                        : {}),
                    },
                  },
                  {
                    onSuccess: () => {
                      showToast("Utilisateur mis à jour", "success");
                      closeDialog();
                    },
                    onError: (err) => showToast(errMsg(err), "error"),
                  }
                )
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role */}
      <Dialog open={dialog === "role"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rôle — {target?.pseudo}</DialogTitle>
            <DialogDescription>POST /auth/admin/set-role</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Rôle Better Auth</Label>
            <Select value={authRole} onValueChange={setAuthRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              disabled={busy || !target}
              onClick={() =>
                setRole.mutate(
                  { userId: target._id, role: authRole },
                  {
                    onSuccess: () => {
                      showToast(`Rôle → ${authRole}`, "success");
                      closeDialog();
                    },
                    onError: (err) => showToast(errMsg(err), "error"),
                  }
                )
              }
            >
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password */}
      <Dialog
        open={dialog === "password"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe — {target?.pseudo}</DialogTitle>
            <DialogDescription>
              POST /auth/admin/set-user-password
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              disabled={busy || !target || newPassword.length < 8}
              onClick={() =>
                setPassword.mutate(
                  { userId: target._id, newPassword },
                  {
                    onSuccess: () => {
                      showToast("Mot de passe mis à jour", "success");
                      closeDialog();
                    },
                    onError: (err) => showToast(errMsg(err), "error"),
                  }
                )
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions */}
      <Dialog
        open={dialog === "sessions"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sessions — {target?.pseudo}</DialogTitle>
            <DialogDescription>
              list / revoke session(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {sessionsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : (sessionsQuery.data?.sessions || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune session</p>
            ) : (
              (sessionsQuery.data?.sessions || []).map((s, i) => (
                <div
                  key={s.token || s.id || i}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {s.userAgent || "Session"}
                    </p>
                    <p className="text-muted-foreground">
                      {s.ipAddress || "—"} ·{" "}
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                  {s.token ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={revokeSession.isPending}
                      onClick={() =>
                        revokeSession.mutate(s.token!, {
                          onSuccess: () =>
                            showToast("Session révoquée", "success"),
                          onError: (err) => showToast(errMsg(err), "error"),
                        })
                      }
                    >
                      Révoquer
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Fermer
            </Button>
            <Button
              variant="destructive"
              disabled={!target || revokeAllSessions.isPending}
              onClick={() =>
                revokeAllSessions.mutate(target._id, {
                  onSuccess: () =>
                    showToast("Toutes les sessions révoquées", "warning"),
                  onError: (err) => showToast(errMsg(err), "error"),
                })
              }
            >
              Tout révoquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove */}
      <Dialog
        open={dialog === "remove"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer {target?.pseudo} ?</DialogTitle>
            <DialogDescription>
              POST /auth/admin/remove-user — action irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={busy || !target}
              onClick={() =>
                removeUser.mutate(target._id, {
                  onSuccess: () => {
                    showToast("Utilisateur supprimé", "warning");
                    closeDialog();
                  },
                  onError: (err) => showToast(errMsg(err), "error"),
                })
              }
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative bg-background rounded-xl border border-border shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
            >
              &times;
            </button>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={selectedUser.avatar}
                  alt={selectedUser.pseudo}
                />
                <AvatarFallback>
                  {(selectedUser.firstName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{selectedUser.pseudo}
                </p>
                <Badge
                  variant={
                    statusConfig[selectedUser.status]?.variant || "secondary"
                  }
                  className="mt-1"
                >
                  {statusConfig[selectedUser.status]?.label ||
                    selectedUser.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">
                  {selectedUser.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium text-foreground">
                  {selectedUser.phone}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Rôle UI</span>
                <span className="font-medium text-foreground">
                  {roleLabel(selectedUser.role || "acheteur")}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Rôle Auth</span>
                <span className="font-medium text-foreground">
                  {selectedUser.authRole || "user"}
                </span>
              </div>
              {selectedUser.shopKind && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Type boutique</span>
                  <span className="font-medium text-foreground">
                    {shopKindLabels[selectedUser.shopKind as ShopKind] ??
                      selectedUser.shopKind}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Inscrit le</span>
                <span className="font-medium text-foreground">
                  {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
