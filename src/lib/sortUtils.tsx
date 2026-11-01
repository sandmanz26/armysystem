import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export type SortDir = "asc" | "desc";

/** Visual sort indicator for table column headers */
export function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={11} className="text-gray-300 flex-shrink-0" />;
  return dir === "asc"
    ? <ArrowUp size={11} className="text-brand-primary flex-shrink-0" />
    : <ArrowDown size={11} className="text-brand-primary flex-shrink-0" />;
}

/** Toggle sort: same field flips direction, new field defaults to asc */
export function nextSort(
  currentField: string,
  clickedField: string,
  currentDir: SortDir
): { field: string; dir: SortDir } {
  if (currentField === clickedField) {
    return { field: clickedField, dir: currentDir === "asc" ? "desc" : "asc" };
  }
  return { field: clickedField, dir: "asc" };
}

/** Generic sort: string/number comparison with locale-aware collation */
export function sortBy<T>(data: T[], field: keyof T, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }
    const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return dir === "asc" ? cmp : -cmp;
  });
}
