"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readToken } from "@/lib/api";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CourierMobileSidebar,
  CourierSidebar,
  CourierTopbar,
} from "@/components/livreur/courier-sidebar";

export default function LivreurLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!readToken()) router.replace("/connexion");
  }, [router]);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <CourierSidebar collapsed={collapsed} />
        <CourierMobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <CourierTopbar
            onMenuClick={() => setMobileOpen(true)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
