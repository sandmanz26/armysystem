import { Tooltip } from "@/components/tooltip";

/*
 * Booking 2.0 — the "+N more" cell.
 *
 * Figma uses one pattern for every column that can hold several values —
 * Courseware, Assignment ID, Weapon Type(s), Briefing Room (page
 * `↪ Booking List` `5029:28299`, frames `List` and `List - Full Table`):
 *
 *   line 1   first value          14 Regular `color/text/default`
 *   line 2   "+3 more"            12 Medium  `color/text/primary`
 *
 * It is two stacked lines, NOT a pill. The old booking module renders a rounded
 * `+3` badge on `bg-red-50` with a red border on the same line; that component
 * lives under `booking/` which is off limits, so this is booking-2's own.
 *
 * Hover opens `Tooltip - Multiple Courseware` (`5331:428546`): the same dark
 * tooltip used elsewhere in the file — radius 4,
 * `color/background/default/invert/default`, text 14 Regular
 * `color/text/base`, one value per line, with an arrow pointing at the cell.
 *
 * 27 Sep 2026 — rewritten to pure CSS `group-hover`, no `useState`.
 * The first version tracked hover with onMouseEnter/onMouseLeave, and it
 * turned out unreliable across columns in real use — Assignment ID and
 * Weapon Type(s) opened their tooltip, Courseware did not, even though the
 * three cells run the identical component. Chasing that with real hover tests
 * pointed at the same conclusion the old `booking/` `CoursewareCell` had
 * already reached: a JS mouseenter/mouseleave pair on a table cell is exactly
 * the kind of interaction — fast pointer movement, cells re-rendering under
 * the pointer, TanStack Table's own re-renders — that can drop an enter or a
 * leave event and leave the state wrong. CSS `:hover` cannot drop an event;
 * the browser owns it directly, so this is strictly more reliable, not just a
 * style preference.
 */

export interface MultiValueCellProps {
  /** Comma-separated, or an array. Empty renders Figma's em dash. */
  value: string | string[] | undefined | null;
  /** Click-through to the booking, same as the rest of the row. */
  onClick?: () => void;
}

/*
 * 1 Oct 2026 — the tooltip is now the shared `Tooltip` (components/tooltip),
 * which is the 1:1 port of the Figma component this hover uses. The hand-rolled
 * one before it had 12px padding all round, extra spacing between lines and an
 * arrow pinned to the left. Figma `Tooltip - Multiple Courseware`
 * (5331:429558): 240 wide, centred under the "+N more" link, its arrow tip
 * 10px below the link, every value (the first one too) one per line.
 */
export function MultiValueCell({ value, onClick }: MultiValueCellProps) {
  const items = (Array.isArray(value) ? value : String(value ?? "").split(","))
    .map((s) => String(s).trim())
    .filter(Boolean);

  if (items.length === 0) {
    return <span className="text-sm text-body">—</span>;
  }

  const [first, ...rest] = items;

  return (
    <div className="inline-block max-w-[200px]" onClick={onClick}>
      <div className="truncate text-sm text-default">{first}</div>
      {rest.length > 0 && (
        <div className="group/mv relative mt-0.5 inline-block text-xs font-medium text-primary">
          +{rest.length} more
          <Tooltip visible={false} width={240} lines={items} className="z-[1200] mt-2.5 whitespace-normal font-normal group-hover/mv:opacity-100" />
        </div>
      )}
    </div>
  );
}
