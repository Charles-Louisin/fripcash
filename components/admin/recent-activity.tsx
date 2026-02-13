"use client";

import { cn } from "@/lib/utils";
import { FiUserPlus, FiShoppingCart, FiAlertTriangle, FiPackage } from "react-icons/fi";
import type { ActivityItem } from "@/lib/mock-data";

const typeConfig = {
  signup: { icon: FiUserPlus, color: "text-blue-500", bg: "bg-blue-50" },
  sale: { icon: FiShoppingCart, color: "text-primary", bg: "bg-primary/10" },
  dispute: { icon: FiAlertTriangle, color: "text-orange-500", bg: "bg-orange-50" },
  article: { icon: FiPackage, color: "text-purple-500", bg: "bg-purple-50" },
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const config = typeConfig[item.type];
        return (
          <div key={item.id} className="flex items-start gap-3 py-2">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", config.bg)}>
              <config.icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-tight">{item.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
