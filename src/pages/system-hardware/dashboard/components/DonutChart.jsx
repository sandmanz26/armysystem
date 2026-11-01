import { assetsByCategory, assetStats } from "@/data/systemHardware";
import { DONUT_R, DONUT_STROKE, CIRCUMFERENCE } from "../constants";
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
    return (<div className="p-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((seg) => (<circle key={seg.label} cx={cx} cy={cy} r={DONUT_R} fill="none" stroke={seg.color} strokeWidth={DONUT_STROKE} strokeDasharray={`${seg.dash} ${seg.gap}`} strokeDashoffset={-seg.offset + CIRCUMFERENCE / 4} style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}/>))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-2xl font-bold" fontSize="22" fontWeight="700" fill="#1a3a6b">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
          Total Assets
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {assetsByCategory.map((cat) => (<div key={cat.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }}/>
            <span className="text-gray-700">{cat.label}</span>
            <span className="ml-auto text-gray-500 font-medium">{cat.percentage}%</span>
          </div>))}
      </div>
    </div>);
}
