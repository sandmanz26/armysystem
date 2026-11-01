import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma component `Key Value`, used throughout the Assignment Details cards:
 * a vertical stack with 4px gap, the label in `color/text/body` at Regular
 * 12/16 and the value in `color/text/default` at Semi Bold 14/20.
 */
export function KeyValue({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 min-w-0", className)}>
      <span className="text-xs font-normal leading-4 text-body">{label}</span>
      <div className="text-sm font-semibold leading-5 text-default">{children}</div>
    </div>
  );
}

/**
 * Figma `Section Layout`: surface lv1 fill on a `border/invert/default` outline,
 * 12px radius, a 64-high header and 20px content padding.
 */
export function DetailCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex-1 min-w-0 rounded-xl bg-surface-lv1 border border-invert-default",
        className,
      )}
    >
      <header className="px-5 h-16 flex items-center">
        <h2 className="text-base font-semibold text-default">{title}</h2>
      </header>
      <div className="px-5 pb-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
