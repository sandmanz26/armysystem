import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
export function RfidStatusPill({ status }) {
    const connected = status === "Connected";
    return (<span className={cn("inline-flex items-center gap-1 text-xs font-medium", connected ? "text-green-600" : "text-gray-400")}>
      {connected ? <Wifi size={12}/> : <WifiOff size={12}/>}
      {status}
    </span>);
}
