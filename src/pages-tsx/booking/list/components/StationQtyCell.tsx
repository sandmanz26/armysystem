interface StationQtyCellProps {
  flatQty?: number;
  cShapedQty?: number;
  flatStations?: string[];
  cShapedStations?: string[];
}

export function StationQtyCell({ flatQty, cShapedQty, flatStations, cShapedStations }: StationQtyCellProps) {
  if (!flatQty && !cShapedQty) {
    return <span className="text-sm text-gray-600">-</span>;
  }

  const parts: string[] = [];
  if (cShapedQty) parts.push(`${cShapedQty} C-Shaped`);
  if (flatQty) parts.push(`${flatQty} Flat Screen`);
  const summary = parts.join(" + ");

  const hasDetail = (flatStations?.length ?? 0) > 0 || (cShapedStations?.length ?? 0) > 0;

  return (
    <div className="relative group/tip max-w-[170px]">
      <div className="truncate text-sm text-gray-600">{summary}</div>
      {hasDetail && (
        <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover/tip:block">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-[260px] shadow-lg leading-relaxed">
            {!!cShapedStations?.length && (
              <div className="mb-1.5 last:mb-0">
                <div className="font-bold text-gray-300 uppercase tracking-wide text-[10px] mb-0.5">C-Shaped</div>
                <ul className="space-y-0.5">
                  {cShapedStations.map((s) => (
                    <li key={s} className="whitespace-normal">&middot; {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {!!flatStations?.length && (
              <div>
                <div className="font-bold text-gray-300 uppercase tracking-wide text-[10px] mb-0.5">Flat Screen</div>
                <ul className="space-y-0.5">
                  {flatStations.map((s) => (
                    <li key={s} className="whitespace-normal">&middot; {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="w-2 h-2 bg-gray-800 rotate-45 ml-3 -mt-1" />
        </div>
      )}
    </div>
  );
}
