import { useState } from "react";
import { SummaryCard } from "@/components/summary-card";
import { Chip } from "@/components/chip";
import { Link } from "@/components/link";
import { formatDayWithWeekday, type BlackoutSummaryData } from "../blackoutRules";

/*
 * Add Blackout Date → "Summary" (Figma `Input-Summary (Read Only)`, e.g. `Custom - Year`
 * 7974:36949 collapsed / 7974:37454 expanded).
 *
 *   sentence   14 Regular `text/default`
 *   divider    1px `background/divider`
 *   group      "<N blackouts> in total. Dates:" (the count part bold), then one outlined Chip per
 *              date — "Mon, 3 Nov 2025" — 8px apart
 *
 * More than 5 dates: the first 5 show, followed by a "View N more" link; open, every date
 * shows and the link reads "View less".
 */

const VISIBLE = 5;

export function BlackoutSummary({ summary }: { summary: BlackoutSummaryData }) {
  const [expanded, setExpanded] = useState(false);
  const total = summary.dates.length;
  const shown = expanded || total <= VISIBLE ? summary.dates : summary.dates.slice(0, VISIBLE);

  return (
    <SummaryCard label="Summary">
      <p className="text-sm text-default">{summary.sentence}</p>
      <div className="h-px bg-divider" />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-default">
          <span className="font-semibold">
            {total} blackout{total === 1 ? "" : "s"}
          </span>{" "}
          in total. {total === 1 ? "Date" : "Dates"}:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {shown.map((d) => (
            <Chip key={d.getTime()}>{formatDayWithWeekday(d)}</Chip>
          ))}
          {total > VISIBLE && (
            <Link onClick={() => setExpanded((e) => !e)}>
              {expanded ? "View less" : `View ${total - VISIBLE} more`}
            </Link>
          )}
        </div>
      </div>
    </SummaryCard>
  );
}
