"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSidebar, UserMobileSidebar } from "@/components/dashboard/user-sidebar";
import { UserTopbar } from "@/components/dashboard/user-topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMe } from "@/hooks/use-auth";
import { useProfileStore } from "@/stores/profile-store";
import { needsEmailVerification } from "@/lib/auth-redirect";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading, isError } = useMe();
  const hydrateFromUser = useProfileStore((s) => s.hydrateFromUser);

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/connexion");
      return;
    }
    if (!user) return;
    if (user.isAdmin) {
      router.replace("/admin");
      return;
    }
    if (user.courier) {
      router.replace("/livreur");
      return;
    }
    if (needsEmailVerification(user)) {
      router.replace("/connexion");
    }
  }, [isLoading, isError, user, router]);

  // Sync profile store from API user data
  useEffect(() => {
    if (user) hydrateFromUser(user);
  }, [user, hydrateFromUser]);

  // Show a loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.isAdmin || user.courier || needsEmailVerification(user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
