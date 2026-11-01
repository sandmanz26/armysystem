import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";

/*
 * BlackoutTooltip — Site Management list, Blackout Date column.
 *
 * Figma `Tooltip - Blackout Date` (page `Site Management Details`
 * `5112:111649`, frame `Tooltip` `6957:18959`):
 *
 *   Tooltip Base  320×168, radius **4**, fill `color/background/default/invert/default`
 *   Text          14 Regular `color/text/base`
 *   Arrow         20×7 pointing at the trigger, same dark fill
 *
 * It is a DARK tooltip. What stood here was a white card with
 * `border-invert-default`, a rounded-xl radius, an uppercase caption heading
 * and an orange `CalendarX` icon per row — none of which Figma has. The icon
 * colour was the last raw Tailwind shade left in this module.
 *
 * Figma also shows a mouse-pointer on the trigger, so it opens on hover. The
 * click toggle is kept alongside it for touch, where hover does not exist.
 *
 * Rendered through a portal to `document.body` (positioned via
 * `getBoundingClientRect`, same technique as `components/dropdown`) rather
 * than `position: absolute` inside the row. The Blackout Date column sits
 * near the right side of the table, and the table's own card wrapper is
 * `overflow-hidden` (every list page in this app uses that wrapper) — an
 * absolutely-positioned popup does NOT escape an ancestor's `overflow:
 * hidden` clipping just because it's `position: absolute`, so the 320px-wide
 * popup was getting clipped at the card's right edge before it ever reached
 * the browser viewport edge. Flips to right-anchored when left-anchoring
 * would still overflow the viewport itself.
 */
const POPUP_WIDTH = 320;

export function BlackoutTooltip({ dates }: { dates: string[] }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, arrowLeft: 16 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    let left = rect.left;
    if (left + POPUP_WIDTH > window.innerWidth - margin) {
      left = Math.max(margin, rect.right - POPUP_WIDTH);
    }
    const triggerCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.min(POPUP_WIDTH - 24, Math.max(12, triggerCenter - left - 6));
    setPos({ top: rect.bottom + 6, left, arrowLeft });
  }, []);

  useLayoutEffect(() => {
    if (!show) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [show, updatePosition]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setShow(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const visible = dates.slice(0, 2);
  const extra = dates.slice(2);

  return (
    <div className="flex flex-col gap-0.5">
      {visible.map((d, i) => (
        <div key={i} className="text-sm text-default">{d}</div>
      ))}

      {extra.length > 0 && (
        <div ref={triggerRef} className="inline-block">
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="text-xs text-primary font-medium hover:underline"
          >
            +{extra.length} more
          </button>

          {show &&
            createPortal(
              <div
                ref={popupRef}
                className="fixed z-[1113]"
                style={{ top: pos.top, left: pos.left }}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
              >
                {/* Arrow — 20×7, same fill as the base, pointed at the trigger */}
                <span
                  aria-hidden
                  className="absolute top-0 h-2 w-3 -translate-y-1 bg-default-invert-default"
                  style={{ left: pos.arrowLeft, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                />
                <div className="w-80 rounded bg-default-invert-default p-3 shadow-lg">
                  <ul className="space-y-2">
                    {dates.map((d, i) => (
                      <li key={i} className="list-disc list-inside text-sm text-invert-default">
                        {/* Figma joins each blackout's parts with a middle dot. */}
                        {d.split("\n").filter(Boolean).join(" · ")}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>,
              document.body,
            )}
        </div>
      )}
    </div>
  );
}
