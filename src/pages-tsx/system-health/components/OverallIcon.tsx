import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { Status } from "../types";
import { isGood } from "../utils";

export function OverallIcon({ status }: { status: Status }) {
  if (isGood(status)) return <CheckCircle2 size={16} className="text-green-500" />;
  if (status === "Failed") return <AlertTriangle size={16} className="text-red-500" />;
  return <HelpCircle size={16} className="text-amber-500" />;
}
