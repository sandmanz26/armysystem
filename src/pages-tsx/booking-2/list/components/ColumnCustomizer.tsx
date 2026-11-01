import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/checkbox";

/**
 * Column customizer — Figma `Dropdown - Column Customizer` (5331:427577) on the
 * `Action - Column Customizer` section (5331:411422).
 *
 * It is a dropdown anchored to the `columns-3-cog` button in the section
 * header, not a modal or a drawer: `Listbox New`, 224 wide, radius 8, 4px
 * vertical padding, `color/background/surface` fill and Tailwind's `shadow-lg`
 * (which is byte-for-byte the two drop-shadows Figma uses here). Each row is
 * 36 high with 8/12 padding, a 10px gap, an 18px square checkbox and a title in
 * `color/text/default` at Medium 14/20.
 *
 * Seven columns are `Checked + Disabled` in Figma — they are structural, so
 * they are always on and cannot be switched off.
 */
export interface ColumnOption {
  /** Matches the column `id` in BookingTable. */
  id: string;
  label: string;
  /** Figma renders these `Checked` and `Disabled`. */
  locked?: boolean;
}

/**
 * Order is Figma's, which is NOT the table's order: the six always-on data
 * columns come first, then the optional ones (Figma's `More Options` slot),
 * with Actions pinned last.
 */
/*
 * Order matches Figma's `Dropdown - Column` (`5331:411423`) exactly.
 *
 * `Created at` / `Created by` are NOT in the frame — they were asked for on top
 * of it, so they sit at the end of the optional group rather than being slotted
 * into Figma's order.
 */
export const COLUMN_OPTIONS: ColumnOption[] = [
  { id: "rowNum", label: "No", locked: true },
  { id: "booking", label: "Booking ID", locked: true },
  { id: "trainingType", label: "Training Type", locked: true },
  { id: "courseware", label: "Courseware", locked: true },
  { id: "bookingTime", label: "Booking Time", locked: true },
  { id: "status", label: "Status", locked: true },
  { id: "trainingMode", label: "Training Mode" },
  { id: "assignmentId", label: "Assignment ID" },
  { id: "unitName", label: "Unit Name" },
  { id: "weaponTypes", label: "Weapon Type(s)" },
  { id: "briefingRoom", label: "Briefing Room" },
  { id: "baseStationQty", label: "Base Station Quantity" },
  { id: "traineesCount", label: "Trainee(s)" },
  { id: "instructorName", label: "Instructor Name" },
  { id: "ftmsFileId", label: "FTMS File ID" },
  { id: "createdAt", label: "Created at" },
  { id: "createdBy", label: "Created by" },
  { id: "action", label: "Actions", locked: true },
];

/*
 * Figma's default is NOT "only the locked columns" — that was the earlier
 * reading and it left the table two columns short. The
 * `Booking List - Default Column` section (`5331:393176`) shows nine:
 *
 *   No. · Booking ID · Training Type · Training Mode · Courseware ·
 *   Booking Time · Status · Briefing Room · Actions
 *
 * so Training Mode and Briefing Room are on by default even though they can be
 * switched off.
 */
const DEFAULT_ON = new Set([
  "rowNum", "booking", "trainingType", "trainingMode", "courseware",
  "bookingTime", "status", "briefingRoom", "action",
]);

export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = Object.fromEntries(
  COLUMN_OPTIONS.map((c) => [c.id, DEFAULT_ON.has(c.id)]),
);

interface ColumnCustomizerProps {
  open: boolean;
  visible: Record<string, boolean>;
  onToggle: (id: string) => void;
  onClose: () => void;
}

export function ColumnCustomizer({ open, visible, onToggle, onClose }: ColumnCustomizerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Manage columns"
      // z-[1100]: TableCustom's sticky header and frozen columns sit at
      // z-[1001], so anything lower is painted over by the table below.
      // Figma shows 7 rows before the list scrolls — 7 × 36 + 8 padding.
      className="absolute right-0 top-[calc(100%+4px)] z-[1100] w-56 max-h-[260px] overflow-y-auto rounded-lg py-1 bg-surface shadow-lg"
    >
      {COLUMN_OPTIONS.map((col) => (
        <div key={col.id} className="px-3">
          <Checkbox
            id={`col-${col.id}`}
            name={`col-${col.id}`}
            size={18}
            checked={Boolean(visible[col.id])}
            disabled={col.locked}
            onChange={() => onToggle(col.id)}
            label={col.label}
            wrapperClassName="gap-2.5"
          />
        </div>
      ))}
    </div>
  );
}
