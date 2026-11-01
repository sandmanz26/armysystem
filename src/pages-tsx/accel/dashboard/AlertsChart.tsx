import { useState } from "react";
import { toneColor } from "../shared";
import { STATIONS, type RangeData, type StationId } from "./data";

/*
 * Line chart for "Alerts by Base Station". Hand-drawn SVG (the project has no chart library).
 * Second pass:
 *  · straight segments, not smoothed curves — these are counts per bucket, and a curve invents
 *    values between the points that never existed (it showed TRX-01 "dipping" between samples);
 *  · hover (or keyboard focus on the plot) shows every station's value for that bucket — before,
 *    the only way to read a value was to guess it off the grid;
 *  · series can be hidden from the chips above, so two crowded lines can be compared alone.
 */

const W = 1000;
const H = 300;
const PAD = { l: 44, r: 20, t: 16, b: 34 };

export function AlertsChart({ data, visible }: { data: RangeData; visible: StationId["id"][] }) {
  const [hover, setHover] = useState<number | null>(null);
  const yMax = data.yTicks[data.yTicks.length - 1];
  const n = data.labels.length;
  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (n - 1);
  const y = (v: number) => PAD.t + (1 - v / yMax) * (H - PAD.t - PAD.b);
  const axis = "rgb(var(--color-border-invert-default))";
  const text = "rgb(var(--color-text-body))";
  const shown = STATIONS.filter((s) => visible.includes(s.id));

  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Alerts by base station over time">
        <text x={PAD.l - 36} y={PAD.t - 4} fontSize="11" fill={text}>Alerts</text>
        {data.yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke={axis} strokeDasharray={t === 0 ? undefined : "2 4"} />
            <text x={PAD.l - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill={text}>{t}</text>
          </g>
        ))}
        {data.labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="12" fill={text}>{l}</text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke={text} strokeOpacity="0.4" />}
        {shown.map((s) => {
          const pts = data.series[s.id].map((v, i) => `${x(i)},${y(v)}`).join(" ");
          const c = toneColor(s.tone);
          return (
            <g key={s.id}>
              <polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />
              {data.series[s.id].map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5.5 : 3.5} fill={c} stroke="rgb(var(--color-background-surface))" strokeWidth="1.5" />
              ))}
            </g>
          );
        })}
        {/* one invisible column per bucket for hover / focus */}
        {data.labels.map((l, i) => (
          <rect
            key={l}
            x={x(i) - (W - PAD.l - PAD.r) / (n - 1) / 2}
            y={PAD.t}
            width={(W - PAD.l - PAD.r) / (n - 1)}
            height={H - PAD.t - PAD.b}
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={`${l}: ${shown.map((s) => `${s.id} ${data.series[s.id][i]}`).join(", ")}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[140px] rounded-lg border border-invert-default bg-surface px-3 py-2 shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "-110%" : "10%"})` }}
        >
          <p className="mb-1 text-xs font-semibold text-default">{data.labels[hover]}</p>
          {shown.map((s) => (
            <p key={s.id} className="flex items-center justify-between gap-4 text-xs text-body">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: toneColor(s.tone) }} />
                {s.id}
              </span>
              <span className="font-semibold text-default">{data.series[s.id][hover]}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
