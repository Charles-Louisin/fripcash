"use client";

import { FiMenu, FiBell, FiSidebar } from "react-icons/fi";
import { mockCurrentUser, mockConversations } from "@/lib/mock-data";

interface UserTopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function UserTopbar({ onMenuClick, collapsed, onToggleCollapse }: UserTopbarProps) {
  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unread, 0);

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

      <div className="flex-1" />

      {/* Notifications */}
      <button type="button" className="relative p-2 rounded-lg hover:bg-accent transition-colors">
        <FiBell className="h-5 w-5 text-muted-foreground" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mockCurrentUser.avatar} alt={mockCurrentUser.name} className="w-full h-full object-cover" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-none">{mockCurrentUser.name}</p>
          <p className="text-[11px] text-muted-foreground">Mon compte</p>
        </div>
      </div>
    </header>
  );
}
