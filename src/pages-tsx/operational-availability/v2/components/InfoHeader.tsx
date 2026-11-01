import { useState } from "react";
import { Icon } from "@/components/icon";
import { Tooltip } from "@/components/tooltip";

/*
 * Table header label followed by Figma's 14px `Icon / info` (text/body, gap 8).
 * Hovering the icon shows the shared `Tooltip` below it, 128 wide — Figma
 * `Tooltip` (6915:52426, 8033:293791).
 */
export function InfoHeader({ label, tooltip }: { label: string; tooltip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <span
        className="relative inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Icon name="info" size={14} className="text-body" />
        <Tooltip visible={open} width={128} className="mt-1 font-normal whitespace-normal">
          <p className="text-sm leading-5 font-normal text-invert-default">{tooltip}</p>
        </Tooltip>
      </span>
    </span>
  );
}
