// Booking 2.0 — "Booking Details" / "Courseware Details" cards.
//
// Figma draws these cards twice with DIFFERENT field order and contents:
//   variant="drawer" — Today's Booking `Drawer - Booking Details` (6761:61157):
//     Booking Details: Created on (date only) · Training Type / FTMS File ID ·
//     Unit Name / Training Mode · Dry Run / Instructor · Assignment ID;
//     Courseware Details: Courseware · Booking Time / Weapon Type (n) · Role (n)
//     as small pill chips inside the card.
//   variant="page" — Booking Details page, tab Booking Details (5511:16209):
//     Booking Details: Training Type · Training Mode / Unit Name · Dry Run /
//     FTMS File ID · Instructor / Created on (date, time);
//     Courseware Details: Courseware · Assignment ID / Booking Time ·
//     Session Start Time / Session End Time. Weapon Type and Role are their
//     own cards (`WeaponRoleCards`), chips 14 Regular radius 4.
// Section Layout: `background/surface lv1`, `border/invert/default`, radius 12,
// header 16 Semi Bold, Key Value = label 12 `text/body` over value 14 Semi Bold.
import { formatBookingTime } from "./formatBookingTime";
import type { ReactNode } from "react";
import type { Booking } from "@/data/mock";
import { cn } from "@/lib/utils";

interface BookingSummaryCardsProps {
  booking: Booking;
  variant: "drawer" | "page";
  /** Page variant only, optional: the Courseware Details card after the session (F-006,
   *  Booking Details `Completed` 5029:55565 etc.) — a different Assignment ID cell (ID + status
   *  badge) and recorded Session Start / End / Total Duration. Omitted = the Upcoming card. */
  session?: {
    assignment?: ReactNode;
    start: { primary: string; secondary?: string };
    end: { primary: string; secondary?: string };
    /** Shown as a "Total Duration" field when present. */
    duration?: string;
  };
}

const splitCreated = (s?: string) => {
  const m = (s ?? "").match(/^(.*?)[,\s]+(\d{1,2}:\d{2}.*)$/);
  return m ? { date: m[1], time: m[2] } : { date: s || "-", time: "" };
};

export function BookingSummaryCards({ booking, variant, session }: BookingSummaryCardsProps) {
  const [bookingDateLine, rawTimeLine] = (booking.bookingTime ?? "").split("\n");
  const bookingTimeLine = formatBookingTime(rawTimeLine);
  const created = splitCreated(booking.createdOn);
  const assignment = session?.assignment ?? <AssignmentValue booking={booking} />;
  const instructor = <Value primary={booking.instructorName ?? "-"} secondary={booking.instructorPhone} />;
  const weapons = booking.weaponTypes ?? [];
  const roles = booking.roles ?? [];

  if (variant === "drawer") {
    return (
      <div className="flex flex-col gap-8">
        <Section title="Booking Details">
          <Grid>
            <Field label="Created on"><Value primary={created.date} /></Field>
            <Field label="Training Type"><Value primary={booking.trainingType} /></Field>
            <Field label="FTMS File ID"><Value primary={booking.ftmsFileId != null ? String(booking.ftmsFileId) : "-"} /></Field>
            <Field label="Unit Name"><Value primary={booking.unitName} /></Field>
            <Field label="Training Mode"><Value primary={booking.trainingMode} /></Field>
            <Field label="Dry Run Training"><Value primary={booking.dryRunTraining ? "Yes" : "No"} /></Field>
            <Field label="Instructor">{instructor}</Field>
            <Field label="Assignment ID">{assignment}</Field>
          </Grid>
        </Section>
        <Section title="Courseware Details">
          <Grid>
            <Field label="Courseware"><Value primary={booking.courseware} /></Field>
            <Field label="Booking Time"><Value primary={bookingDateLine || "-"} secondary={bookingTimeLine} /></Field>
            <Field label={`Weapon Type (${weapons.length})`}><Chips items={weapons} small /></Field>
            {roles.length > 0 && <Field label={`Role (${roles.length})`}><Chips items={roles} small /></Field>}
          </Grid>
        </Section>
      </div>
    );
  }

  return (
    <>
      <Section title="Booking Details">
        <Grid>
          <Field label="Training Type"><Value primary={booking.trainingType} /></Field>
          <Field label="Training Mode"><Value primary={booking.trainingMode} /></Field>
          <Field label="Unit Name"><Value primary={booking.unitName} /></Field>
          <Field label="Dry Run Training"><Value primary={booking.dryRunTraining ? "Yes" : "No"} /></Field>
          <Field label="FTMS File ID"><Value primary={booking.ftmsFileId != null ? String(booking.ftmsFileId) : "-"} /></Field>
          <Field label="Instructor">{instructor}</Field>
          <Field label="Created on">
            <Value primary={created.time ? `${created.date}, ${created.time}` : created.date} />
          </Field>
        </Grid>
      </Section>
      <Section title="Courseware Details">
        <Grid>
          <Field label="Courseware"><Value primary={booking.courseware} /></Field>
          <Field label="Assignment ID">{assignment}</Field>
          <Field label="Booking Time"><Value primary={bookingDateLine || "-"} secondary={bookingTimeLine} /></Field>
          <Field label="Session Start Time"><Value primary={session?.start.primary ?? "Not started"} secondary={session?.start.secondary} /></Field>
          <Field label="Session End Time"><Value primary={session?.end.primary ?? "Not started"} secondary={session?.end.secondary} /></Field>
          {session?.duration != null && <Field label="Total Duration"><Value primary={session.duration} /></Field>}
        </Grid>
      </Section>
    </>
  );
}

/** Booking Details page only — Weapon Type and Role as their own cards (5511:16209). */
export function WeaponRoleCards({ booking }: { booking: Booking }) {
  const weapons = booking.weaponTypes ?? [];
  const roles = booking.roles ?? [];
  return (
    <>
      <Section title="Weapon Type" count={weapons.length}>
        {weapons.length > 0 ? <Chips items={weapons} /> : <p className="text-sm text-default">-</p>}
      </Section>
      {/* Figma 5511:16209 always draws the Role card beside Weapon Type. */}
      <Section title="Role" count={roles.length}>
        {roles.length > 0 ? <Chips items={roles} /> : <p className="text-sm text-default">-</p>}
      </Section>
    </>
  );
}

export function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <div className="bg-surface-lv1 rounded-xl border border-invert-default">
      <div className="p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold leading-6 text-default">
          {title}
          {count != null && <span className="text-body">{count}</span>}
        </h2>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-5">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-xs leading-4 text-body">{label}</p>
      {children}
    </div>
  );
}

function Value({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-semibold leading-5 text-default">{primary}</p>
      {secondary && <p className="text-sm leading-5 text-default">{secondary}</p>}
    </div>
  );
}

function AssignmentValue({ booking }: { booking: Booking }) {
  if (!booking.assetIssued) {
    return (
      <span className="self-start px-2 py-0.5 rounded-full border border-invert-warning bg-warning-invert-default text-warning text-xs font-medium leading-4">
        Not Issued
      </span>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm font-semibold leading-5 text-default">{booking.assignmentId}</p>
      <span className="px-2 py-0.5 rounded-full bg-purple-invert-default text-purple text-xs font-medium leading-4">Issued</span>
    </div>
  );
}

function Chips({ items, small }: { items: string[]; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((w) => (
        <span
          key={w}
          className={cn(
            "bg-default-default text-default",
            small ? "px-1.5 py-0.5 rounded-full text-xs leading-4" : "px-2 py-1 rounded text-sm leading-5",
          )}
        >
          {w}
        </span>
      ))}
    </div>
  );
}
