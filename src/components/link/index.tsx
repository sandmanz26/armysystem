import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Link — design-system component.
 *
 * Figma `Link` (Kind = primary). A text-only action: 14 Medium `text/primary`, an optional
 * 18px icon before and/or after the label, 8px between the parts. Used in Site Management →
 * Add Blackout Date for "Add End Date" / "Remove End Date", "View" and "View 1 more".
 *
 * It is a <button>, not an anchor — every Link in that drawer runs an action or opens a
 * record. Hover underlines, the same cue the "+N more" links elsewhere in Site Management
 * already use. (Figma's hover/disabled variants of `Link` could not be re-read when this was
 * written — see the Add Blackout Date session log.)
 */

export interface LinkProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  /** Icon before the label, by library name. */
  prefixIcon?: IconName;
  /** Icon after the label, by library name. */
  suffixIcon?: IconName;
}

export function Link({
  children,
  prefixIcon,
  suffixIcon,
  className,
  type = "button",
  ...props
}: LinkProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-primary",
        "hover:underline focus-visible:underline focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:text-disabled disabled:no-underline",
        className,
      )}
    >
      {prefixIcon && <Icon name={prefixIcon} size={18} />}
      {children}
      {suffixIcon && <Icon name={suffixIcon} size={18} />}
    </button>
  );
}
