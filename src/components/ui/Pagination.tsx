import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage?: (n: number) => void;
  totalItems: number;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  isLoading = false,
}: PaginationProps) {
  const total = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (setItemsPerPage) {
      setItemsPerPage(newSize);
      setCurrentPage(1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-invert-default">
      {/* Left: rows per page selector + count.
          Figma `Pagination` (node 5157:82062): the label and the row counter are
          both `color/text/body`; the page-size value is Medium `color/text/default`.
          The counter's separator is a plain hyphen, not an en dash.
          The container itself is `color/background/surface`; the chevron buttons
          are stroked `color/card/border-neutral` with `color/text/body` glyphs,
          and "of N" is `color/text/disabled`. */}
      <div className="flex items-center gap-2 text-sm text-body">
        <span>Rows per page</span>
        {setItemsPerPage ? (
          <select
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="h-7 px-2 text-sm font-medium text-default border border-card-neutral rounded-md bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        ) : (
          <span className="font-medium text-default">{itemsPerPage}</span>
        )}
        <span className="ml-2 text-body">
          {from} - {to} of {totalItems} rows
        </span>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isLoading}>
          <Icon name="chevrons-left" size={14} />
        </PageBtn>
        <PageBtn onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isLoading}>
          <Icon name="chevron-left" size={14} />
        </PageBtn>
        <span className="flex items-center gap-1 text-sm px-2">
          <span className="font-medium text-default">{currentPage}</span>
          <span className="text-disabled">of {total}</span>
        </span>
        <PageBtn onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === total || isLoading}>
          <Icon name="chevron-right" size={14} />
        </PageBtn>
        <PageBtn onClick={() => setCurrentPage(total)} disabled={currentPage === total || isLoading}>
          <Icon name="chevrons-right" size={14} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded border border-card-neutral text-body transition-colors",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-default-hovered"
      )}
    >
      {children}
    </button>
  );
}
