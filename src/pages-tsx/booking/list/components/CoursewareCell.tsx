interface CoursewareCellProps {
  text: string;
}

export function CoursewareCell({ text }: CoursewareCellProps) {
  const items = text ? text.split(",").map((s) => s.trim()).filter(Boolean) : [];

  if (items.length <= 1) {
    const isLong = text.length > 20;
    return (
      <div className="relative group/tip max-w-[170px]">
        <div className="truncate text-sm text-gray-600">{text || "-"}</div>
        {isLong && (
          <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover/tip:block">
            <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-[260px] whitespace-normal shadow-lg leading-snug">
              {text}
            </div>
            <div className="w-2 h-2 bg-gray-800 rotate-45 ml-3 -mt-1" />
          </div>
        )}
      </div>
    );
  }

  const [first, ...rest] = items;
  return (
    <div className="relative group/tip inline-flex items-center gap-1.5 max-w-[170px]">
      <span className="truncate text-sm text-gray-600">{first}</span>
      <span className="flex-shrink-0 text-[10px] font-semibold text-brand-primary bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">
        +{rest.length}
      </span>
      <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover/tip:block">
        <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-[260px] shadow-lg leading-relaxed">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item} className="whitespace-normal">&middot; {item}</li>
            ))}
          </ul>
        </div>
        <div className="w-2 h-2 bg-gray-800 rotate-45 ml-3 -mt-1" />
      </div>
    </div>
  );
}
