"use client";

import { cn } from "@/lib/utils";
import { type IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: IconType;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change && (
        <p
          className={cn(
            "text-xs mt-1 font-medium",
            changeType === "positive" && "text-green-600",
            changeType === "negative" && "text-red-500",
            changeType === "neutral" && "text-muted-foreground"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
