"use client";

import { FiRotateCcw } from "react-icons/fi";
import { useCategories } from "@/hooks/use-categories";

export interface Filters {
  categories: string[];
  conditions: string[];
  sizes: string[];
  minPrice: string;
  maxPrice: string;
}

export const defaultFilters: Filters = {
  categories: [],
  conditions: [],
  sizes: [],
  minPrice: "",
  maxPrice: "",
};

const CONDITIONS = [
  "Neuf avec étiquette",
  "Neuf sans étiquette",
  "Très bon état",
  "Bon état",
  "Satisfaisant",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5 group">
      <span
        className={`flex items-center justify-center h-4.5 w-4.5 rounded border-2 transition-colors shrink-0 ${
          checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 group-hover:border-primary/60"
        }`}
      >
        {checked && (
          <svg
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onApply?: () => void;
  showApply?: boolean;
}

export function ProductFilters({
  filters,
  onChange,
  onApply,
  showApply = false,
}: ProductFiltersProps) {
  const { data: categoryList = [] } = useCategories();
  const CATEGORIES = categoryList.map((c: any) => c.name);

  const toggleArray = (
    arr: string[],
    value: string,
    checked: boolean
  ): string[] =>
    checked ? [...arr, value] : arr.filter((v) => v !== value);

  const reset = () => onChange(defaultFilters);

  const activeCount =
    filters.categories.length +
    filters.conditions.length +
    filters.sizes.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
        >
          <FiRotateCcw className="h-3.5 w-3.5" />
          Réinitialiser les filtres
        </button>
      )}

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Catégories
        </h4>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <CheckboxItem
              key={cat}
              label={cat}
              checked={filters.categories.includes(cat)}
              onChange={(checked) =>
                onChange({
                  ...filters,
                  categories: toggleArray(filters.categories, cat, checked),
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">État</h4>
        <div className="space-y-0.5">
          {CONDITIONS.map((cond) => (
            <CheckboxItem
              key={cond}
              label={cond}
              checked={filters.conditions.includes(cond)}
              onChange={(checked) =>
                onChange({
                  ...filters,
                  conditions: toggleArray(filters.conditions, cond, checked),
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Taille</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() =>
                  onChange({
                    ...filters,
                    sizes: toggleArray(filters.sizes, size, !isActive),
                  })
                }
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Prix (GNF)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              onChange({ ...filters, minPrice: e.target.value })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: e.target.value })
            }
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Mobile apply button */}
      {showApply && (
        <button
          onClick={onApply}
          className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Appliquer les filtres
        </button>
      )}
    </div>
  );
}
