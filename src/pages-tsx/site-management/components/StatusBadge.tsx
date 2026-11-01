import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5",
      active ? "bg-success-invert-default text-success border-invert-success" : "bg-default-default text-default border-invert-default"
    )}>
      {status}
    </span>
  );
}
