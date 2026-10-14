"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchZones } from "@/lib/api";

export function ShippingZoneField({
  value,
  onChange,
  required = true,
  className = "",
}: {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
  className?: string;
}) {
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["catalog-zones"],
    queryFn: fetchZones,
    staleTime: 30 * 60 * 1000,
  });
  const options = zones.filter((z) => z.isActive !== false);

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        Zone d’expédition{required ? " *" : ""}
      </label>
      <select
        required={required}
        value={value}
        disabled={isLoading}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">
          {isLoading ? "Chargement…" : "Choisir ta zone…"}
        </option>
        {options.map((z) => (
          <option key={z.id} value={z.id}>
            {z.nameFr}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-muted-foreground">
        Quartier d’où partent tes colis. Les frais de livraison sont calculés
        automatiquement à partir de cette zone.
      </p>
    </div>
  );
}
