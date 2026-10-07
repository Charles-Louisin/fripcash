"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAuthAdminUsers,
  fetchAdminOrders,
  fetchAdminDisputes,
  fetchAdminListings,
  fetchAdminWallets,
  fetchAdminCouriers,
} from "@/lib/api";
import { formatGnf } from "@/lib/admin-platform";
import { FiX } from "react-icons/fi";

export type StatPanelKey =
  | "disputes"
  | "escrow"
  | "validations"
  | "users"
  | "listings"
  | "catalog"
  | "deliveries"
  | "commission";

const TITLES: Record<StatPanelKey, string> = {
  disputes: "Litiges ouverts",
  escrow: "Paiements bloqués",
  validations: "Validations boutique",
  users: "Utilisateurs",
  listings: "Articles",
  catalog: "Catalogue actif",
  deliveries: "Livreurs / livraisons",
  commission: "Commission",
};

function asArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.users)) return o.users;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

export function StatsDetailSheet({
  panel,
  onClose,
}: {
  panel: StatPanelKey | null;
  onClose: () => void;
}) {
  const open = panel != null;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats-panel", panel],
    enabled: open,
    queryFn: async () => {
      if (panel === "users" || panel === "validations") {
        const res = await fetchAuthAdminUsers({ limit: 200 });
        const users = asArray(res);
        if (panel === "validations") {
          return users.filter(
            (u) =>
              u.seller?.shopKind &&
              (u.seller.verificationStatus === "pending" ||
                u.seller.verificationStatus === "rejected")
          );
        }
        return users;
      }
      if (panel === "disputes") {
        return asArray(await fetchAdminDisputes()).filter(
          (d) => d.status !== "resolved"
        );
      }
      if (panel === "escrow") {
        return asArray(await fetchAdminWallets()).filter(
          (w) => (w.reservedGnf || w.reservedBalanceGnf || 0) > 0
        );
      }
      if (panel === "listings" || panel === "catalog") {
        return asArray(await fetchAdminListings());
      }
      if (panel === "deliveries") {
        return asArray(await fetchAdminCouriers());
      }
      if (panel === "commission") {
        const orders = asArray(await fetchAdminOrders());
        return orders.slice(0, 50);
      }
      return [];
    },
  });

  const rows = Array.isArray(data) ? data : [];

  return (
    <>
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">
            {panel ? TITLES[panel] : ""}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun élément
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row: any, i: number) => (
                <li
                  key={row.id || row._id || i}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium truncate">
                    {row.name ||
                      row.title ||
                      row.productTitle ||
                      row.email ||
                      row.userName ||
                      `Élément ${i + 1}`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {row.phoneNumber ||
                      row.phone ||
                      row.status ||
                      row.reason ||
                      row.zoneName ||
                      (row.reservedGnf != null
                        ? formatGnf(row.reservedGnf)
                        : null) ||
                      (row.amountGnf != null ? formatGnf(row.amountGnf) : null) ||
                      (row.amount != null ? formatGnf(row.amount) : "")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
