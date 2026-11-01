import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Alert — design-system component.
 *
 * Figma `Alert` (Kind = full page, Status = warning), drawn inside
 * `Alert - Booking Conflict with Blackout` on Site Management Details →
 * `Action - Add Blackout Date` (5116:216631; e.g. frame `Add - Filled` 5116:216639).
 *
 *   box     radius 8, 1px `color/border/warning`, fill `color/background/warning/invert/default`
 *   header  14px padding, 12px gap — a 20px `triangle-alert` in `text/warning` and a
 *           14 Medium `text/warning` message, with a 1px `border/warning` line under it
 *   body    optional rows below the header, on the `background/surface` fill
 *
 * Only the warning status has been read from Figma. The component's other statuses are not
 * here until their tokens are read, not guessed.
 *
 * `description` (F-012, Import › Review Your Booking 6046:35437 / 6046:35458): Figma's `Alert`
 * with the Description property on — no body card, no divider. The 20px icon sits top-left
 * and the content column stacks the 14 Medium message over a 14 Regular `text/default`
 * description, 10px apart, inside 14px padding / 12px gap. Figma strokes sit INSIDE the frame,
 * so the CSS padding is 13px + the 1px border = 14px and the box totals 78px, not 80.
 *
 * `status="info"` (F-012, BD-19 Asset Ownership Transferred 6848:96288): `Alert` Kind outlined, Status info —
 * `background/info/invert/default` fill, 1px `border/info`, a 20px `info` and `text/info` message; used with `description`.
 *
 * `status="danger"` (F-006): read from Booking Details `Upcoming (The Day)` (5513:405960) —
 * fill `background/danger/invert/default`, 1px `border/danger`, a 20px `circle-alert` and a
 * 14 Medium `text/danger` message. Optional; warning stays the default.
 */

export interface AlertProps {
  message: ReactNode;
  /** Rows under the header (Figma puts a list of `Listbox Item`s here). */
  children?: ReactNode;
  className?: string;
  /** Extra classes for the rows wrapper (e.g. System Health keeps the rows on the warning fill). */
  bodyClassName?: string;
  /** Figma `Alert` Status. Defaults to warning. */
  status?: "warning" | "danger" | "info";
  /** Figma `Alert` Description — a 14 Regular `text/default` line under the message. */
  description?: ReactNode;
}

export function Alert({ message, children, className, bodyClassName, status = "warning", description }: AlertProps) {
  const danger = status === "danger";
  if (status === "info") {
    // Only the description form is drawn in Figma (6848:96288); same box, info tokens.
    return (
      <div role="status" className={cn("flex items-start gap-3 rounded-lg border border-info bg-info-invert-default p-[13px]", className)}>
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-info">
          <Icon name="info" size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className="text-sm font-medium text-info">{message}</p>
          {description && <p className="text-sm text-default">{description}</p>}
        </div>
      </div>
    );
  }
  if (description) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-lg border p-[13px]",
          danger ? "border-danger bg-danger-invert-default" : "border-warning bg-warning-invert-default",
          className,
        )}
      >
        <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center", danger ? "text-danger" : "text-warning")}>
          <Icon name={danger ? "circle-alert" : "triangle-alert"} size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className={cn("text-sm font-medium", danger ? "text-danger" : "text-warning")}>{message}</p>
          <p className="text-sm text-default">{description}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      role="status"
      className={cn(
        "overflow-hidden rounded-lg border",
        danger ? "border-danger bg-danger-invert-default" : "border-warning bg-warning-invert-default",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3 p-3.5", children && (danger ? "border-b border-danger" : "border-b border-warning"))}>
        <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center", danger ? "text-danger" : "text-warning")}>
          <Icon name={danger ? "circle-alert" : "triangle-alert"} size={20} />
        </span>
        <p className={cn("text-sm font-medium", danger ? "text-danger" : "text-warning")}>{message}</p>
      </div>
      {children && <div className={cn("bg-surface", bodyClassName)}>{children}</div>}
    </div>
  );
}
