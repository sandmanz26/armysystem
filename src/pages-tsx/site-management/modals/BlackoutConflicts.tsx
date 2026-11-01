import { useState } from "react";
import { Alert } from "@/components/alert";
import { Link } from "@/components/link";
import type { ConflictRow } from "../blackoutRules";

/*
 * Add Blackout Date → the overlapping-bookings alert (Figma
 * `Alert - Booking Conflict with Blackout`; variants "N more" / "N less", frames
 * `Add - Filled` 5116:216639 and `Add - Filled - Expand` 7973:31583).
 *
 *   header   warning Alert: "4 existing bookings overlap this blackout"
 *   rows     3 show: the booking id in bold + its name over a 12px date/session line, and a
 *            "View" link with an external-link icon (opens the booking in a new tab)
 *   more     beyond 3, a "View N more ⌄" row; open it reads "View less ⌃" and every row shows
 *
 * It only warns. Figma draws "Add Blackout Date" as available while the alert is up.
 */

const VISIBLE = 3;

export function BlackoutConflicts({ rows }: { rows: ConflictRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const n = rows.length;
  if (n === 0) return null;
  const shown = expanded ? rows : rows.slice(0, VISIBLE);

  return (
    <Alert message={`${n} existing booking${n === 1 ? "" : "s"} overlap${n === 1 ? "s" : ""} this blackout`}>
      <ul className="divide-y divide-divider">
        {shown.map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm text-default">
                <span className="font-semibold">{r.bookingId}</span> {r.name}
              </p>
              <p className="truncate text-xs text-body">{r.when}</p>
            </div>
            <Link
              suffixIcon="external-link"
              onClick={() => window.open(`/bookings/detail?id=${r.id}`, "_blank", "noopener")}
            >
              View
            </Link>
          </li>
        ))}
        {n > VISIBLE && (
          <li className="px-3 py-2">
            <Link
              suffixIcon={expanded ? "chevron-up" : "chevron-down"}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "View less" : `View ${n - VISIBLE} more`}
            </Link>
          </li>
        )}
      </ul>
    </Alert>
  );
}
