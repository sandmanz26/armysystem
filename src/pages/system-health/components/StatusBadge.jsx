import { cn } from "@/lib/utils";
import { statusBg, statusDot } from "../utils";
export function StatusBadge({ status }) {
    return (<span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", statusBg(status))}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusDot(status))}/>
      {status}
    </span>);
}
