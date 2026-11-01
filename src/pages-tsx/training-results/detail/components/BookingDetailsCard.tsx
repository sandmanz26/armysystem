import type { Courseware } from "../types";

/**
 * Figma `Training Details - Booking Details` on the Multiple-CW detail
 * (5839:44906): a `Section Layout` card — `color/background/surface lv1`,
 * `color/border/invert/default`, radius 12, 64-high header — holding four
 * `Key Value` pairs. Labels are `color/text/body` Regular 12, values
 * `color/text/default` Semi Bold 14.
 *
 * Every value here belongs to the ACTIVE courseware, not the booking: switching
 * the selector above changes all four.
 */
export function BookingDetailsCard({ courseware }: { courseware: Courseware }) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Courseware", value: courseware.name },
    {
      label: "Booking Time",
      value: (
        <>
          <span className="block">{courseware.bookingDate}</span>
          <span className="block font-normal text-body">{courseware.bookingSession}</span>
        </>
      ),
    },
    { label: "Session Time", value: courseware.sessionTime },
    { label: "Total Duration", value: courseware.totalDuration },
  ];

  return (
    <section className="rounded-xl bg-surface-lv1 border border-invert-default">
      <header className="px-5 h-16 flex items-center">
        <h2 className="text-base font-semibold text-default">Booking Details</h2>
      </header>
      <div className="px-5 pb-5 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-normal leading-4 text-body">{f.label}</span>
            <div className="text-sm font-semibold leading-5 text-default">{f.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
