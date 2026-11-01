// Issue Asset Step 1 — "Select Courseware" list shared by every entry point that reaches Create
// Assignment (Assignment List, Today's Booking, Booking Details). Figma
// `Table - Issue Asset - Select Booking` inside `Issue Asset Step 1 - Config 4 Booking`
// (page "↪ Action - Issue Asset (Booking)", 5869:43219 — frames 6966:232953, 5869:43237,
// 6966:240039, 6966:238435), re-read 20 Oct 2026 (F-010).
//
// One white card per booking (radius 8, 1px `border/default`):
//   header  `background/default/soft`, 12/20 padding — booking name (14 Semi Bold) over the
//           booking id (12 `text/body`); for a booking with time slots today a "N of M selected"
//           pill and a blue info alert "N time slot(s) today — select …".
//   row     checkbox + courseware (14) over its schedule (12 `text/body`), the base station(s)
//           as grey chips on the right. A courseware scheduled for another day shows
//           "Will run in today’s slot instead." once ticked; when the slots are full the
//           remaining rows go grey and cannot be ticked.
//
// Two shapes, chosen by the caller, not this component:
//   `locked` — the anchoring booking has exactly 1 courseware: one ticked, un-toggleable row.
//   open     — every row individually checkable.
import { Checkbox } from "@/components/checkbox";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export interface CoursewareRow {
  /** Composite, stable across renders: `${bookingId}::${coursewareIndex}`. */
  key: string;
  bookingId: string;
  name: string;
  /** One chip per station. */
  baseStations: string[];
  schedule: string;
  /** False when the courseware is dated after the booking's own (today's) date. */
  isToday: boolean;
}

export interface CoursewareGroup {
  bookingId: string;
  bookingLabel: string;
  program: string;
  /** Number of time slots today the booking may fill, or null when the booking has no such limit. */
  slotsToday: number | null;
  rows: CoursewareRow[];
}

interface CoursewareTableProps {
  groups: CoursewareGroup[];
  checked: Set<string>;
  onToggle: (key: string) => void;
  locked?: boolean;
  /** Red caption under the list (Figma "Select at least 1 courseware to continue"). */
  error?: string;
}

export function CoursewareTable({ groups, checked, onToggle, locked, error }: CoursewareTableProps) {
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => {
        const selected = g.rows.filter((r) => checked.has(r.key)).length;
        const limit = g.slotsToday;
        const full = limit !== null && selected >= limit;
        return (
          <div key={g.bookingId} className="overflow-hidden rounded-lg border border-default bg-surface">
            <div className="flex flex-col gap-2 bg-default-soft px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-default">{g.program}</span>
                  <span className="text-xs text-body">{g.bookingLabel}</span>
                </div>
                {limit !== null && (
                  <span
                    className={cn(
                      "inline-flex flex-shrink-0 items-center rounded-full border px-3 py-0.5 text-sm font-medium",
                      full ? "border-invert-success bg-success-invert-default text-success" : "border-default bg-default-default text-default",
                    )}
                  >
                    {selected} of {limit} selected
                  </span>
                )}
              </div>
              {limit !== null && (
                <div className="flex items-center gap-2.5 rounded-lg border border-info bg-info-invert-default p-3 text-xs font-medium text-info">
                  <Icon name="info" size={16} />
                  <span>
                    {limit === 1
                      ? "1 time slot today — select 1 courseware."
                      : `${limit} time slots today — select up to ${limit} courseware.`}
                  </span>
                </div>
              )}
            </div>
            {g.rows.map((row) => {
              const isChecked = checked.has(row.key);
              const blocked = !isChecked && full;
              return (
                <div key={row.key} className="flex items-start border-t border-default">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-5 py-3">
                    <Checkbox
                      checked={isChecked}
                      disabled={locked || blocked}
                      onChange={() => onToggle(row.key)}
                      size={18}
                      label={
                        <div className="min-w-0">
                          <div className={cn("text-sm", blocked ? "text-placeholder" : "text-default")}>{row.name}</div>
                          <div className="text-xs text-body">{row.schedule}</div>
                        </div>
                      }
                      wrapperClassName="h-auto items-start gap-2"
                    />
                    {isChecked && !row.isToday && (
                      <p className="pl-[26px] text-xs text-info">Will run in today’s slot instead.</p>
                    )}
                  </div>
                  <div className="flex w-[200px] flex-shrink-0 flex-wrap gap-2 px-5 py-3">
                    {row.baseStations.map((s) => (
                      <span key={s} className="inline-flex h-5 items-center rounded-[4px] bg-default-default px-1.5 text-xs text-default">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {groups.length === 0 && (
        <div className="rounded-lg border border-default px-4 py-8 text-center text-sm text-body">No courseware available.</div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

type BookingLike = {
  id: string;
  bookingId: string;
  program: string;
  courseware: string;
  bookingDate: string;
  trainingMode?: string;
  assignedStations?: string[];
  coursewareDetails?: { baseStation: string; schedule: string }[];
  bookingTime: string;
};

/** Builds the booking-grouped list from `bookings` — shared by both create-assignment entry points
 *  so the grouping/fallback logic (no per-courseware station data yet on most bookings) lives in
 *  exactly one place.
 *
 *  Time slots today (Figma "2 time slots today — select up to 2 courseware."): there is no field
 *  for it yet, so it is derived — a Judgemental / Collective booking with 2+ courseware may fill as
 *  many slots as it has courseware dated on the booking's own date. Marksmanship bookings (Figma's
 *  "Marksmanship Training…", no pill and no alert) have no limit. */
export function buildCoursewareGroups(bookings: BookingLike[]): CoursewareGroup[] {
  const groups: CoursewareGroup[] = [];
  for (const b of bookings) {
    const names = b.courseware.split(",").map((c) => c.trim()).filter(Boolean);
    if (names.length === 0) continue;
    const rows: CoursewareRow[] = names.map((name, i) => {
      const detail = b.coursewareDetails?.[i];
      const station =
        detail?.baseStation ??
        (names.length === b.assignedStations?.length ? b.assignedStations?.[i] : b.assignedStations?.join(", ")) ??
        "—";
      const schedule = detail?.schedule ?? `${b.bookingDate} · ${b.bookingTime.split("\n")[1] ?? b.bookingTime}`;
      return {
        key: `${b.id}::${i}`,
        bookingId: b.id,
        name,
        baseStations: station.split(",").map((s) => s.trim()).filter(Boolean),
        schedule,
        isToday: schedule.startsWith(b.bookingDate),
      };
    });
    const limited = names.length >= 2 && !!b.trainingMode && b.trainingMode !== "Marksmanship";
    groups.push({
      bookingId: b.id,
      bookingLabel: b.bookingId,
      program: b.program,
      slotsToday: limited ? Math.max(1, rows.filter((r) => r.isToday).length) : null,
      rows,
    });
  }
  return groups;
}
