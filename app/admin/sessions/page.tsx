"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone, Tablet, LogOut } from "lucide-react";
import { FiUsers, FiMonitor, FiShield, FiUserCheck } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { filterByDateRange } from "@/lib/admin-date-filter";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";
import { useToast } from "@/components/ui/toast";
import type { AdminUserSession, SessionStatus } from "@/lib/admin-platform";
import { sessionRoleLabels } from "@/lib/admin-platform";

const roleLabels = sessionRoleLabels;

const statusLabels: Record<SessionStatus, string> = {
  active: "Active",
  idle: "Inactive",
  ended: "Terminée",
};

function DeviceIcon({ device }: { device: AdminUserSession["device"] }) {
  if (device === "mobile") return <Smartphone className="h-4 w-4 text-muted-foreground" />;
  if (device === "tablet") return <Tablet className="h-4 w-4 text-muted-foreground" />;
  return <Monitor className="h-4 w-4 text-muted-foreground" />;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminSessionsPage() {
  const range = useAdminDateRange();
  const { userSessions, revokeSession } = useAdminPlatformStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const rangedSessions = useMemo(
    () =>
      filterByDateRange(
        userSessions,
        (s) => s.startedAtIso,
        range.from,
        range.to
      ),
    [userSessions, range.from, range.to]
  );

  const stats = useMemo(() => {
    const active = rangedSessions.filter((s) => s.status === "active").length;
    const idle = rangedSessions.filter((s) => s.status === "idle").length;
    const today = rangedSessions.filter((s) => {
      const d = new Date(s.startedAtIso);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    const admins = rangedSessions.filter(
      (s) => s.role === "admin" && s.status !== "ended"
    ).length;
    return { active, idle, today, admins };
  }, [rangedSessions]);

  const filtered = useMemo(() => {
    return rangedSessions.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.displayName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.ip.includes(q);
      const matchesRole = roleFilter === "all" || s.role === roleFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [rangedSessions, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sessions utilisateurs"
        description={`Performance des connexions — ${range.label}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <StatCard
          title="Sessions actives"
          value={stats.active.toString()}
          change={`${stats.idle} inactives`}
          changeType="positive"
          icon={FiUserCheck}
          href="/admin/sessions"
          actionLabel="Voir sessions"
        />
        <StatCard
          title="Connexions aujourd'hui"
          value={stats.today.toString()}
          change="Toutes plateformes"
          changeType="neutral"
          icon={FiUsers}
          href="/admin/sessions"
          actionLabel="Voir sessions"
        />
        <StatCard
          title="Admins en ligne"
          value={stats.admins.toString()}
          change="Espace super admin"
          changeType="neutral"
          icon={FiShield}
          href="/admin/sessions"
          actionLabel="Voir sessions"
        />
        <StatCard
          title="Total enregistré"
          value={rangedSessions.length.toString()}
          change="Historique mock + live"
          changeType="neutral"
          icon={FiMonitor}
          href="/admin/sessions"
          actionLabel="Voir sessions"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher nom, email ou IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="acheteur">Acheteur</SelectItem>
            <SelectItem value="particulier">Particulier</SelectItem>
            <SelectItem value="boutique">Boutique</SelectItem>
            <SelectItem value="commerceLocal">Commerce local</SelectItem>
            <SelectItem value="grandeSurface">Grande surface</SelectItem>
            <SelectItem value="livreur">Livreur</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="idle">Inactive</SelectItem>
            <SelectItem value="ended">Terminée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered}
        getRowKey={(s) => s.id}
        emptyMessage="Aucune session trouvée"
        columns={[
          {
            key: "user",
            header: "Utilisateur",
            render: (s) => (
              <div className="flex items-center gap-3 min-w-[200px]">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials(s.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{s.displayName}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            header: "Rôle",
            render: (s) => (
              <Badge variant={s.role === "admin" ? "default" : "secondary"}>
                {roleLabels[s.role]}
              </Badge>
            ),
          },
          {
            key: "device",
            header: "Appareil",
            render: (s) => (
              <div className="flex items-center gap-2 text-sm">
                <DeviceIcon device={s.device} />
                <div>
                  <p>{s.browser}</p>
                  <p className="text-xs text-muted-foreground">{s.os}</p>
                </div>
              </div>
            ),
          },
          {
            key: "location",
            header: "Localisation",
            render: (s) => (
              <div className="text-sm">
                <p>{s.location}</p>
                <p className="text-xs text-muted-foreground font-mono">{s.ip}</p>
              </div>
            ),
          },
          {
            key: "started",
            header: "Début",
            render: (s) => (
              <span className="text-sm text-muted-foreground">{s.startedAtLabel}</span>
            ),
          },
          {
            key: "lastSeen",
            header: "Dernière activité",
            render: (s) => (
              <span className="text-sm">{s.lastSeenLabel}</span>
            ),
          },
          {
            key: "status",
            header: "Statut",
            render: (s) => (
              <Badge
                variant={
                  s.status === "active"
                    ? "default"
                    : s.status === "idle"
                      ? "secondary"
                      : "outline"
                }
                className={
                  s.status === "active"
                    ? "bg-green-600 hover:bg-green-600"
                    : undefined
                }
              >
                {statusLabels[s.status]}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (s) =>
              s.status !== "ended" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    revokeSession(s.id);
                    toast(`Session de ${s.displayName} révoquée`, "success");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Révoquer
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
        ]}
      />
    </div>
  );
}
