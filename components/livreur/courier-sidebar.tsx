"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import { FiLogOut, FiPackage, FiDollarSign, FiMenu } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";

const links = [
  { href: "/livreur", label: "Missions", icon: MdOutlineDashboard, exact: true },
  { href: "/livreur/gains", label: "Gains", icon: FiDollarSign },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CourierSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/livreur" className="font-bold text-primary truncate">
          {collapsed ? "FC" : "FripCash Livreur"}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? l.label : undefined}
            >
              <l.icon className="h-5 w-5 shrink-0" />
              {!collapsed && l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/connexion");
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <FiLogOut className="h-5 w-5" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}

export function CourierMobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-72 flex-col bg-sidebar p-4">
        <p className="mb-4 font-bold text-primary">FripCash Livreur</p>
        <nav className="flex-1 space-y-1">
          {links.map((l) => {
            const active = isActive(pathname, l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent"
                )}
              >
                <l.icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive"
          onClick={() => {
            logout();
            router.push("/connexion");
          }}
        >
          <FiLogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </aside>
    </div>
  );
}

export function CourierTopbar({
  onMenuClick,
  collapsed,
  onToggleCollapse,
}: {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <button
        type="button"
        className="md:hidden rounded-md p-2 hover:bg-muted"
        onClick={onMenuClick}
      >
        <FiMenu className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="hidden rounded-md p-2 hover:bg-muted md:inline-flex"
        onClick={onToggleCollapse}
      >
        <FiPackage className="h-5 w-5" />
      </button>
      <p className="text-sm font-medium">Espace livreur</p>
    </header>
  );
}
