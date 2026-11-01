import type { User } from "@/data/userManagement";
import type { ActivityRow } from "./types";

export const PER_PAGE = 10;

/**
 * "Created on" value. The user mock has no creation date; this is the value the
 * page already showed before F-007, written in Figma's format
 * ("31 Jul 2026 12:11:24 PM", 5014:9360) — no brackets around the time.
 */
export const CREATED_ON = "21 Apr 2026 01:17:42 PM";

/** Opened without `?id=` (old bookmarks / direct URL) → the first mock user, as before. */
export const FALLBACK_USER_ID = "1";

/**
 * Activities — the 12 rows Figma draws in `Activities Filled` (5014:9392):
 * Action · Module · Date (date + time) · Description. Figma's descriptions are
 * templates ("{Admin Name}", "{booking_id}" …); the placeholders are filled with
 * values that already exist in the app's mock data (the user's own name/role/unit,
 * "Admin" from the User Role mock, booking ids BK-250101-00x, assignment
 * #ASG-2026-0549, "Pulau Thornton Camp"). Wording around them is Figma's verbatim.
 */
export function activitiesFor(user: User): ActivityRow[] {
  const other = user.userRole === "Instructor" ? "Operator" : "Instructor";
  const unit = user.unitName || "SAR1";
  const rows: Omit<ActivityRow, "no">[] = [
    { action: "User Created", module: "User", date: "6 Jun 2026", time: "11:09 PM", ts: Date.parse("2026-06-06T23:09:00"), desc: "Account created by Admin." },
    { action: "User Archived", module: "User", date: "25 May 2026", time: "03:45 PM", ts: Date.parse("2026-05-25T15:45:00"), desc: "Account archived by Admin." },
    { action: "User Restored", module: "User", date: "20 May 2026", time: "11:30 AM", ts: Date.parse("2026-05-20T11:30:00"), desc: "Account restored by Admin." },
    { action: "User Updated", module: "User", date: "15 May 2026", time: "07:15 PM", ts: Date.parse("2026-05-15T19:15:00"), desc: `Updated Rank for ${user.name}.` },
    { action: "Role Changed", module: "User", date: "1 May 2026", time: "09:00 AM", ts: Date.parse("2026-05-01T09:00:00"), desc: `Role changed from ${other} to ${user.userRole}.` },
    { action: "Password Reset", module: "User", date: "29 Apr 2026", time: "01:20 PM", ts: Date.parse("2026-04-29T13:20:00"), desc: `Password reset for ${user.name}.` },
    { action: "Booking Created", module: "Booking", date: "28 Apr 2026", time: "05:55 AM", ts: Date.parse("2026-04-28T05:55:00"), desc: `Created booking #BK-250101-002 for ${unit}.` },
    { action: "Booking Cancelled", module: "Booking", date: "21 Apr 2026", time: "10:10 PM", ts: Date.parse("2026-04-21T22:10:00"), desc: "Cancelled booking #BK-250101-003." },
    { action: "Booking Cancelled", module: "Booking", date: "15 Apr 2026", time: "02:45 AM", ts: Date.parse("2026-04-15T02:45:00"), desc: "1 of 2 courseware were cancelled for booking #BK-250101-004." },
    { action: "User Login", module: "System", date: "13 Apr 2026", time: "08:30 PM", ts: Date.parse("2026-04-13T20:30:00"), desc: "Logged into TOMS from Pulau Thornton Camp terminal." },
    { action: "Assignment Created", module: "SHM", date: "13 Apr 2026", time: "08:30 PM", ts: Date.parse("2026-04-13T20:30:00"), desc: "Created assignment #ASG-2026-0549." },
    { action: "Asset Issued", module: "SHM", date: "13 Apr 2026", time: "08:30 PM", ts: Date.parse("2026-04-13T20:30:00"), desc: "15 assets issued to assignment #ASG-2026-0549." },
  ];
  return rows.map((r, i) => ({ ...r, no: i + 1 }));
}
