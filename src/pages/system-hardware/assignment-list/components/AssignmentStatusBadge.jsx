import { cn } from "@/lib/utils";
const STATUS_STYLES = {
    Issued: "bg-purple-50 text-purple-600 border-purple-200",
    Returned: "bg-green-50 text-green-600 border-green-200",
    "Pending Return": "bg-orange-50 text-orange-500 border-orange-200",
    "Not Returned": "bg-red-50 text-red-500 border-red-200",
    Missing: "bg-gray-100 text-gray-600 border-gray-200",
};
export function AssignmentStatusBadge({ status }) {
    return (<span className={cn("inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5", STATUS_STYLES[status])}>
      {status}
    </span>);
}
