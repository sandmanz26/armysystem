import { cn } from "@/lib/utils";
import { oaMonths } from "@/data/operationalAvailability";
export function SummaryCards() {
    const cards = [
        {
            label: "Avg Operational Availability",
            value: oaMonths.length
                ? `${(oaMonths.reduce((s, m) => s + m.availability, 0) / oaMonths.length).toFixed(1)}%`
                : "—",
            sub: `across ${oaMonths.length} months`,
            color: "text-brand-primary",
        },
        {
            label: "Best Month",
            value: oaMonths.length
                ? oaMonths.reduce((best, m) => (m.availability > best.availability ? m : best)).month
                : "—",
            sub: oaMonths.length
                ? `${Math.max(...oaMonths.map((m) => m.availability)).toFixed(1)}% availability`
                : "",
            color: "text-green-600",
        },
        {
            label: "Needs Attention",
            value: oaMonths.filter((m) => m.availability < 80).length.toString(),
            sub: "month(s) below 80%",
            color: "text-red-500",
        },
    ];
    return (<div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (<div key={card.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">{card.label}</p>
          <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
        </div>))}
    </div>);
}
