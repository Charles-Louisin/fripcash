"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import {
  FiUser,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiSearch,
  FiLogOut,
  FiAlertCircle,
  FiSmartphone,
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { useProfileStore } from "@/stores/profile-store";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
} from "@/components/app-store-badges";

function AppPromo({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <a
        href={PLAY_STORE_URL !== "#" ? PLAY_STORE_URL : APP_STORE_URL}
        className="flex items-center justify-center rounded-lg p-2 text-primary hover:bg-primary/10"
        title="Télécharger l'app"
      >
        <FiSmartphone className="h-5 w-5" />
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FiSmartphone className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-semibold text-foreground">App FripCash</p>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Livreur, boutique de quartier, enseignes — dans l&apos;app.
      </p>
      <div className="flex gap-2">
        <a
          href={APP_STORE_URL}
          className="flex-1 rounded-md bg-zinc-950 px-2 py-1.5 text-center text-[10px] font-medium text-white hover:opacity-90"
        >
          App Store
        </a>
        <a
          href={PLAY_STORE_URL}
          className="flex-1 rounded-md bg-zinc-950 px-2 py-1.5 text-center text-[10px] font-medium text-white hover:opacity-90"
        >
          Play Store
        </a>
      </div>
    </div>
  );
}

const accountNav = [
  { href: "/dashboard", icon: MdOutlineDashboard, label: "Vue d'ensemble", exact: true },
  { href: "/dashboard/profil", icon: FiUser, label: "Mon profil" },
  { href: "/dashboard/commandes", icon: FiShoppingCart, label: "Mes commandes" },
  { href: "/dashboard/favoris", icon: FiHeart, label: "Mes favoris" },
  { href: "/dashboard/messages", icon: FiMessageSquare, label: "Messages" },
  { href: "/dashboard/notifications", icon: FiBell, label: "Notifications" },
];

const sellNav = [
  { href: "/dashboard/articles", icon: FiShoppingBag, label: "Mes annonces" },
  { href: "/dashboard/porte-monnaie", icon: IoWalletOutline, label: "Porte-monnaie" },
];

const settingsNav = [
  { href: "/dashboard/parametres", icon: FiSettings, label: "Paramètres" },
];

const navItems = [...accountNav, ...sellNav, ...settingsNav];

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ---- Logout Confirmation Dialog ----
function LogoutDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <FiAlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Confirmer la déconnexion</h3>
          <p className="text-sm text-muted-foreground">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">Annuler</button>
          <button type="button" onClick={onConfirm} className="flex-1 h-10 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors">Se déconnecter</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface UserSidebarProps {
  collapsed: boolean;
}

export function UserSidebar({ collapsed }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [search, setSearch] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { showToast } = useToast();
  const { avatar, name, pseudo } = useProfileStore();

  const filteredNav = search
    ? navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : navItems;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* User info */}
      <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-3")}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{(name || "U").charAt(0)}</span>
            )}
          </div>
        ) : (
          <Link href="/dashboard/profil" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
              {avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{(name || "U").charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">@{pseudo}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-md border border-sidebar-border bg-sidebar text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-colors"
            />
          </div>
        </div>
      )}

      {!collapsed && (
        <p className="px-5 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Mon compte
        </p>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {(search ? filteredNav : accountNav).map((item) => {
          const isActive = isNavActive(pathname, item.href, (item as { exact?: boolean }).exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!search && (
          <>
            {!collapsed && (
              <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Vente légère
              </p>
            )}
            {sellNav.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            {!collapsed && (
              <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Réglages
              </p>
            )}
            {settingsNav.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}

        {search && filteredNav.length === 0 && !collapsed && (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun résultat</p>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <AppPromo collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Se déconnecter" : undefined}
        >
          <FiLogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Se déconnecter</span>}
        </button>
      </div>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => { setLogoutOpen(false); logout(); showToast("Déconnexion réussie", "success"); router.push("/connexion"); }}
      />
    </aside>
  );
}

// Mobile sidebar overlay
export function UserMobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [search, setSearch] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { showToast } = useToast();
  const { avatar, name, pseudo } = useProfileStore();

  const filteredNav = search
    ? navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : navItems;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      <aside className="fixed inset-y-0 left-0 z-50 w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col md:hidden animate-in slide-in-from-left duration-300">
        {/* User info */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border gap-3">
          <Link href="/dashboard/profil" className="flex items-center gap-3 min-w-0" onClick={onClose}>
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
              {avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{(name || "U").charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">@{pseudo}</p>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-3">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-md border border-sidebar-border bg-sidebar text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-colors"
            />
          </div>
        </div>

        <p className="px-5 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Mon compte
        </p>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {(search ? filteredNav : accountNav).map((item) => {
            const isActive = isNavActive(pathname, item.href, (item as { exact?: boolean }).exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {!search && (
            <>
              <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Vente légère
              </p>
              {sellNav.map((item) => {
                const isActive = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Réglages
              </p>
              {settingsNav.map((item) => {
                const isActive = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-2">
          <AppPromo />
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-destructive hover:bg-destructive/10"
          >
            <FiLogOut className="h-5 w-5 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>

        <LogoutDialog
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => { setLogoutOpen(false); logout(); showToast("Déconnexion réussie", "success"); onClose(); router.push("/connexion"); }}
        />
      </aside>
    </>
  );
}
