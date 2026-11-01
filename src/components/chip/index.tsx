import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Chip — design-system component.
 *
 * Figma `Chip` (Kind = outlined, Type = default, Size = md): a 28px tag, radius 4,
 * 4/8 padding, 6px gap, 1px `color/border/default` on `color/background/surface`, with a
 * 14 Regular `text/default` label. Used in Site Management → Add Blackout Date to list the
 * dates a blackout will cover ("Mon, 3 Nov 2025").
 *
 * Not to be confused with `ChipAdvanced`, the 40px pickable pill. This one only displays.
 * Figma's prefix and dismiss icons are not built: nothing uses them yet.
 */

export interface ChipProps {
  children: ReactNode;
  /**
   * Figma `Kind`. `outlined` (default) = the bordered surface chip above. `filled` = no border on
   * `color/background/default/default` — Resource Planning → Resource Types weapon chips
   * (6875:125827). Optional, so existing call sites keep `outlined`.
   */
  kind?: "outlined" | "filled";
  className?: string;
}

export function Chip({ children, kind = "outlined", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[4px] px-2 py-1",
        kind === "filled" ? "bg-default-default" : "border border-default bg-surface",
        "text-sm text-default",
        className,
      )}
    >
      {children}
    </span>
  );
}
