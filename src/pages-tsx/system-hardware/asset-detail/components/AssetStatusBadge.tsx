import { cn } from "@/lib/utils";
import { ASSET_STATUS_STYLES } from "../constants";

interface AssetStatusBadgeProps {
  status: string;
}

export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border text-xs font-medium px-2 py-0.5",
        ASSET_STATUS_STYLES[status] || ASSET_STATUS_STYLES.Available
      )}
    >
      {status}
    </span>
  );
}
