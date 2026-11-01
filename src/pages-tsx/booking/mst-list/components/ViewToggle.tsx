import { List, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  viewMode: "list" | "calendar";
  onSetViewMode: (mode: "list" | "calendar") => void;
  className?: string;
}

export function ViewToggle({ viewMode, onSetViewMode, className }: ViewToggleProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      <button
        onClick={() => onSetViewMode("list")}
        title="List View"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-colors",
          viewMode === "list"
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
        )}
      >
        <List size={15} />
      </button>
      <button
        onClick={() => onSetViewMode("calendar")}
        title="Calendar View"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-colors",
          viewMode === "calendar"
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
        )}
      >
        <Calendar size={15} />
      </button>
    </div>
  );
}
