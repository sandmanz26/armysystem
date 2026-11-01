// Booking time line in Figma's order: session name first, clock range in brackets.
// Figma (5511:16209, 6761:61157): "AM Session (08:00 AM - 12:00 PM)", "Full Day (08:00 AM - 05:00 PM)".
// Mock data stores "08:00 AM - 12:00 PM (AM Session)" and Ad-hoc as
// "(22 Apr) 8:00 AM - (22 Apr) 9:00 AM (Ad-Hoc Schedule)"; both are rewritten here.
// A few records use 24-hour clocks with a day prefix — "(28 Apr) 13:00 - 17:00 (PM Session)" —
// which became "PM Session ((28 Apr) 13:00 - 17:00)"; the prefix is dropped (the date is already
// on the line above) and the clock converted, giving "PM Session (01:00 PM - 05:00 PM)".

const pad = (t: string) => t.replace(/^(\d):/, "0$1:");

/** "13:00" → "01:00 PM"; "8:00 AM" → "08:00 AM"; leaves anything else as is. */
const to12h = (t: string) => {
  const clock = t.replace(/^\(\d{1,2} \w{3}\)\s*/, "").trim();
  if (/[AP]M$/i.test(clock)) return pad(clock);
  const m = clock.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return clock;
  const h = Number(m[1]);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
};

export function formatBookingTime(line?: string): string {
  if (!line) return "";
  const adhoc = line.match(/^\((.+?)\)\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*\((.+?)\)\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\(Ad-Hoc Schedule\)$/i);
  if (adhoc) {
    const [, d1, t1, d2, t2] = adhoc;
    return d1 === d2 ? `Ad-hoc (${pad(t1)} - ${pad(t2)})` : `Ad-hoc (${d1} ${pad(t1)} - ${d2} ${pad(t2)})`;
  }
  const session = line.match(/^(.+?)\s*\((AM Session|PM Session|Full Day|Hourly)\)$/);
  if (session) return `${session[2]} (${session[1].split(" - ").map(to12h).join(" - ")})`;
  return line;
}
