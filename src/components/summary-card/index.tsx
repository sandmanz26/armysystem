import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * SummaryCard — design-system component.
 *
 * Figma `Input-Summary (Read Only)` (Variant = Text) and its `SubSection in Section Layout`.
 * A 14 Medium `text/default` label over a grey card: radius 8, fill
 * `color/background/default/default`, 16px padding, 16px between its children.
 *
 * Site Management → Add Blackout Date uses it twice: labelled "Summary" for the generated
 * sentence + dates, and unlabelled as the grey box around "Repeats every …" under Repeat → Custom.
 */

export interface SummaryCardProps {
  /** Field label above the card. Leave out for the unlabelled variant. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SummaryCard({ label, children, className }: SummaryCardProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <span className="text-sm font-medium text-default">{label}</span>}
      <div className="flex flex-col gap-4 rounded-lg bg-default-default p-4">{children}</div>
    </div>
  );
}
