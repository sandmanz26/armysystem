import { cn } from "@/lib/utils";
export function AccountStatusBadge({ status }) {
    return (<span className={cn("inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5", status === "Active"
            ? "bg-green-50 text-green-600 border-green-200"
            : status === "Inactive"
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : "bg-yellow-50 text-yellow-600 border-yellow-200")}>
      {status}
    </span>);
}
