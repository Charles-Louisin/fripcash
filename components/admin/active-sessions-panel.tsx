"use client";

import Link from "next/link";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { filterByDateRange } from "@/lib/admin-date-filter";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";
import type { AdminUserSession } from "@/lib/admin-platform";
import { sessionRoleLabels } from "@/lib/admin-platform";
import { FiArrowRight } from "react-icons/fi";

const roleLabels = sessionRoleLabels;

const roleVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  acheteur: "outline",
  particulier: "secondary",
  boutique: "secondary",
  commerceLocal: "secondary",
  grandeSurface: "secondary",
  livreur: "secondary",
  vendeur: "secondary",
};

function DeviceIcon({ device }: { device: AdminUserSession["device"] }) {
  if (device === "mobile") return <Smartphone className="h-3.5 w-3.5" />;
  if (device === "tablet") return <Tablet className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActiveSessionsPanel() {
  const range = useAdminDateRange();
  const sessions = useAdminPlatformStore((s) => s.userSessions);
  const inRange = filterByDateRange(
    sessions,
    (s) => s.startedAtIso,
    range.from,
    range.to
  );
  const active = inRange.filter((s) => s.status !== "ended").slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Sessions en cours</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {inRange.filter((s) => s.status === "active").length} actives ·{" "}
            {inRange.filter((s) => s.status === "idle").length} inactives · {range.label}
          </p>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {active.length} en ligne
        </Badge>
      </div>

      <div className="space-y-3">
        {active.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 py-2 border-b border-border last:border-0"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials(session.displayName)}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                  session.status === "active" ? "bg-green-500" : "bg-amber-400"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{session.displayName}</p>
                <Badge variant={roleVariant[session.role]} className="text-[10px] px-1.5 py-0">
                  {roleLabels[session.role]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <DeviceIcon device={session.device} />
                {session.browser} · {session.lastSeenLabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
        <Link href="/admin/sessions" className="gap-1">
          Voir toutes les sessions <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
