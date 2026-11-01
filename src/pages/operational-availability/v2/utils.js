import { MONTH_ABBR } from "./constants";
export function parseMonthLabel(label) {
    const [monthName, yearStr] = label.split(" ");
    const month = new Date(`${monthName} 1, 2000`).getMonth();
    return { year: parseInt(yearStr), month };
}
export function monthToKey(year, month) {
    return year * 12 + month;
}
export function formatRange(r) {
    return `${MONTH_ABBR[r.fromMonth]} ${r.fromYear} — ${MONTH_ABBR[r.toMonth]} ${r.toYear}`;
}
