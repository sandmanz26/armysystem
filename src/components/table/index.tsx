import React, { Fragment, useEffect, useLayoutEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SaveAll, ChevronDown, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableCustomProps<TData> {
  data?: TData[];
  isLoading?: boolean;
  isFooter?: boolean;
  classThead?: string;
  classTheadTh?: string;
  classTBody?: string;
  classTBodyTd?: string;
  columns?: ColumnDef<TData, any>[];
  autoScrollTable?: boolean;
  className?: string;
  nestedComponentButtonCondition?: (row: any) => any;
  getNestedComponent?: (row: any) => React.ReactNode;
  serverSideSortFn?: (sorting: SortingState) => void;
  actionSticky?: boolean;
  outerClass?: string;
  shadowAction?: boolean;
  tableFixed?: boolean;
  freezeRowWhenExpand?: boolean;
  isNested?: boolean;
  virtualized?: boolean;
  virtualRowHeight?: number;
  virtualOverscan?: number;
  getRowClass?: (row: any) => string;
  frozenColumns?: number;
  /**
   * Figma `Empty State - Business Components` has a `What` property. The default
   * here is its `Table` variant ("No data to show right now"). Pass these to get
   * the `Search` variant — a search glyph, `No result for "<query>"` and
   * "Try a different keyword" — or any other wording the frame calls for.
   */
  emptyIcon?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptySubtitle?: React.ReactNode;
}

export function TableCustom<TData>({
  data = [],
  isLoading = false,
  isFooter = false,
  classThead,
  classTheadTh,
  classTBody,
  classTBodyTd,
  columns = [],
  autoScrollTable = true,
  className,
  nestedComponentButtonCondition,
  getNestedComponent,
  serverSideSortFn,
  actionSticky = true,
  outerClass = "",
  shadowAction = true,
  tableFixed = false,
  freezeRowWhenExpand = false,
  virtualized = false,
  virtualRowHeight = 60,
  virtualOverscan = 8,
  getRowClass,
  frozenColumns = 0,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
}: TableCustomProps<TData>) {
  const normalizedColumns = useMemo(() => {
    const usedIds = new Map<string, number>();
    return columns.map((col, index) => {
      // @ts-ignore
      const baseId = col.id || col.accessorKey || `col-${index}`;
      const seen = usedIds.get(baseId) || 0;
      usedIds.set(baseId, seen + 1);
      const uniqueId = seen === 0 ? baseId : `${baseId}-${seen}`;

      if (col.id === uniqueId) return col;
      return { ...col, id: uniqueId };
    });
  }, [columns]);

  const initialSortingState = useMemo(() => {
    return normalizedColumns
      // @ts-ignore
      .filter((col) => col.initialSort)
      .map((col) => ({
        // @ts-ignore
        id: col.accessorKey || col.id,
        // @ts-ignore
        desc: col.initialSort === "desc",
      }));
  }, [normalizedColumns]);

  const [sorting, setSorting] = useState<SortingState>(initialSortingState);
  const [sortedData, setSortedData] = useState<TData[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    columns: normalizedColumns,
    data: sortedData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: typeof serverSideSortFn === "function" ? undefined : getSortedRowModel(),
    onSortingChange: (sort) => {
      setSorting((oldValue) => {
        const newValue = typeof sort === "function" ? sort(oldValue) : sort;
        if (typeof serverSideSortFn === "function") {
          serverSideSortFn(newValue);
        }
        return newValue;
      });
    },
    manualSorting: typeof serverSideSortFn === "function",
    state: { sorting },
  });

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const isStickyAction = useCallback(
    (columnDef: any) => {
      return actionSticky && (
        columnDef.accessorKey === "action" ||
        columnDef.id === "action" ||
        columnDef.accessorKey === "actions" ||
        columnDef.id === "actions"
      );
    },
    [actionSticky],
  );

  const frozenColumnOffsets = useMemo(() => {
    if (!frozenColumns) return {} as Record<string, number>;
    const offsets: Record<string, number> = {};
    let offset = 0;
    for (let i = 0; i < Math.min(frozenColumns, normalizedColumns.length); i++) {
      const col = normalizedColumns[i] as any;
      const id = col.id ?? col.accessorKey ?? `col-${i}`;
      offsets[id] = offset;
      const w = parseInt(col.width as string) || col.size || 150;
      offset += w;
    }
    return offsets;
  }, [frozenColumns, normalizedColumns]);

  const lastFrozenId = useMemo(
    () => Object.keys(frozenColumnOffsets).at(-1),
    [frozenColumnOffsets],
  );

  const isStickyLeft = useCallback(
    (columnDef: any): boolean => {
      const id = columnDef.id ?? columnDef.accessorKey;
      return !!id && id in frozenColumnOffsets;
    },
    [frozenColumnOffsets],
  );

  const getCellStyles = useCallback(
    (column: any, customZIndex?: number) => {
      const { width, minWidth, maxWidth } = column.columnDef;
      const isAction = isStickyAction(column.columnDef);
      const leftSticky = isStickyLeft(column.columnDef);
      const leftOffset = leftSticky
        ? frozenColumnOffsets[column.columnDef.id ?? column.columnDef.accessorKey]
        : undefined;
      return {
        width: isAction ? (width || "1%") : width,
        maxWidth: isAction ? (maxWidth || "150px") : maxWidth,
        minWidth: isAction ? (minWidth || "60px") : (minWidth || width || "150px"),
        right: isAction ? 0 : "auto",
        ...(leftOffset !== undefined ? { left: leftOffset } : {}),
        zIndex: customZIndex,
      };
    },
    [isStickyAction, isStickyLeft, frozenColumnOffsets],
  );

  const getStickyClass = useCallback(
    (columnDef: any) => {
      if (isStickyAction(columnDef)) return "sticky right-0 shadow-[-4px_0_10px_rgba(0,0,0,0.2)]";
      if (isStickyLeft(columnDef)) {
        const id = columnDef.id ?? columnDef.accessorKey;
        return cn("sticky", id === lastFrozenId && "shadow-[4px_0_8px_rgba(0,0,0,0.08)]");
      }
      return "";
    },
    [isStickyAction, isStickyLeft, lastFrozenId],
  );

  const isCompactColumn = useCallback((columnDef: any) => columnDef.compact === true, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollContainerWidth, setScrollContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setScrollContainerWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setScrollContainerWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rows = table.getRowModel().rows;
  const isVirtualizationEnabled = virtualized && !getNestedComponent && !freezeRowWhenExpand;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => virtualRowHeight,
    overscan: virtualOverscan,
    enabled: isVirtualizationEnabled,
  });

  const virtualRows = isVirtualizationEnabled ? rowVirtualizer.getVirtualItems() : [];
  const virtualPaddingTop = isVirtualizationEnabled && virtualRows.length > 0 ? virtualRows[0].start : 0;
  const virtualPaddingBottom =
    isVirtualizationEnabled && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div className={cn(autoScrollTable && "overflow-auto w-full relative", className)}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-surface/60">
          <div className="w-8 h-8 border-4 border-invert-default border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <div className="flex flex-col w-full h-full">
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex-1",
            autoScrollTable || freezeRowWhenExpand ? "overflow-auto" : "overflow-hidden h-full",
            outerClass,
          )}
        >
          <table
            className={cn(
              "w-full text-sm",
              !autoScrollTable && "h-full",
              tableFixed && "table-fixed",
              actionSticky && shadowAction ? " border-separate border-spacing-0" : " border-spacing-0",
            )}
          >
            <thead
              className={cn("bg-danger-invert-soft sticky top-0", getNestedComponent ? "z-[1112]" : "z-[1001]", classThead)}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "font-semibold text-sm text-left text-primary py-3 whitespace-nowrap bg-danger-invert-soft border-b border-invert-default",
                        isStickyAction(header.column.columnDef)
                          ? "px-4 text-center"
                          : isCompactColumn(header.column.columnDef)
                            ? "px-3"
                            : "px-5",
                        classTheadTh,
                        header.column.getCanSort() && "cursor-pointer select-none",
                        getStickyClass(header.column.columnDef),
                      )}
                      style={getCellStyles(header.column)}
                      onClick={(e: any) => {
                        if (e.target.type === undefined) header.column.getToggleSortingHandler()?.(e);
                      }}
                    >
                      {!header.isPlaceholder && (
                        <div className={cn("flex items-center gap-2", header.column.getCanSort() && "cursor-pointer select-none")}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            desc: <ArrowDown size={14} className="text-primary" />,
                            asc: <ArrowDown size={14} className="text-primary rotate-180" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={normalizedColumns.length} className="py-0 px-0">
                    {/* Figma `Empty State - Business Components`: a 48px
                        `background/default/default` circle with a 24px
                        `text/disabled` glyph, 12px gap, 24px vertical padding,
                        title 14 Semi Bold `text/body`, subtitle 14 Regular
                        `text/disabled`. */}
                    <div
                      className="sticky left-0 flex flex-col items-center gap-3 py-6"
                      style={{ width: scrollContainerWidth || "100%" }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-default">
                        {emptyIcon ?? <SaveAll width={24} className="text-disabled" />}
                      </div>
                      <div className="flex flex-col text-center">
                        <div className="text-sm font-semibold text-body">
                          {emptyTitle ?? "No data to show right now"}
                        </div>
                        <div className="pt-1 text-sm text-disabled">
                          {emptySubtitle ??
                            "This table will be automatically updated once users take action"}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {isVirtualizationEnabled && virtualPaddingTop > 0 && (
                <tr>
                  <td style={{ height: `${virtualPaddingTop}px` }} colSpan={normalizedColumns.length} />
                </tr>
              )}
              {isVirtualizationEnabled
                ? virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    const rowIndex = virtualRow.index;

                    return (
                      <tr key={row.id} className={cn("bg-surface", classTBody)}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "h-14 py-3 bg-surface border-b border-invert-default",
                              isStickyAction(cell.column.columnDef)
                                ? "px-4 text-center"
                                : isCompactColumn(cell.column.columnDef)
                                  ? "px-3"
                                  : "px-5",
                              getStickyClass(cell.column.columnDef),
                              // @ts-ignore
                              cell.column.columnDef.normalWhitespace === "true" ? "" : "whitespace-nowrap",
                              classTBodyTd,
                            )}
                            style={getCellStyles(cell.column, (getNestedComponent ? 1111 : 1000) - rowIndex)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                : rows.map((row, rowIndex) => (
                    <Fragment key={row.id}>
                      <tr className={cn("bg-surface hover:bg-main-background transition-colors", classTBody, getRowClass?.(row.original))}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "h-14 py-3 bg-surface border-b border-invert-default",
                              isStickyAction(cell.column.columnDef)
                                ? "px-4 text-center"
                                : isCompactColumn(cell.column.columnDef)
                                  ? "px-3"
                                  : "px-5",
                              freezeRowWhenExpand && expandedRows[row.id] && "sticky top-[56px] z-[200] bg-surface border-b border-invert-default",
                              getStickyClass(cell.column.columnDef),
                              // @ts-ignore
                              cell.column.columnDef.normalWhitespace === "true" ? "" : "whitespace-nowrap",
                              classTBodyTd,
                            )}
                            style={{
                              ...(freezeRowWhenExpand
                                ? { right: isStickyAction(cell.column.columnDef) ? -10 : "auto" }
                                : getCellStyles(cell.column, (getNestedComponent ? 1111 : 1000) - rowIndex)),
                            }}
                          >
                            {/* @ts-ignore */}
                            {isStickyAction(cell.column.columnDef) && getNestedComponent ? (
                              <div className="flex">
                                <button
                                  {...(nestedComponentButtonCondition?.(row) || {})}
                                  className={cn("w-10 h-10 flex items-center justify-center transition-transform duration-300", expandedRows[row.id] && "rotate-180")}
                                  onClick={() => setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                                >
                                  <ChevronDown size={18} className="text-body" />
                                </button>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ) : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </td>
                        ))}
                      </tr>
                      {expandedRows[row.id] && getNestedComponent && (
                        <tr>
                          <td colSpan={columns.length} className={freezeRowWhenExpand ? "sticky top-[60px] z-[150] bg-surface" : ""}>
                            {getNestedComponent(row)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
              {isVirtualizationEnabled && virtualPaddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${virtualPaddingBottom}px` }} colSpan={normalizedColumns.length} />
                </tr>
              )}
            </tbody>
            {isFooter && (
              <tfoot>
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(getStickyClass(header.column.columnDef), isStickyAction(header.column.columnDef) && "z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1]")}
                        style={{ right: isStickyAction(header.column.columnDef) ? -10 : "auto" }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
