interface CoursewareCellProps {
  text: string;
}

export function CoursewareCell({ text }: CoursewareCellProps) {
  const isLong = text.length > 20;
  return (
    <div className="relative group/tip max-w-[170px]">
      <div className="truncate text-sm text-gray-600">{text}</div>
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
