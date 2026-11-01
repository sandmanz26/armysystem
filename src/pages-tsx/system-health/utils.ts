import type { CheckItem, Status } from "./types";

export function isGood(s: Status): boolean {
  return s === "Passed" || s === "Running" || s === "Ok" || s === "Connected";
}

export function isWarn(s: Status): boolean {
  return !isGood(s) && s !== "Failed";
}

export function statusColor(s: Status): string {
  if (isGood(s)) return "text-green-600";
  if (s === "Failed") return "text-red-500";
  return "text-amber-500";
}

export function statusBg(s: Status): string {
  if (isGood(s)) return "bg-green-50 text-green-700 border-green-200";
  if (s === "Failed") return "bg-red-50 text-red-600 border-red-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
}

export function statusDot(s: Status): string {
  if (isGood(s)) return "bg-green-500";
  if (s === "Failed") return "bg-red-500";
  return "bg-amber-400";
}

export function overallOf(items: CheckItem[]): Status {
  if (items.some((i) => i.status === "Failed")) return "Failed";
  const warn: Status[] = ["Unknown", "Battery Low", "Not Found", "Not Running", "Jammed", "Shutting Down", "Low"];
  if (items.some((i) => warn.includes(i.status))) return "Unknown";
  return "Passed";
}
