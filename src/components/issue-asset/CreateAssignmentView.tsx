// Issue Asset Step 1 — Create Assignment (full page), one view for all four entry points.
// Figma page "↪ Action - Issue Asset (Booking)" (5869:43219) and "Action - Issue Asset"
// (5411:107732); re-sliced 20 Oct 2026 (F-010, SH-24 / SH-15 / SH-16).
//
//   entry               Figma section                                   chips   courseware list
//   assignment-list     Entry Point: Assignment List  6966:232953 …     yes     every booking
//   today               Entry Point: Todays Booking   6966:235823 …     no      every booking
//   booking-details     Entry Point: Booking Details  6966:240035 …     no      this booking only
//                       (1 CW → 6966:238435: one ticked, locked row)
//
//   Header Nav   44px round ✕ · "Create Assignment" · primary "Create"
//   Left 728     Personnel (Operator · Armskote Operator, side by side) and Assignment Configuration:
//                Assignment Type chips (Assignment List only) → Booking: Select Courseware ·
//                Administration / Maintenance: Reason (Text Area, "Enter issuing reason")
//   Right 640    Assets to Withdraw — Booking only: "N Total Assets" + No · Asset Type ·
//                Asset Category · Target Qty; empty "No assets to withdraw yet".
//
// Errors appear on "Create" (Figma `… - Empty Error`): "Operator is required", "Armskote Operator is
// required", "Assignment Type is required", "Reason is required", "Select at least 1 courseware to
// continue". Step 2 is reached with the URL params documented in
// booking-2/issue-assets/scanMode.ts (`bookingIds`, `cw`, `type`, `reason`, `returnTo`).
import { useMemo, useState } from "react";
import { Form, Formik, useFormikContext } from "formik";
import type { ColumnDef } from "@tanstack/react-table";
import * as Yup from "yup";
import { bookings } from "@/data/mock";
import { armskokePersonnelOperators, assignmentTypes, baseStations, operators } from "@/data/systemHardware";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";
import { Icon } from "@/components/icon";
import { Select } from "@/components/select";
import { TableCustom } from "@/components/table";
import { Textarea } from "@/components/input/Textarea";
import { buildCoursewareGroups, CoursewareTable } from "./CoursewareTable";

export type CreateAssignmentEntry = "assignment-list" | "today" | "booking-details";

interface FormValues {
  operator: string;
  personnelOperator: string;
  assignmentType: string;
  reason: string;
  /** Only used when HIDDEN_FEATURES.adminBaseStationDropdown is on (Administration / Maintenance). */
  baseStation: string;
  coursewareKeys: string[];
}

const CONTROLLED_ITEMS = new Set(["Claymore", "Cond Bino", "Comd Bino", "Drone"]);
const assetCategory = (type: string) => (CONTROLLED_ITEMS.has(type) ? "Controlled Item" : "Weapon");

const schema = Yup.object().shape({
  operator: Yup.string().required("Operator is required"),
  personnelOperator: Yup.string().required("Armskote Operator is required"),
  assignmentType: Yup.string().required("Assignment Type is required"),
  reason: Yup.string().when("assignmentType", {
    is: (v: string) => v === "Administration" || v === "Maintenance",
    then: (s) => s.trim().required("Reason is required"),
  }),
  baseStation: Yup.string().when("assignmentType", {
    is: (v: string) => HIDDEN_FEATURES.adminBaseStationDropdown && (v === "Administration" || v === "Maintenance"),
    then: (s) => s.required("Base Station is required"),
  }),
  coursewareKeys: Yup.array()
    .of(Yup.string().required())
    .when("assignmentType", {
      is: "Booking",
      then: (s) => s.min(1, "Select at least 1 courseware to continue"),
    }),
});

interface PreviewRow {
  no: number;
  type: string;
  category: string;
  qty: number;
}

const colW = (px: number): any => ({ width: `${px}px`, minWidth: `${px}px` });

const previewColumns: ColumnDef<PreviewRow, any>[] = [
  { id: "no", ...colW(64), header: () => "No", cell: (i) => <span className="text-sm text-body">{i.row.original.no}</span> },
  { id: "type", ...colW(120), header: () => "Asset Type", cell: (i) => <span className="text-sm text-default">{i.row.original.type}</span> },
  { id: "category", ...colW(140), header: () => "Asset Category", cell: (i) => <span className="text-sm text-default">{i.row.original.category}</span> },
  { id: "qty", ...colW(100), header: () => "Target Qty", cell: (i) => <span className="text-sm text-default">{i.row.original.qty}</span> },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-default bg-surface">
      <header className="flex h-16 items-center px-5">
        <h2 className="text-base font-semibold text-default">{title}</h2>
      </header>
      <div className="flex flex-col gap-5 px-5 pb-5">{children}</div>
    </section>
  );
}

export interface CreateAssignmentViewProps {
  entry: CreateAssignmentEntry;
  /** Step 2 route: `/bookings/issue-assets` or `/system-hardware/issue-assets`. */
  issueBase: string;
  /** Where the ✕ goes. */
  cancelPath: string;
  /** Booking Details entry: the booking the page was opened from. */
  anchorBookingId?: string | null;
  onNavigate?: (path: string) => void;
}

function Inner({ entry, cancelPath, anchorBookingId, onNavigate }: CreateAssignmentViewProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched, submitCount } = useFormikContext<FormValues>();
  const [query, setQuery] = useState("");
  const showChips = entry === "assignment-list";
  const anchor = useMemo(() => bookings.find((b) => b.id === anchorBookingId), [anchorBookingId]);
  const isBooking = values.assignmentType === "Booking";
  const showErr = (k: keyof FormValues) => (submitCount > 0 || touched[k]) && typeof errors[k] === "string" ? (errors[k] as string) : undefined;

  const allGroups = useMemo(
    () => buildCoursewareGroups(entry === "booking-details" ? (anchor ? [anchor] : []) : bookings),
    [entry, anchor],
  );
  const locked = entry === "booking-details" && (anchor?.courseware.split(",").filter((c) => c.trim()).length ?? 0) === 1;
  // Figma Filled (Assignment List) shows a Search field above the list.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allGroups;
    return allGroups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((r) => [g.program, g.bookingLabel, r.name, r.schedule, ...r.baseStations].some((v) => v.toLowerCase().includes(q))),
      }))
      .filter((g) => g.rows.length > 0);
  }, [allGroups, query]);

  const checked = useMemo(() => new Set(values.coursewareKeys), [values.coursewareKeys]);
  const toggle = (key: string) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setFieldValue("coursewareKeys", [...next]);
  };

  const involvedIds = useMemo(() => Array.from(new Set(values.coursewareKeys.map((k) => k.split("::")[0]))), [values.coursewareKeys]);
  const preview: PreviewRow[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const b of bookings.filter((x) => involvedIds.includes(x.id))) {
      for (const w of b.weaponList ?? []) totals.set(w.type, (totals.get(w.type) ?? 0) + w.quantity);
    }
    return Array.from(totals, ([type, qty], i) => ({ no: i + 1, type, category: assetCategory(type), qty }));
  }, [involvedIds]);
  const totalAssets = preview.reduce((n, r) => n + r.qty, 0);

  return (
    <Form className="flex flex-1 flex-col overflow-hidden bg-main-background" noValidate>
      {/* ── Header Nav - Create Assignment (60px) ── */}
      <div className="relative flex h-[60px] flex-shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
        <button
          type="button"
          aria-label="Close"
          onClick={() => onNavigate?.(cancelPath)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-invert-default bg-surface text-default transition-colors hover:bg-default-hovered"
        >
          <Icon name="x" size={20} />
        </button>
        <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-base font-semibold text-default">Create Assignment</p>
        <button
          type="submit"
          className="flex h-11 items-center rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default transition-colors hover:bg-primary-hovered"
        >
          Create
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-default">New Assignment</h1>
            <p className="text-xs text-body">Complete all required fields to create and issue an assignment.</p>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex min-w-0 flex-[728] flex-col gap-6">
              <SectionCard title="Personnel">
                <div className="grid grid-cols-2 gap-5">
                  <Select
                    label="Operator"
                    required
                    placeholder="Select Operator"
                    options={operators}
                    value={values.operator}
                    onChange={(v) => setFieldValue("operator", v)}
                    status={showErr("operator") ? "danger" : "default"}
                    caption={showErr("operator")}
                  />
                  <Select
                    label="Armskote Operator"
                    required
                    placeholder="Select Armskote Operator"
                    options={armskokePersonnelOperators}
                    value={values.personnelOperator}
                    onChange={(v) => setFieldValue("personnelOperator", v)}
                    status={showErr("personnelOperator") ? "danger" : "default"}
                    caption={showErr("personnelOperator")}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Assignment Configuration">
                {showChips && (
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-0.5 text-sm font-medium text-default">
                      Assignment Type <span className="text-danger">*</span>
                    </span>
                    <ChipAdvancedGroup>
                      {assignmentTypes.map((t) => (
                        <ChipAdvanced
                          key={t}
                          label={t}
                          checkIcon
                          selected={values.assignmentType === t}
                          onSelect={() => {
                            setFieldValue("assignmentType", t);
                            setFieldTouched("assignmentType", true, false);
                          }}
                        />
                      ))}
                    </ChipAdvancedGroup>
                    {showErr("assignmentType") && <p className="text-xs text-danger">{showErr("assignmentType")}</p>}
                  </div>
                )}

                {isBooking && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-0.5 text-sm font-medium text-default">
                        Select Courseware {!locked && <span className="text-danger">*</span>}
                      </span>
                      {!locked && <p className="text-xs text-body">All selected courseware will share 1 assignment ID.</p>}
                    </div>
                    {entry === "assignment-list" && (
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body">
                          <Icon name="search" size={16} />
                        </span>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search..."
                          className="h-10 w-full rounded-lg border border-invert-default bg-surface pl-9 pr-3 text-sm text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused"
                        />
                      </div>
                    )}
                    <CoursewareTable groups={groups} checked={checked} onToggle={toggle} locked={locked} error={showErr("coursewareKeys")} />
                  </div>
                )}

                {HIDDEN_FEATURES.adminBaseStationDropdown &&
                  (values.assignmentType === "Administration" || values.assignmentType === "Maintenance") && (
                    <Select
                      label="Base Station"
                      required
                      placeholder="Select station"
                      options={baseStations}
                      value={values.baseStation}
                      onChange={(v) => setFieldValue("baseStation", v)}
                      status={showErr("baseStation") ? "danger" : "default"}
                      caption={showErr("baseStation")}
                    />
                  )}

                {(values.assignmentType === "Administration" || values.assignmentType === "Maintenance") && (
                  <Textarea
                    label="Reason"
                    required
                    placeholder="Enter issuing reason"
                    value={values.reason}
                    onChange={(e) => setFieldValue("reason", e.target.value)}
                    onBlur={() => setFieldTouched("reason", true, false)}
                    status={showErr("reason") ? "danger" : "default"}
                    caption={showErr("reason")}
                  />
                )}
              </SectionCard>
            </div>

            {isBooking && (
              <section className="min-w-0 flex-[640] overflow-hidden rounded-xl border border-default bg-surface">
                <header className="flex h-16 items-center px-5">
                  <h2 className="text-base font-semibold text-default">Assets to Withdraw</h2>
                </header>
                <div className="flex items-center gap-2 px-5 pb-5">
                  <span className="text-xl font-semibold text-default">{totalAssets}</span>
                  <span className="text-sm text-default">Total Assets</span>
                </div>
                <TableCustom
                  columns={previewColumns}
                  data={preview}
                  autoScrollTable={true}
                  classTheadTh="px-5"
                  classTBodyTd="px-5"
                  emptyIcon={<Icon name="box" size={24} className="text-placeholder" />}
                  emptyTitle={<span className="text-body">No assets to withdraw yet</span>}
                  emptySubtitle={<span className="text-placeholder">Select courseware on the left. The assets they need will be listed here.</span>}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}

export function CreateAssignmentView(props: CreateAssignmentViewProps) {
  const { entry, issueBase, anchorBookingId, onNavigate } = props;
  const initial: FormValues = useMemo(() => {
    const anchor = bookings.find((b) => b.id === anchorBookingId);
    const names = anchor?.courseware.split(",").map((c) => c.trim()).filter(Boolean) ?? [];
    return {
      operator: "",
      personnelOperator: "",
      assignmentType: entry === "assignment-list" ? "" : "Booking",
      reason: "",
      baseStation: "",
      // A booking with 1 courseware arrives locked and ticked (Figma 6966:238435); otherwise nothing is ticked.
      coursewareKeys: entry === "booking-details" && anchor && names.length === 1 ? [`${anchor.id}::0`] : [],
    };
  }, [entry, anchorBookingId]);

  const onSubmit = (v: FormValues) => {
    const back = `${window.location.pathname}${window.location.search}`;
    if (v.assignmentType === "Booking") {
      const ids = Array.from(new Set(v.coursewareKeys.map((k) => k.split("::")[0])));
      const first = bookings.find((b) => b.id === ids[0]);
      const firstKey = v.coursewareKeys.find((k) => k.startsWith(`${ids[0]}::`));
      const firstName = first && firstKey ? first.courseware.split(",").map((c) => c.trim()).filter(Boolean)[Number(firstKey.split("::")[1])] : "";
      const q = new URLSearchParams({
        baseStation: first?.assignedStations?.[0] ?? "",
        bookingIds: ids.join(","),
        courseware: firstName ?? "",
        cw: v.coursewareKeys.join(","),
        returnTo: back,
      });
      onNavigate?.(`${issueBase}?${q.toString()}`);
    } else {
      const q = new URLSearchParams({ type: v.assignmentType, reason: v.reason.trim(), returnTo: back });
      if (HIDDEN_FEATURES.adminBaseStationDropdown && v.baseStation) q.set("baseStation", v.baseStation);
      onNavigate?.(`${issueBase}?${q.toString()}`);
    }
  };

  return (
    <Formik initialValues={initial} validationSchema={schema} onSubmit={onSubmit} validateOnBlur={false} enableReinitialize>
      <Inner {...props} />
    </Formik>
  );
}
