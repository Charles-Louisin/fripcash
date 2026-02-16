"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import { FiBell, FiCheckCircle, FiPackage, FiMessageSquare } from "react-icons/fi";

const typeIcons: Record<string, React.ElementType> = {
  order: FiPackage,
  message: FiMessageSquare,
  offer: FiPackage,
  default: FiBell,
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useNotifications(page, limit);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`
              : "Toutes tes notifications"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors self-start"
          >
            <FiCheckCircle className="h-4 w-4" />
            {markAllAsRead.isPending ? "..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FiBell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Aucune notification</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tu seras notifié des commandes, messages et offres ici.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {notifications.map((n: any) => {
              const Icon = typeIcons[n.type] || typeIcons.default;
              return (
                <Link
                  key={n._id}
                  href={n.link || "/dashboard"}
                  onClick={() => !n.read && markAsRead.mutate(n._id)}
                  className={`flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" title="Non lue" />
                  )}
                </Link>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
