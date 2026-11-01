import { cn } from "@/lib/utils";
import { ASSET_STATUS_STYLES } from "../constants";
export function AssetStatusBadge({ status }) {
    return (<span className={cn("inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5", ASSET_STATUS_STYLES[status] || ASSET_STATUS_STYLES.Available)}>
      {status}
    </span>);
}
