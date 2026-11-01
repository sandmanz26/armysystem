import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./types";
import { TopCards } from "./components/TopCards";
import { TeamBar } from "./components/TeamBar";
import { OverviewCard } from "./components/OverviewCard";
import { WeekView } from "./components/WeekView";
import { DayView } from "./components/DayView";
import { MonthView, MonthLegend } from "./components/MonthView";
import { RangeView } from "./components/RangeView";
import { DateRangePicker, formatRange } from "@/components/date-range-picker";
import { DAY_LABEL, WEEK_LABEL, MONTH_LABEL, LOGIN_TOAST_KEY } from "./constants";
import { Toast } from "@/components/toast";

const TITLES: Record<ViewMode, string> = {
  Day: "Day Overview",
  Week: "Week Overview",
  Month: "Month Overview",
  Range: "Range Overview",
};

export function Dashboard() {
  const [view, setView] = useState<ViewMode>("Day");

  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const hasRange = !!rangeStart && !!rangeEnd;

  // Login Successful toast (Figma 5029:123620) — Login.tsx leaves the message in sessionStorage
  // just before landing here. Read non-destructively (StrictMode runs initialisers twice) and
  // clear it in an effect so a refresh does not show it again.
  const [loginToast, setLoginToast] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(LOGIN_TOAST_KEY);
    } catch {
      return null;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.removeItem(LOGIN_TOAST_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Range has no ‹ period › navigation in Figma (6692:22854 / 6692:22856).
  const PERIODS: Record<ViewMode, string | undefined> = {
    Day: DAY_LABEL,
    Week: WEEK_LABEL,
    Month: MONTH_LABEL,
    Range: undefined,
  };

  // Notes 7194:250336: selectable window is 24 months back to 12 months ahead,
  // rolling daily; days outside stay visible but disabled with a tooltip.
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth() - 24, today.getDate());
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());

  /*
   * Figma `Date Picker Range` (Dashboard page `5004:113424`, section
   * "Dashboard - Range", frame `Dropdown - Date Picker Filled`) — a 512px
   * two-month calendar. What stood here was a pair of native `<input
   * type="date">` boxes, which is why the field read "mm/dd/yyyy" instead of
   * showing a calendar at all.
   */
  const rangePicker = (
    <div className="relative">
      {/* Figma: 36px, radius 8, Semi Bold 14. Empty → surface + border/invert/default
          + text/default; with a range → border/primary + text/primary. */}
      <button
        type="button"
        onClick={() => setShowRangePicker((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 h-9 px-3 text-sm font-semibold bg-surface border rounded-lg transition-colors",
          showRangePicker && !hasRange && "bg-default-default",
          hasRange ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
        )}
      >
        <Icon name="calendar" size={16} />
        {hasRange ? formatRange(rangeStart, rangeEnd) : "Select Date Range"}
      </button>

      {/*
        Figma 6702:37916: the 512px popover's right edge lines up with the right edge of
        the Select Date Range button, 4px below it (right-0 + mt-1) — it used to hang
        from the button's left edge and ran off the right of the screen.
        z-[1200]: TableCustom pins its thead at z-[1001] and its expanded-row
        layer at z-[1112], so a z-50 popover is painted over by the calendar
        header behind it. Still well under `modal-1` (z-[99999]).
      */}
      {showRangePicker && (
        <div className="absolute right-0 top-full mt-1 z-[1200]">
          <DateRangePicker
            start={rangeStart}
            end={rangeEnd}
            minDate={minDate}
            maxDate={maxDate}
            disabledHint={(side) =>
              side === "before"
                ? "Data is only kept for 2 years."
                : "Bookings can only be made up to 1 year in advance."
            }
            onCancel={() => setShowRangePicker(false)}
            onConfirm={(s, e) => {
              setRangeStart(s);
              setRangeEnd(e);
              setShowRangePicker(false);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      {/* Figma 5029:124182: top-right, 24px from the right edge, 12px under the 60px header. */}
      <Toast
        open={!!loginToast}
        message={loginToast ?? ""}
        onDismiss={() => setLoginToast(null)}
        placement="top-right"
        offsetTop={72}
        duration={5000}
      />
      <div className="p-4 md:p-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-default">Dashboard</h1>
          <p className="text-xs text-body mt-1">Booking &amp; Asset Overview</p>
        </div>

        <TopCards view={view} />
        <TeamBar />

        <OverviewCard
          title={TITLES[view]}
          dateLabel={PERIODS[view]}
          view={view}
          onViewChange={(v) => {
            setView(v);
            if (v !== "Range") setShowRangePicker(false);
          }}
          leading={view === "Month" ? <MonthLegend /> : view === "Range" ? rangePicker : undefined}
        >
          {view === "Day" && <DayView />}
          {view === "Week" && <WeekView />}
          {view === "Month" && <MonthView />}
          {view === "Range" &&
            (hasRange ? (
              <RangeView start={rangeStart!} end={rangeEnd!} />
            ) : (
              // Figma `Dashboard - Range` ▸ Empty (6692:22854) — copy verbatim.
              <div className="flex flex-col items-center gap-1 px-5 pt-2 pb-8 text-center">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-default-default text-body">
                  <Icon name="calendar-days" size={24} />
                </span>
                <p className="text-sm font-semibold text-default">No date range selected</p>
                <p className="text-sm text-body">Select a date range above to see bookings.</p>
              </div>
            ))}
        </OverviewCard>
      </div>
    </div>
  );
}
