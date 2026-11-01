import type { SectionCardProps } from "../types";

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-invert-default shadow-sm">
      <div className="px-4 py-2.5 border-b border-invert-default bg-default-soft/70 rounded-t-xl">
        <p className="text-xs font-bold text-disabled uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
