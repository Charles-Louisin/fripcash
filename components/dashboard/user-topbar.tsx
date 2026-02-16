"use client";

import { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiSidebar, FiSearch, FiChevronDown } from "react-icons/fi";
import { useConversations } from "@/hooks/use-messages";
import { useProfileStore } from "@/stores/profile-store";

interface UserTopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function UserTopbar({ onMenuClick, collapsed, onToggleCollapse }: UserTopbarProps) {
  const { data: conversations = [] } = useConversations();
  const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
  const { avatar, name } = useProfileStore();
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
    <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0">
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        onClick={onMenuClick}
      >
        <FiMenu className="h-5 w-5 text-foreground" />
      </button>

      {/* Desktop collapse toggle */}
      <button
        type="button"
        className="hidden md:flex p-2 rounded-lg hover:bg-accent transition-colors"
        onClick={onToggleCollapse}
        title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
      >
        <FiSidebar className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Search bar with mode toggle */}
      <div className="flex items-center flex-1 max-w-md">
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

      {/* Notifications */}
      <button type="button" className="relative p-2 rounded-lg hover:bg-accent transition-colors ml-auto">
        <FiBell className="h-5 w-5 text-muted-foreground" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">{(name || "U").charAt(0)}</span>
          )}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-none">{name}</p>
          <p className="text-[11px] text-muted-foreground">Mon compte</p>
        </div>
      </div>
    </header>
  );
}
