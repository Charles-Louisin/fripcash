"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { resolveAccountType } from "@/lib/account-type";

export function RequireSeller({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const type = resolveAccountType(user);

  useEffect(() => {
    if (!isLoading && user && !type.isSeller) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, type.isSeller, router]);

  if (isLoading || !user || !type.isSeller) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireShop({
  children,
  library,
  excel,
}: {
  children: React.ReactNode;
  library?: boolean;
  excel?: boolean;
}) {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const type = resolveAccountType(user);
  const allowed =
    type.isShop &&
    (!library || type.seesLibrary) &&
    (!excel || type.seesExcel);

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, allowed, router]);

  if (isLoading || !user || !allowed) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
