import { DETAIL } from "../constants";
export function DonutChart({ size = 180 }) {
    const r = 62;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;
    const gap = 3;
    let cumPct = 0;
    return (<svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {DETAIL.segments.map((seg) => {
            const dash = Math.max(0, seg.pct * circ - gap);
            const totalGap = circ - dash;
            const rotation = -90 + cumPct * 360;
            cumPct += seg.pct;
            return (<circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={26} strokeDasharray={`${dash} ${totalGap}`} strokeLinecap="round" transform={`rotate(${rotation} ${cx} ${cy})`}/>);
        })}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#9CA3AF" fontSize={11} fontWeight="500">Total</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#111827" fontSize={30} fontWeight="700">{DETAIL.totalTrainees}</text>
    </svg>);
}
