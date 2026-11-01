import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckItem } from "../types";
import { statusColor, statusDot } from "../utils";

interface TrxCardProps {
  items: CheckItem[];
  onDetail: (id: string) => void;
}

export function TrxCard({ items, onDetail }: TrxCardProps) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => onDetail("bit-trx")}
          className="w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(item.status))} />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn("text-xs font-semibold", statusColor(item.status))}>
              {item.perStation
                ? `${item.perStation.filter((s) => s.status === item.status).length}/${item.perStation.length} ${item.status}`
                : item.status}
            </span>
            <ChevronRight size={13} className="text-gray-300" />
          </div>
        </button>
      ))}
    </div>
  );
}
