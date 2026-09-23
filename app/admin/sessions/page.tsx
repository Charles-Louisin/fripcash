"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { FiUsers, FiMonitor, FiShield, FiUserCheck } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";
import type { AdminUserSession, SessionStatus } from "@/lib/admin-platform";
import { sessionRoleLabels } from "@/lib/admin-platform";

/** No admin sessions API yet — render empty live shell (no mock). */
const LIVE_SESSIONS: AdminUserSession[] = [];

const roleLabels = sessionRoleLabels;

const statusLabels: Record<SessionStatus, string> = {
  active: "Active",
  idle: "Inactive",
  ended: "Terminée",
};

function DeviceIcon({ device }: { device: AdminUserSession["device"] }) {
  if (device === "mobile")
    return <Smartphone className="h-4 w-4 text-muted-foreground" />;
  if (device === "tablet")
    return <Tablet className="h-4 w-4 text-muted-foreground" />;
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const sessions = LIVE_SESSIONS;

  const stats = useMemo(() => {
    const active = sessions.filter((s) => s.status === "active").length;
    const idle = sessions.filter((s) => s.status === "idle").length;
    const today = sessions.filter((s) => {
      const d = new Date(s.startedAtIso);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    const admins = sessions.filter(
      (s) => s.role === "admin" && s.status !== "ended"
    ).length;
    return { active, idle, today, admins };
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
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
  }, [sessions, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sessions utilisateurs"
        description={`Connexions actives — ${range.label}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <StatCard
          title="Sessions actives"
          value={stats.active.toString()}
          change={`${stats.idle} inactives`}
          changeType="positive"
          icon={FiUserCheck}
        />
        <StatCard
          title="Connexions aujourd'hui"
          value={stats.today.toString()}
          change="Toutes plateformes"
          changeType="neutral"
          icon={FiUsers}
        />
        <StatCard
          title="Admins en ligne"
          value={stats.admins.toString()}
          change="Espace super admin"
          changeType="neutral"
          icon={FiShield}
        />
        <StatCard
          title="Total enregistré"
          value={sessions.length.toString()}
          change="Données live uniquement"
          changeType="neutral"
          icon={FiMonitor}
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
        emptyMessage="Aucune session — endpoint admin sessions indisponible"
        columns={[
          {
            key: "user",
            header: "Utilisateur",
            render: (s) => (
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                  {initials(s.displayName)}
                </div>
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
                {roleLabels[s.role] ?? s.role}
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
              <span className="text-sm text-muted-foreground">
                {s.startedAtLabel}
              </span>
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
        ]}
      />
    </div>
  );
}
