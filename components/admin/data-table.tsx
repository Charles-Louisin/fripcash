"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { FiCheck } from "react-icons/fi";

export type ColumnMenuOption = {
  value: string;
  label: string;
};

export type ColumnHeaderMenu = {
  /** Section title in the dropdown (e.g. "Rôle") */
  label?: string;
  value: string;
  options: ColumnMenuOption[];
  onChange: (value: string) => void;
};

export type ColumnSortMenu = {
  active: "asc" | "desc" | null;
  onChange: (dir: "asc" | "desc") => void;
  ascLabel?: string;
  descLabel?: string;
};

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
  /** Filter dropdown attached to the header chevron */
  menu?: ColumnHeaderMenu;
  /** Optional sort actions in the same (or own) header menu */
  sort?: ColumnSortMenu;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  getRowKey?: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
}

function ColumnHeaderControl({
  title,
  menu,
  sort,
}: {
  title: string;
  menu?: ColumnHeaderMenu;
  sort?: ColumnSortMenu;
}) {
  const hasMenu = !!menu || !!sort;
  if (!hasMenu) {
    return <span>{title}</span>;
  }

  const filterActive = menu && menu.value !== "all" && menu.value !== "";
  const sortActive = sort?.active != null;
  const active = filterActive || sortActive;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1 py-0.5 -mx-1 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            active && "text-primary"
          )}
        >
          <span>{title}</span>
          <HiOutlineChevronUpDown
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              active ? "text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {menu ? (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              {menu.label || title}
            </DropdownMenuLabel>
            {menu.options.map((opt) => {
              const selected = menu.value === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  className={cn(
                    "cursor-pointer justify-between",
                    selected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => menu.onChange(opt.value)}
                >
                  {opt.label}
                  {selected ? (
                    <FiCheck className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        ) : null}
        {menu && sort ? <DropdownMenuSeparator /> : null}
        {sort ? (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Trier
            </DropdownMenuLabel>
            {(
              [
                { dir: "asc" as const, label: sort.ascLabel || "Croissant" },
                { dir: "desc" as const, label: sort.descLabel || "Décroissant" },
              ] as const
            ).map((opt) => {
              const selected = sort.active === opt.dir;
              return (
                <DropdownMenuItem
                  key={opt.dir}
                  className={cn(
                    "cursor-pointer justify-between",
                    selected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => sort.onChange(opt.dir)}
                >
                  {opt.label}
                  {selected ? (
                    <FiCheck className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "Aucune donnée",
  className,
  getRowKey,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn("px-4", col.className)}>
                <ColumnHeaderControl
                  title={col.header}
                  menu={col.menu}
                  sort={col.sort}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => (
              <TableRow
                key={getRowKey?.(item, idx) ?? idx}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("px-4", col.className)}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
