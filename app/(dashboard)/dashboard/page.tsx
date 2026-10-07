"use client";

import Link from "next/link";
import { useMe } from "@/hooks/use-auth";
import { DashboardOverviewByRole } from "@/components/dashboard/overview-by-role";

export default function DashboardOverviewPage() {
  const { data: user, isLoading, isError, isFetched } = useMe();

  if (isLoading || !isFetched) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium">
          Connecte-toi pour voir ton tableau de bord
        </p>
        <Link
          href="/connexion"
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return <DashboardOverviewByRole user={user} />;
}
