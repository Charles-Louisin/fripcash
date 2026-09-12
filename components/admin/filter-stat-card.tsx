"use client";

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

type FilterStatCardProps = {
  label: string;
  value: string;
  description: string;
  actionLabel: string;
  icon: IconType;
  active?: boolean;
  onClick: () => void;
};

/** Clickable KPI card used as a filter (thriftcash AdminFilterStatCard). */
export function FilterStatCard({
  label,
  value,
  description,
  actionLabel,
  icon: Icon,
  active,
  onClick,
}: FilterStatCardProps) {
  return (
    <button type="button" onClick={onClick} className="h-full w-full text-left">
      <Card
        className={cn(
          "h-full gap-0 py-0 shadow-sm transition-colors hover:border-primary/35",
          active && "border-primary/50 ring-1 ring-primary/20",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5 pt-5 pb-2">
          <div className="min-w-0 space-y-1">
            <CardDescription className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {value}
            </CardTitle>
          </div>
          <Icon className="size-5 shrink-0 text-primary" />
        </CardHeader>
        <CardContent className="px-5 pt-0 pb-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </CardContent>
        <CardFooter className="mt-auto border-t border-border px-5 pt-3 pb-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {actionLabel}
            <FiArrowUpRight className="size-3.5" />
          </span>
        </CardFooter>
      </Card>
    </button>
  );
}
