import { cn } from "@/lib/utils";
import { aprilBookings, monthIntensity, bookingLabel } from "../constants";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Heat legend rendered in the card header — Figma Low / Medium / High swatches. */
export function MonthLegend() {
  return (
    <div className="flex items-center gap-3">
      {[
        { label: "Low",    swatch: "bg-primary-invert-soft"        },
        { label: "Medium", swatch: "bg-primary-invert-default"        },
        { label: "High",   swatch: "bg-primary-invert-hovered" },
      ].map(({ label, swatch }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn("w-3 h-3 rounded-sm", swatch)} />
          <span className="text-xs text-body">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthView() {
  const totalBookings = Object.values(aprilBookings).reduce((a, b) => a + b, 0);
  const weekendDays = [5, 6, 12, 13, 19, 20, 26]; // Sat/Sun
  const weekendBookings = weekendDays.reduce((sum, d) => sum + (aprilBookings[d] ?? 0), 0);
  const weekdayBookings = totalBookings - weekendBookings;
  const busiest = Object.entries(aprilBookings).reduce((a, b) => (b[1] > a[1] ? b : a), ["0", 0]);
  const avg = (totalBookings / 30).toFixed(1);

  // April 2026 starts on Wednesday (day index 2)
  const startDayOfWeek = 2;
  const daysInMonth = 30;
  const today = 9; // Wed 9 Apr 2026 — matches TODAY_IDX in the week view

  const calendarDays: (number | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

  const stats = [
    { label: "Total Bookings",   value: totalBookings.toString() },
    { label: "Weekday Bookings", value: weekdayBookings.toString() },
    { label: "Weekend Bookings", value: weekendBookings.toString() },
    { label: "Busiest Day",      value: `${busiest[0]} Apr` },
    { label: "Avg/Day",          value: avg },
  ];

  return (
    <>
      {/*
        Overview row — Figma `Row` 1096×96 holding five
        `Data Display - Calendar Month` cells 219×96. TITLE 12 `text/body`,
        value 30 Bold `text/default`.

        **No dividers.** The comment here used to claim "right + bottom border"
        and the cells drew `border-r`/`border-b` plus a `border-t` on the row.
        None of that is in the frame: neither the `Row` nor any of its five
        cells carries a stroke, and the line you see under them belongs to the
        `Calendar` frame below, which is a separate sibling with its own grid.
      */}
      <div className="grid grid-cols-2 md:grid-cols-5">
        {stats.map(({ label, value }) => (
          <div key={label} className="p-5">
            <div className="text-xs text-body">{label}</div>
            <div className="pt-1 text-3xl font-bold leading-10 text-default">{value}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div>
        <div className="grid grid-cols-7 border-b border-invert-default">
          {WEEKDAY_HEADERS.map((d) => (
            <div
              key={d}
              className="text-center text-xs text-body py-2 border-r border-invert-default last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-invert-default last:border-b-0">
            {week.map((day, di) => {
              if (!day) {
                return (
                  <div
                    key={di}
                    className="h-20 bg-default-default border-r border-invert-default last:border-r-0"
                  />
                );
              }
              const count = aprilBookings[day] ?? 0;
              const isToday = day === today;
              return (
                <div
                  key={di}
                  className={cn(
                    "h-20 p-3 border-r border-invert-default last:border-r-0 cursor-pointer transition-colors",
                    monthIntensity(count),
                  )}
                >
                  {isToday ? (
                    <span className="w-6 h-6 rounded-full bg-primary-default text-invert-default text-xs font-semibold flex items-center justify-center">
                      {day}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-default">{day}</span>
                  )}
                  <div className="text-sm text-body mt-1">
                    {count} {bookingLabel(count)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </>
  );
}
