import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * The shell every Settings panel sits in, read from Figma's Settings pages
 * (`7033:691121` General, `7033:691122` Notification, `5108:73523` System Version):
 *
 *   Main Content ▸ Body (gap 24)
 *     ├─ Page Header      1096×40   title 20 Semi Bold  color/text/default, Right Content slot
 *     └─ Section Layout   card: color/background/surface lv1
 *                               border color/border/invert/default, radius 12
 *          ├─ Section Header  64 tall, padding 20, 16 Semi Bold  color/text/default
 *          └─ Content         padding 0 20 20
 *
 * No "Last updated" stamp and no Cancel / Save row inside the card — Figma's
 * save action is the Page Header's **Save Changes** button (see
 * `SaveChangesButton`), disabled until something changes.
 */

interface SettingsPanelProps {
  /** 20px heading above the card. */
  title: string;
  /** 16px heading inside the card. Figma repeats the page title here. */
  sectionTitle?: string;
  /** 12px line under the section header. */
  description?: string;
  /**
   * Rendered flush at the card's top edge, above the section header — Figma's
   * Tab Group sits there on Notification Setting. Kept as a slot rather than
   * letting the caller fight the content padding with negative margins.
   */
  topSlot?: ReactNode;
  /**
   * Rendered at the right edge of the Page Header. Figma's `Page Header` grows
   * 28 → 40 tall when its `🔄 Right Content` slot is filled — System Version
   * puts the primary "Add Version" button there.
   */
  headerAction?: ReactNode;
  /**
   * Drop the card's content padding. Figma's `Section Layout - Table` lets the
   * table run the full 1096 width of the card, so a table panel is flush while
   * a form panel is inset by 20.
   */
  flush?: boolean;
  children: ReactNode;
  className?: string;
}

export function SettingsPanel({
  title,
  sectionTitle,
  description,
  topSlot,
  headerAction,
  flush,
  children,
  className,
}: SettingsPanelProps) {
  const hasHeader = Boolean(sectionTitle);

  return (
    <div className="space-y-6">
      {/* Page Header — 20 Semi Bold, outside the card */}
      <div className="flex items-center justify-between gap-4 min-h-7">
        <h1 className="text-xl font-semibold text-default">{title}</h1>
        {headerAction}
      </div>

      {/* Section Layout — the card */}
      <div
        className={cn(
          "bg-surface-lv1 border border-invert-default rounded-xl overflow-hidden",
          className,
        )}
      >
        {topSlot}
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 p-5">
            <div>
              {sectionTitle && (
                <h2 className="text-base font-semibold text-default">{sectionTitle}</h2>
              )}
              {description && <p className="mt-1 text-xs text-body">{description}</p>}
            </div>
          </div>
        )}

        <div className={cn(!flush && "px-5 pb-5", !flush && !hasHeader && "pt-5")}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Page Header "Save Changes" (General `5029:6257` / `5029:6216`, Notification
 * `5029:6197`): 155×40, radius 8, padding 16/10, gap 8, `Icon / save` 18 +
 * 14 Semi Bold label.
 *   clean → `background/disabled` (#e5e7eb) with `text/disabled` (#9ca3af)
 *   dirty → `background/primary/default` with `text/base` (white — bound here
 *           as `text-invert-default`; `text-base` is Tailwind's font size)
 */
export function SaveChangesButton({
  disabled,
  onClick,
  type = "button",
}: {
  disabled: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed bg-disabled text-disabled"
          : "bg-primary-default text-invert-default hover:bg-primary-hovered",
      )}
    >
      <Icon name="save" size={18} />
      Save Changes
    </button>
  );
}
