"use client";

import { useState } from "react";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <AdminSidebar collapsed={collapsed} />

        {/* Mobile sidebar */}
        <AdminMobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopbar
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
