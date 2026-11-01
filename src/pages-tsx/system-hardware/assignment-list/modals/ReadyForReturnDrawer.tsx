import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Formik, Form, type FormikProps } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Input } from "@/components/input";
import { Icon } from "@/components/icon";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AssignmentStatusBadge } from "../components/AssignmentStatusBadge";
import { DateTimeCell } from "../components/AssignmentTable";
import { BOOKING_DETAILS, PER_PAGE, formatAssignmentId, matchesAssignmentId } from "../constants";
import { variantOf } from "../../assignment-detail/constants";
import type { Assignment } from "@/data/systemHardware";

/*
 * Ready For Return Assets — Figma section `Action - Ready For Return Assets`
 * (5839:87653):
 *   Drawer - Select Assignment                 5889:280024  default / rows ticked
 *   Drawer - Select Assignment - Empty         5895:505152  nothing ticked
 *   Drawer - Select Assignment - Empty Error   5895:504788  Confirm with nothing ticked
 *   Drawer - Select Assignment - No Assignment 5895:505516  no eligible assignment
 *   Confirmation                               5895:483999
 *   Toast - Success                            5895:484001  (owned by index.tsx)
 *
 * Drawer 1024 wide, header holds the title only. Content (20px padding, 32px
 * gap): optional danger Alert → subtitle → `Section Layout - Table` card
 * ("Assignment List N" + 240px Search, the table, pagination).
 * Columns per Figma: ☐ 56 · No. 56 · Assignment ID 200 · Assignment Type 200 ·
 * Booking ID 320 · Assignment Status 200 · Base Station(s) 160 · Asset Qty 160 ·
 * Issued Date 160 — the card scrolls horizontally like Figma's scroll bar.
 */

const DRAWER_WIDTH = 1024;

interface FormValues {
  selected: string[];
}

const schema = Yup.object({
  selected: Yup.array().of(Yup.string().required()).min(1, "Select at least 1 assignment to continue"),
});

interface ReadyForReturnDrawerProps {
  candidates: Assignment[];
  /** Row ids ticked on open (e.g. opened from a row's ⋮ → Ready For Return Assets). */
  initialSelected?: string[];
  onClose: () => void;
  /** Called after the user confirms — index.tsx owns the actual status change and the toast. */
  onSubmitted: (assignmentIds: string[]) => void;
}

export function ReadyForReturnDrawer({
  candidates,
  initialSelected = [],
  onClose,
  onSubmitted,
}: ReadyForReturnDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);

  const filtered = useMemo(
    () => candidates.filter((a) => matchesAssignmentId(a.assignmentId, searchQuery)),
    [candidates, searchQuery],
  );
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [filtered, currentPage],
  );

  return (
    <Formik<FormValues>
      initialValues={{ selected: initialSelected }}
      validationSchema={schema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values) => setConfirmIds(values.selected)}
    >
      {(formik) => (
        <>
          <Drawer
            open
            onClose={onClose}
            width={DRAWER_WIDTH}
            title="Select Assignment"
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-5 text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="ready-for-return-form"
                  className="h-10 rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  Confirm
                </button>
              </>
            }
          >
            <Form id="ready-for-return-form" className="flex flex-col gap-8">
              {formik.submitCount > 0 && typeof formik.errors.selected === "string" && (
                // Figma `Alert` (danger) — 5895:504788.
                <div
                  role="alert"
                  className="flex items-center gap-3 rounded-lg border border-danger bg-danger-invert-default p-3.5"
                >
                  <Icon name="circle-alert" size={20} className="flex-shrink-0 text-danger" />
                  <p className="text-sm font-medium text-danger">{formik.errors.selected}</p>
                </div>
              )}

              <p className="text-sm text-default">Select assignments to mark as ready for return.</p>

              <section className="overflow-hidden rounded-xl border border-invert-default bg-surface">
                <header className="flex h-[76px] items-center justify-between gap-5 px-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-default">Assignment List</h3>
                    <span className="text-base font-semibold text-body">{filtered.length}</span>
                  </div>
                  <Input
                    size="sm"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    prefixIcon={<Icon name="search" size={18} />}
                    wrapperClassName="w-60"
                  />
                </header>

                <SelectTable rows={paged} allRows={filtered} offset={(currentPage - 1) * PER_PAGE} formik={formik} />

                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={PER_PAGE}
                  totalItems={filtered.length}
                  setCurrentPage={setCurrentPage}
                />
              </section>
            </Form>
          </Drawer>

          <ConfirmDialog
            open={confirmIds !== null}
            tone="warning"
            title={`Ready to return ${confirmIds?.length ?? 0} assignment${confirmIds?.length === 1 ? "" : "s"}?`}
            subtitle="Asset status will change to Pending Return. This can't be undone."
            confirmLabel="Confirm"
            onCancel={() => setConfirmIds(null)}
            onConfirm={() => {
              onSubmitted(confirmIds ?? []);
              setConfirmIds(null);
              onClose();
            }}
          />
        </>
      )}
    </Formik>
  );
}

function SelectTable({
  rows,
  allRows,
  offset,
  formik,
}: {
  rows: Assignment[];
  allRows: Assignment[];
  offset: number;
  formik: FormikProps<FormValues>;
}) {
  const selected = formik.values.selected;
  const allSelected = allRows.length > 0 && allRows.every((a) => selected.includes(a.id));
  const someSelected = allRows.some((a) => selected.includes(a.id));

  const setSelected = (next: string[]) => {
    formik.setFieldValue("selected", next, false);
    if (next.length > 0) formik.setFieldError("selected", undefined);
  };
  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !allRows.some((a) => a.id === id))
        : Array.from(new Set([...selected, ...allRows.map((a) => a.id)])),
    );
  const toggleOne = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const fixed = (px: number) => ({ width: `${px}px`, minWidth: `${px}px`, maxWidth: `${px}px` });

  const columns: ColumnDef<Assignment, any>[] = [
    {
      id: "select",
      ...fixed(56),
      header: () => (
        <Checkbox
          id="ready-return-all"
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onChange={toggleAll}
          size={18}
        />
      ),
      cell: (info: any) => (
        <Checkbox
          id={`ready-return-${info.row.original.id}`}
          checked={selected.includes(info.row.original.id)}
          onChange={() => toggleOne(info.row.original.id)}
          size={18}
        />
      ),
    },
    {
      id: "no",
      ...fixed(56),
      header: () => "No.",
      cell: (info: any) => <div className="text-sm text-body">{offset + info.row.index + 1}</div>,
    },
    {
      id: "assignmentId",
      ...fixed(200),
      header: () => "Assignment ID",
      cell: (info: any) => (
        <div className="text-sm font-semibold text-default">{formatAssignmentId(info.row.original.assignmentId)}</div>
      ),
    },
    {
      id: "assignmentType",
      ...fixed(200),
      header: () => "Assignment Type",
      cell: (info: any) => <div className="text-sm text-default">{variantOf(info.row.original)}</div>,
    },
    {
      id: "bookings",
      ...fixed(320),
      header: () => "Booking ID ",
      cell: (info: any) => {
        const assignment = info.row.original as Assignment;
        const [firstId, ...restIds] = assignment.bookings;
        const first = firstId ? BOOKING_DETAILS[firstId] : undefined;
        if (!first) return <span className="text-sm text-body">—</span>;
        const restCw = restIds.reduce((sum, id) => sum + (BOOKING_DETAILS[id]?.coursewareCount ?? 1), 0);
        return (
          <div>
            <p className="text-sm text-default leading-snug">{first.program}</p>
            <p className="text-xs text-body mt-0.5 leading-snug">
              {first.bookingId} &middot; {first.coursewareCount} CW
            </p>
            {restIds.length > 0 && (
              <p className="text-xs font-medium text-primary mt-0.5 leading-snug">
                +{restIds.length} booking{restIds.length !== 1 ? "s" : ""} &middot; {restCw} CW
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      ...fixed(200),
      header: () => "Assignment Status",
      cell: (info: any) => <AssignmentStatusBadge status={info.row.original.status} />,
    },
    {
      id: "baseStations",
      ...fixed(160),
      header: () => "Base Station(s)",
      cell: (info: any) => {
        const [first, ...rest] = info.row.original.baseStations as string[];
        if (!first) return <span className="text-sm text-body">—</span>;
        return (
          <div>
            <p className="text-sm text-default leading-snug">{first}</p>
            {rest.length > 0 && (
              <p className="text-xs font-medium text-primary mt-0.5 leading-snug">+{rest.length} more</p>
            )}
          </div>
        );
      },
    },
    {
      id: "assetQty",
      ...fixed(160),
      header: () => "Asset Qty",
      cell: (info: any) => {
        const qty = info.row.original.assetQty;
        return (
          <div className="text-sm text-default">
            {qty} Asset{qty !== 1 ? "s" : ""}
          </div>
        );
      },
    },
    {
      id: "issuedDate",
      ...fixed(160),
      header: () => "Issued Date",
      // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
      normalWhitespace: "true",
      cell: (info: any) => <DateTimeCell value={info.row.original.issuedDate} />,
    },
  ];

  // Empty copy per `Drawer - Select Assignment - No Assignment` (5895:505516).
  return (
    <TableCustom
      columns={columns}
      data={rows}
      autoScrollTable={true}
      emptyTitle="No data to show right now"
      emptySubtitle="This table will be automatically updated once users take action."
    />
  );
}
