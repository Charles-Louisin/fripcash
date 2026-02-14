"use client";

import { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiLogOut, FiUser, FiSidebar, FiSearch, FiChevronDown } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminTopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Map pathnames to breadcrumb labels
const pageLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/articles": "Articles",
  "/admin/commandes": "Commandes",
  "/admin/litiges": "Litiges",
  "/admin/categories": "Catégories",
  "/admin/parametres": "Paramètres",
};

export function AdminTopbar({ onMenuClick, collapsed, onToggleCollapse }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname] || "Dashboard";
  const [searchMode, setSearchMode] = useState<"articles" | "membres">("articles");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 gap-3">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors"
      >
        <FiMenu className="h-5 w-5" />
      </button>

      {/* Desktop collapse/expand toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden md:flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
      >
        <FiSidebar className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Page title / Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0">
        <h2 className="text-sm font-semibold text-foreground">{pageLabel}</h2>
      </div>

      {/* Search bar with mode toggle */}
      <div className="flex items-center flex-1 max-w-sm ml-2">
        <div ref={dropRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropOpen(!dropOpen)}
            className="inline-flex items-center gap-1 text-xs font-medium h-8 px-2.5 rounded-l-lg border border-r-0 border-input bg-background hover:bg-muted transition-colors"
          >
            {searchMode === "articles" ? "Articles" : "Membres"}
            <FiChevronDown className={`h-3 w-3 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </button>
          {dropOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-background border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => { setSearchMode("articles"); setDropOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${searchMode === "articles" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                Articles
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode("membres"); setDropOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${searchMode === "membres" ? "font-semibold text-foreground bg-muted/50" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                Membres
              </button>
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder={searchMode === "articles" ? "Rechercher des articles..." : "Rechercher des membres..."}
            className="w-full h-8 pl-8 pr-3 rounded-r-lg border border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors">
          <FiBell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg hover:bg-accent px-2 py-1.5 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/parametres" className="cursor-pointer">
                <FiUser className="h-4 w-4 mr-2" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer text-destructive">
                <FiLogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
