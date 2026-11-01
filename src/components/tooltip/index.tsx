import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared hover tooltip — a 1:1 port of the Figma component `Tooltip`
 * (WPT-MST-TCT-3.0, library SHIELD). The same component backs every tooltip in
 * the file: the calendar booking hover on `Dashboard - Day` (5654:76298) and
 * `Dashboard - Week` (5654:84524), and the Booking List hovers on section
 * 6480:83457 (weapon list, multiple courseware, multiple booking time,
 * briefing room).
 *
 * Measured from Figma, by variable NAME (not by hex):
 *   body    fill `color/background/default/invert/default` (#374151), radius 4,
 *           padding 4 top/bottom · 12 left/right
 *   arrow   12×7 triangle, horizontally centred, same fill as the body
 *   shadow  two stacked drop-shadows rgba(0,0,0,.1):
 *           0 4px 10px -2px  +  0 4px 4px -1px   → `shadow-tooltip`
 *   text    every line `color/text/base` (#ffffff) at 14/20; the first line is
 *           Bold when `title` is given, the rest Regular
 *   width   fixed per usage — Figma ships 160, 240 and 320
 *
 * `color/text/base` cannot map to `text-base` (that is Tailwind's font-size
 * utility), so it is addressed through `text-invert-default`, its same-valued
 * sibling — see the note at the top of tailwind.config.js.
 */
export interface TooltipProps {
  /** Drives opacity only; the node stays mounted so the fade can run. */
  visible: boolean;
  /** Bold first line. Omit for a body-only tooltip (e.g. the weapon list). */
  title?: string;
  /** Regular lines under the title. Figma renders these as one text node. */
  lines?: string[];
  /** Figma widths: 160 | 240 | 320. */
  width?: number;
  /** Escape hatch for richer content; used instead of title/lines. */
  children?: ReactNode;
  /** `top` sits above the anchor with the arrow pointing down — Figma's
   *  `Calendar - Month - Hover` (7602:81136) on a bottom-row card. */
  placement?: "bottom" | "top";
  className?: string;
}

export function Tooltip({
  visible,
  title,
  lines = [],
  width = 320,
  children,
  placement = "bottom",
  className,
}: TooltipProps) {
  const arrow = (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      aria-hidden="true"
      className={cn("mx-auto block fill-default-invert-default", placement === "top" && "rotate-180")}
    >
      <path d="M6 0L12 7H0L6 0Z" />
    </svg>
  );
  return (
    <div
      role="tooltip"
      aria-hidden={!visible}
      style={{ width, maxWidth: "80vw" }}
      className={cn(
        "absolute z-50 left-1/2 -translate-x-1/2",
        placement === "top" ? "bottom-full" : "top-full",
        "pointer-events-none transition-opacity duration-100",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {/* Arrow — Figma layer "Arrow": 12×7, centred, points at the anchor. */}
      {placement === "bottom" && arrow}

      <div className="rounded px-3 py-1 bg-default-invert-default shadow-tooltip">
        {children ?? (
          <p className="text-sm leading-5 text-invert-default">
            {title && <span className="font-bold">{title}</span>}
            {title && lines.length > 0 && <br />}
            {lines.map((line, i) => (
              <span key={i} className="font-normal">
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}
      </div>
      {placement === "top" && arrow}
    </div>
  );
}
