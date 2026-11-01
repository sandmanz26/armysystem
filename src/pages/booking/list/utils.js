export function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function bookingDateKeys(dateStr) {
    const MONTH_MAP = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
    };
    const ymMatch = dateStr.match(/([A-Za-z]{3})\s+(\d{4})/);
    if (!ymMatch)
        return [];
    const month = MONTH_MAP[ymMatch[1]];
    const year = parseInt(ymMatch[2]);
    const days = [...dateStr.matchAll(/\b(\d{1,2})\b/g)]
        .map((m) => parseInt(m[1]))
        .filter((d) => d >= 1 && d <= 31);
    return days.map((d) => `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}
export function parseBookingTime(raw) {
    const lines = raw.split("\n");
    const dateLine = lines[0]?.trim() ?? "";
    const rest = lines[1]?.trim() ?? lines[0]?.trim() ?? "";
    const timeMatch = rest.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    const timeRange = timeMatch ? `${timeMatch[1]} – ${timeMatch[2]}` : "";
    const labelMatch = rest.match(/\(([^)]+Schedule|[^)]+Session)\)/);
    const label = labelMatch ? labelMatch[1] : "";
    return { date: dateLine, timeRange, label };
}
export function extractTime(bookingTime) {
    const m = bookingTime.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    return m ? `${m[1]} - ${m[2]}` : "";
}
export function getCalendarWeeks(year, month) {
    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = new Date(year, month, daysInMonth);
    const endDow = lastDay.getDay();
    const totalCells = startDow + daysInMonth + (6 - endDow);
    const numWeeks = Math.ceil(totalCells / 7);
    const weeks = [];
    const cur = new Date(year, month, 1 - startDow);
    for (let w = 0; w < numWeeks; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}
