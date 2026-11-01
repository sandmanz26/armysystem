import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
export function AOBadge({ value }) {
    const good = value >= 80;
    return (<div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", good ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
      {good ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
      {value.toFixed(2)}%
    </div>);
}
