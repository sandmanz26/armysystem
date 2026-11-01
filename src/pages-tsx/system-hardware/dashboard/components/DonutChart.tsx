import { assetsByCategory, assetStats } from "@/data/systemHardware";
import { DONUT_R, DONUT_STROKE, CIRCUMFERENCE } from "../constants";

/*
 * Assets by Category — Figma `Chart - Asset` (320×448) on page SHM
 * (`5133:38313`), inside a `Section Layout` on `color/background/surface lv1`.
 *
 * Rebuilt 27 Sep 2026 against the frame. What was different:
 *
 *   · **Segment colours were eight hand-picked hex values** (#115e59, #5fa8a1,
 *     #1A6B3C …) with no link to the token layer. Figma binds each segment:
 *       info/default · success/default · danger/default · warning/default ·
 *       orange/default · purple/default · primary/default · info/pressed
 *     `assetsByCategory[].color` now names the CSS custom property and the
 *     chart reads it through `rgb(var(...))`.
 *   · **The centre read "Total Assets" in brand teal** (`fill="#115e59"`, 22px).
 *     Figma: "Total" 12 Regular `color/text/disabled` above the figure, and the
 *     figure itself **30 Bold** `color/text/default`.
 *   · **The legend was a two-column grid** with `text-caption` labels and
 *     `text-disabled` values. Figma's `Legend` is 280 wide, ONE column of eight
 *     rows: an 8×8 round `Badge` in the segment's own colour, the label 12
 *     Regular `color/text/default`, and the percentage 12 Regular
 *     `color/text/body` pushed to the right.
 *
 * The dot is a circle in Figma (`ELLIPSE`), not the rounded square used here.
 */
export function DonutChart() {
  let offset = 0;
  const segments = assetsByCategory.map((cat) => {
    const dash = (cat.percentage / 100) * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const seg = { ...cat, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const cx = 80;
  const cy = 80;
  const total = assetStats.total;

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Assets by category">
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={DONUT_R}
            fill="none"
            stroke={`rgb(var(${seg.color}))`}
            strokeWidth={DONUT_STROKE}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset + CIRCUMFERENCE / 4}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        {/* Figma `Legend` 41×52, centred: caption above, figure below */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="12"
          fill="rgb(var(--color-text-disabled))"
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="rgb(var(--color-text-default))"
        >
          {total}
        </text>
      </svg>

      <ul className="flex w-full max-w-[280px] flex-col gap-3">
        {assetsByCategory.map((cat) => (
          <li key={cat.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: `rgb(var(${cat.color}))` }}
            />
            <span className="truncate text-xs text-default">{cat.label}</span>
            <span className="ml-auto text-xs text-body tabular-nums">{cat.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
