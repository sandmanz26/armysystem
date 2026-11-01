import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: string[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-body">
      <Home size={15} className="text-gray-400" />
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          <span
            className={
              idx === items.length - 1
                ? "text-brand-primary font-medium"
                : "text-body"
            }
          >
            {item}
          </span>
        </div>
      ))}
    </nav>
  );
}
