"use client";

import { useState } from "react";
import { CalendarRange, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DATE_PRESET_LABELS,
  type DatePreset,
  resolveDateRange,
} from "@/lib/admin-date-filter";
import { useAdminDateFilterStore } from "@/stores/admin-date-filter-store";

const PRESETS: DatePreset[] = ["today", "7d", "30d", "90d", "ytd", "custom"];

export function AdminDateFilter() {
  const { preset, customFrom, customTo, setPreset, setCustomRange } =
    useAdminDateFilterStore();
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);
  const [open, setOpen] = useState(false);

  const range = resolveDateRange(preset, customFrom, customTo);
  const triggerLabel =
    preset === "custom"
      ? range.label
      : DATE_PRESET_LABELS[preset];

  const applyCustom = () => {
    if (!draftFrom || !draftTo) return;
    if (new Date(draftFrom) > new Date(draftTo)) return;
    setCustomRange(draftFrom, draftTo);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-normal">
          <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="max-w-[140px] truncate hidden sm:inline">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Période globale — filtre tous les tableaux de bord
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PRESETS.filter((p) => p !== "custom").map((p) => (
          <DropdownMenuItem
            key={p}
            onClick={() => {
              setPreset(p);
              setOpen(false);
            }}
            className="justify-between"
          >
            {DATE_PRESET_LABELS[p]}
            {preset === p && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 space-y-3">
          <p className="text-xs font-medium text-foreground">Plage personnalisée</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="admin-date-from" className="text-xs">
                Du
              </Label>
              <Input
                id="admin-date-from"
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-date-to" className="text-xs">
                Au
              </Label>
              <Input
                id="admin-date-to"
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={applyCustom}>
            Appliquer
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
