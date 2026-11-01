import { Boxes, CircleCheck, PackageCheck, Hourglass, TriangleAlert, SquareDashed, Wrench, Timer } from "lucide-react";
import { createElement } from "react";
import { assetStats } from "@/data/systemHardware";
import type { StatCard } from "./types";

/**
 * Figma `SHM Dashboard` (5133:38715) — eight tiles in two rows of four, each
 * with its own fill/outline pair and glyph. Resolved from the frame, not
 * guessed: note that `Not Returned` and `Overdue` sit on the danger fill but
 * take `border/invert/primary`, not `border/invert/danger`.
 */
export const STAT_CARDS: StatCard[] = [
  { label: "Total Assets",   value: assetStats.total,         tone: "bg-info-invert-soft border-invert-info",       icon: createElement(Boxes, { size: 24, className: "text-info" }) },
  { label: "Available",      value: assetStats.available,     tone: "bg-success-invert-soft border-invert-success",  icon: createElement(CircleCheck, { size: 24, className: "text-success" }) },
  { label: "Issued",         value: assetStats.issued,        tone: "bg-success-invert-soft border-invert-success",  icon: createElement(PackageCheck, { size: 24, className: "text-success" }) },
  { label: "Pending Return", value: assetStats.pendingReturn, tone: "bg-warning-invert-soft border-invert-warning",  icon: createElement(Hourglass, { size: 24, className: "text-warning" }) },
  { label: "Not Returned",   value: assetStats.notReturned,   tone: "bg-danger-invert-soft border-invert-primary",   icon: createElement(TriangleAlert, { size: 24, className: "text-danger" }) },
  { label: "Missing",        value: assetStats.missing,       tone: "bg-orange-invert-soft border-invert-orange",    icon: createElement(SquareDashed, { size: 24, className: "text-orange" }) },
  { label: "Maintenance",    value: assetStats.maintenance,   tone: "bg-warning-invert-soft border-invert-warning",  icon: createElement(Wrench, { size: 24, className: "text-warning" }) },
  { label: "Overdue",        value: assetStats.overdue,       tone: "bg-danger-invert-soft border-invert-primary",   icon: createElement(Timer, { size: 24, className: "text-danger" }) },
];

export const DONUT_R = 60;
export const DONUT_STROKE = 22;
export const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;
