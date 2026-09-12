export type DatePreset = "today" | "7d" | "30d" | "90d" | "ytd" | "custom";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: "Aujourd'hui",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "3 derniers mois",
  ytd: "Année en cours",
  custom: "Personnalisé",
};

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
  days: number;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function resolveDateRange(
  preset: DatePreset,
  customFrom?: string,
  customTo?: string
): DateRange {
  const to = endOfDay(new Date());

  if (preset === "custom" && customFrom && customTo) {
    const from = startOfDay(new Date(customFrom));
    const toCustom = endOfDay(new Date(customTo));
    const days = Math.max(
      1,
      Math.ceil((toCustom.getTime() - from.getTime()) / 86_400_000) + 1
    );
    const label = `${from.toLocaleDateString("fr-FR")} — ${toCustom.toLocaleDateString("fr-FR")}`;
    return { from, to: toCustom, label, days };
  }

  const from = startOfDay(new Date());

  switch (preset) {
    case "today":
      break;
    case "7d":
      from.setDate(to.getDate() - 6);
      break;
    case "30d":
      from.setDate(to.getDate() - 29);
      break;
    case "90d":
      from.setDate(to.getDate() - 89);
      break;
    case "ytd":
      from.setMonth(0, 1);
      break;
    default:
      from.setDate(to.getDate() - 89);
      break;
  }

  const days = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1
  );

  return {
    from,
    to,
    label: DATE_PRESET_LABELS[preset === "custom" ? "90d" : preset],
    days,
  };
}

export function isDateInRange(
  value: Date | string,
  from: Date,
  to: Date
): boolean {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return true;
  return d >= from && d <= to;
}

export function filterByDateRange<T>(
  items: readonly T[],
  getDate: (item: T) => string | Date,
  from: Date,
  to: Date
): T[] {
  return items.filter((item) => isDateInRange(getDate(item), from, to));
}

export function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
