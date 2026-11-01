import { useEffect, useState } from "react";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { ASSET_TYPES, ASSET_CATEGORIES } from "../constants";

/*
 * Asset List → Filter — Figma `Drawer - Filter` (`5133:51362`) on page
 * `Asset List | RFS` (`5133:42393`), 384×900.
 *
 * Rebuilt 27 Sep 2026 from the frame. What was different:
 *
 *   · **No Date section at all.** Figma opens the drawer with "Date" and a
 *     From / To pair — this is the developer's note "select date now inside
 *     filter drawer content": the date range belongs in here, not in the
 *     toolbar above the table.
 *   · **Asset Type and Asset Category were chips.** Figma lists them as
 *     checkboxes, one per line.
 *   · Title read "Filters" with a count badge; Figma's is "Filter".
 *   · Footer read "Clear all" / "Apply Filters" as two half-width buttons;
 *     Figma's are "Clear Filter" / "Apply Filter", right-aligned at their
 *     natural widths.
 *   · Width 340; Figma's is 384.
 *
 * Now built on the shared `Drawer`, so the scrim, header, dividers and footer
 * come from the same component as every other drawer in the app.
 */

export interface AssetFilters {
  /** Figma `Date` → From. ISO yyyy-mm-dd, rendered mm/dd/yyyy by the input. */
  from: string;
  /** Figma `Date` → To. */
  to: string;
  types: string[];
  categories: string[];
}

export const EMPTY_ASSET_FILTERS: AssetFilters = {
  from: "",
  to: "",
  types: [],
  categories: [],
};

export function countAssetFilters(f: AssetFilters) {
  return f.types.length + f.categories.length + (f.from ? 1 : 0) + (f.to ? 1 : 0);
}

interface FilterDrawerProps {
  isOpen: boolean;
  filters: AssetFilters;
  onApply: (filters: AssetFilters) => void;
  onClose: () => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-invert-default pb-5 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-default">{title}</span>
      {children}
    </div>
  );
}

export function FilterDrawer({ isOpen, filters, onApply, onClose }: FilterDrawerProps) {
  /*
   * The drawer edits a draft and only commits on Apply — Figma has an explicit
   * Apply Filter button, so changing a checkbox must not already re-filter the
   * table behind the scrim.
   */
  const [draft, setDraft] = useState<AssetFilters>(filters);
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const toggle = (field: "types" | "categories", value: string) =>
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Filter"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_ASSET_FILTERS);
              onApply(EMPTY_ASSET_FILTERS);
            }}
            className="h-10 rounded-lg border border-invert-default bg-surface px-5 text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="h-10 rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Apply Filter
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FilterSection title="Date">
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="from"
              type="date"
              label="From"
              value={draft.from}
              onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
              placeholder="mm/dd/yyyy"
            />
            <Input
              name="to"
              type="date"
              label="To"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
              placeholder="mm/dd/yyyy"
            />
          </div>
        </FilterSection>

        <FilterSection title="Asset Type">
          <div className="flex flex-col">
            {ASSET_TYPES.map((type) => (
              <Checkbox
                key={type}
                id={`asset-filter-type-${type}`}
                name={`asset-filter-type-${type}`}
                size={18}
                label={type}
                checked={draft.types.includes(type)}
                onChange={() => toggle("types", type)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Asset Category">
          <div className="flex flex-col">
            {ASSET_CATEGORIES.map((cat) => (
              <Checkbox
                key={cat}
                id={`asset-filter-category-${cat}`}
                name={`asset-filter-category-${cat}`}
                size={18}
                label={cat}
                checked={draft.categories.includes(cat)}
                onChange={() => toggle("categories", cat)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </Drawer>
  );
}
