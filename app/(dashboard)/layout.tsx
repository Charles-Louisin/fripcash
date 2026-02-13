"use client";

import { useState } from "react";
import { UserSidebar, UserMobileSidebar } from "@/components/dashboard/user-sidebar";
import { UserTopbar } from "@/components/dashboard/user-topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <UserSidebar collapsed={collapsed} />
        <UserMobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <UserTopbar
            onMenuClick={() => setMobileOpen(true)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
