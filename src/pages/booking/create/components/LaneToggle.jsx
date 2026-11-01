import { cn } from "@/lib/utils";
export function LaneToggle({ on, onChange, disabled }) {
    return (<button type="button" onClick={onChange} disabled={disabled} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0", disabled ? "bg-gray-200 cursor-not-allowed" : on ? "bg-green-500" : "bg-red-400")}>
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", on ? "translate-x-4" : "translate-x-0.5")}/>
    </button>);
}
