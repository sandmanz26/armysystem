import { cn } from "@/lib/utils";
export function StatusBadge({ status }) {
    const active = status === "Active";
    return (<span className={cn("inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5", active ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
      {status}
    </span>);
}
