"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { FiArrowUpRight } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  /** @deprecated use `label` */
  title?: string;
  label?: string;
  value: string;
  description?: string;
  /** @deprecated use `description` — kept for older call sites */
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  href?: string;
  actionLabel?: string;
  icon: IconType;
  className?: string;
};

/**
 * ThriftCash-style dashboard KPI card: label, value, description, footer link.
 */
export function StatCard({
  title,
  label,
  value,
  description,
  change,
  href,
  actionLabel = "Voir",
  icon: Icon,
  className,
}: StatCardProps) {
  const resolvedLabel = label ?? title ?? "";
  const resolvedDescription = description ?? change;

  return (
    <Card
      className={cn(
        "h-full gap-0 py-0 shadow-sm transition-colors hover:border-primary/35",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5 pt-5 pb-2">
        <div className="min-w-0 space-y-1">
          <CardDescription className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {resolvedLabel}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {value}
          </CardTitle>
        </div>
        <Icon className="size-5 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-5 pt-0 pb-3">
        {resolvedDescription ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {resolvedDescription}
          </p>
        ) : (
          <span className="block h-4" aria-hidden />
        )}
      </CardContent>
      {href ? (
        <CardFooter className="mt-auto border-t border-border px-5 pt-3 pb-4">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:underline"
          >
            {actionLabel}
            <FiArrowUpRight className="size-3.5" />
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
