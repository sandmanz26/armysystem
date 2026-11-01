// Booking 2.0 Onboarding — Step 1: Confirm Attendance (Nominal Roll), per the
// reference screenshots. Reuses the SAME roll structure/rule as booking-time
// Nominal Roll (Sec. 3.4.2/8.3) — Flat Screen/C-Shaped tabs, Role (Collective
// only)/Weapon Type(s) inline-assign — plus the new Registration/Attendance
// columns and All/Present/Absent filter pills specific to Onboarding.
import { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { Alert } from "@/components/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS } from "@/pages-tsx/booking/create/constants";
import { InlineSingleAssign, InlineMultiAssign } from "@/pages-tsx/booking-2/create/components/InlineAssign";
import { ImportNominalRollModal } from "@/pages-tsx/booking-2/create/modals/ImportNominalRollModal";
import { fromBookingTrainee, formattedToday, isComplete, type OnboardingTrainee } from "../types";
import { ScanIdModal } from "../modals/ScanIdModal";
import { ConfirmAttendanceSummaryModal } from "../modals/ConfirmAttendanceSummaryModal";
import { EditTraineeDrawer } from "../modals/EditTraineeDrawer";
import { CompleteTraineeDetailsModal } from "../modals/CompleteTraineeDetailsModal";
import { LeaveIncompleteDialog } from "../modals/LeaveIncompleteDialog";

const PER_PAGE = 10;
const columnHelper = createColumnHelper<OnboardingTrainee>();

interface ConfirmAttendanceStepProps {
  trainingMode: string;
  bookingWeapons: string[];
  bookingRoles: string[];
  courseware: string;
  unitName?: string;
  hasCShaped: boolean;
  numBase: number;
  numCShaped: number;
  initialRoll: Record<string, import("@/pages-tsx/booking-2/create/nominalRollTypes").Trainee[]>;
  onRollsChange?: (rolls: { flat: OnboardingTrainee[]; cshaped: OnboardingTrainee[] }) => void;
  onConfirmed?: () => void;
  /** F-009 (O-4): passed through to Scan ID (`?scanner=inactive` on the onboarding URL). */
  scannerInactive?: boolean;
}

export interface ConfirmAttendanceStepHandle {
  requestConfirm: () => void;
}

export const ConfirmAttendanceStep = forwardRef<ConfirmAttendanceStepHandle, ConfirmAttendanceStepProps>(function ConfirmAttendanceStep({ trainingMode, bookingWeapons, bookingRoles, courseware, unitName, hasCShaped, numBase, numCShaped, initialRoll, onRollsChange, onConfirmed, scannerInactive }, ref) {
  const isCollective = trainingMode === "Collective";
  const weaponOptions = bookingWeapons.length > 0
    ? bookingWeapons
    : isCollective ? COLLECTIVE_WEAPONS : trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const roleOptions = bookingRoles.length > 0 ? bookingRoles : COLLECTIVE_TEAM_OPTIONS;

  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");
  // F-009 (O-6): Figma `Nominal Roll - List Default` (5348:24188 / 5411:34446) shows the
  // registered trainees arriving from the booking-time roll WITH their Role (Collective) and
  // Weapon Type(s) already assigned. The mock roll (`generateTrainees`) has them blank, which
  // would trip the new "missing assignments" check on every booking — so an empty value is
  // seeded here from the booking's own options. Values already present are kept.
  const seedAssignments = (t: OnboardingTrainee, i: number): OnboardingTrainee => ({
    ...t,
    role: t.role || (isCollective && roleOptions.length ? roleOptions[i % roleOptions.length] : t.role),
    weapon: t.weapon.length || !weaponOptions.length ? t.weapon : [weaponOptions[i % weaponOptions.length]],
  });
  const [rolls, setRolls] = useState<Record<string, OnboardingTrainee[]>>(() => ({
    flat: (initialRoll[`${courseware}::flat`] ?? []).map((t, i) => seedAssignments(fromBookingTrainee(t, "flat"), i)),
    cshaped: (initialRoll[`${courseware}::cshaped`] ?? []).map((t, i) => seedAssignments(fromBookingTrainee(t, "cshaped"), i + 3)),
  }));
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showConfirmSummary, setShowConfirmSummary] = useState(false);
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; trainee?: OnboardingTrainee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  // F-009 (O-5): walk-ins left incomplete at an FS & CS booking — out of both rolls until
  // completed (Figma 5622:159529 / 5626:196900 / 5626:198154).
  const [pending, setPending] = useState<OnboardingTrainee[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [pendingError, setPendingError] = useState(false);
  const [pendingFill, setPendingFill] = useState<OnboardingTrainee | null>(null);
  const [showPendingLeave, setShowPendingLeave] = useState(false);
  const [showPendingConfirm, setShowPendingConfirm] = useState(false);
  // F-009 (O-6): Figma `Confirm Attendance - Error` (5348:24232) — set by a Confirm Attendance
  // click while a trainee is missing Role (Collective) / Weapon Type(s).
  const [showErrors, setShowErrors] = useState(false);

  const isMissingAssignment = (t: OnboardingTrainee) => (isCollective && !t.role) || t.weapon.length === 0;
  const missingAssignments = [...(rolls.flat ?? []), ...(rolls.cshaped ?? [])].filter(isMissingAssignment);
  const pendingIncomplete = pending.filter((t) => !isComplete(t, hasCShaped));

  useImperativeHandle(ref, () => ({
    requestConfirm: () => {
      if (pending.length > 0) setShowPendingConfirm(true);
      else if (missingAssignments.length > 0) setShowErrors(true);
      else setShowConfirmSummary(true);
    },
  }));

  // "Review issue": jump to the first trainee with a missing assignment (its tab, All filter, its page).
  const reviewIssue = () => {
    const type = (rolls.flat ?? []).some(isMissingAssignment) ? "flat" : "cshaped";
    const idx = (rolls[type] ?? []).findIndex(isMissingAssignment);
    setStationType(type);
    setFilter("all");
    setSearch("");
    setPage(Math.floor(Math.max(0, idx) / PER_PAGE) + 1);
  };

  // Move completed pending walk-ins into the roll their Base Station Type names.
  const placeCompletedPending = () => {
    const done = pending.filter((t) => isComplete(t, hasCShaped));
    if (!done.length) return;
    setRolls((prev) => ({
      ...prev,
      flat: [...(prev.flat ?? []), ...done.filter((t) => t.stationType !== "cshaped")],
      cshaped: [...(prev.cshaped ?? []), ...done.filter((t) => t.stationType === "cshaped")],
    }));
    setPending((prev) => prev.filter((t) => !done.includes(t)));
  };

  useEffect(() => {
    onRollsChange?.({ flat: rolls.flat ?? [], cshaped: rolls.cshaped ?? [] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolls]);

  const roll = rolls[stationType] ?? [];

  const filtered = useMemo(() => {
    let list = roll;
    if (filter === "present") list = list.filter((t) => t.attendance === "Present");
    if (filter === "absent") list = list.filter((t) => t.attendance === "Absent");
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.svcId.toLowerCase().includes(q));
    }
    return list;
  }, [roll, filter, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const presentCount = roll.filter((t) => t.attendance === "Present").length;
  const absentCount = roll.filter((t) => t.attendance === "Absent").length;

  const updateRoll = (updater: (list: OnboardingTrainee[]) => OnboardingTrainee[]) => {
    setRolls((prev) => ({ ...prev, [stationType]: updater(prev[stationType] ?? []) }));
  };

  const updateTrainee = (id: string, patch: Partial<OnboardingTrainee>) => {
    updateRoll((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const handleScanFinish = (flat: OnboardingTrainee[], cshaped: OnboardingTrainee[], left: OnboardingTrainee[] = []) => {
    setRolls({ flat, cshaped });
    if (left.length) setPending((prev) => [...prev, ...left]);
    setShowScan(false);
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      header: () => (
        <Checkbox size={16} checked={paginated.length > 0 && paginated.every((t) => selected.has(t.id))} onChange={() => {
          const visibleIds = paginated.map((t) => t.id);
          const allOn = visibleIds.every((id) => selected.has(id));
          setSelected((prev) => {
            const next = new Set(prev);
            visibleIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
            return next;
          });
        }} />
      ),
      cell: (info: any) => {
        const t = info.row.original;
        return (
          <Checkbox size={16} checked={selected.has(t.id)} onChange={() => setSelected((prev) => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} />
        );
      },
    } as any),
    columnHelper.display({ id: "no", width: 56, minWidth: 56, maxWidth: 56, header: () => "No", cell: (info: any) => <span className="text-sm text-figma-body">{(page - 1) * PER_PAGE + info.row.index + 1}</span> } as any),
    columnHelper.accessor("rank", { width: 80, minWidth: 80, maxWidth: 80, header: () => "Rank", cell: (info: any) => <span className="text-sm text-figma-default">{info.getValue() || "—"}</span> } as any),
    columnHelper.accessor("name", { width: 200, minWidth: 200, maxWidth: 200, header: () => "Name", cell: (info: any) => <span className="text-sm font-semibold text-figma-default">{info.getValue()}</span> } as any),
    columnHelper.accessor("svcId", { width: 120, minWidth: 120, maxWidth: 120, header: () => "Service ID", cell: (info: any) => <span className="text-sm text-figma-default font-mono">{info.getValue()}</span> } as any),
    columnHelper.accessor("platoon", { width: 160, minWidth: 160, maxWidth: 160, header: () => "Platoon Number", cell: (info: any) => <span className="text-sm text-figma-default">{info.getValue() || "—"}</span> } as any),
    ...(isCollective ? [
      columnHelper.display({
        id: "role",
        width: 200,
        minWidth: 200,
        maxWidth: 200,
        header: () => "Role",
        cell: (info: any) => <InlineSingleAssign value={info.row.original.role} onChange={(v) => updateTrainee(info.row.original.id, { role: v })} options={roleOptions} error={showErrors} />,
      } as any),
    ] : []),
    columnHelper.display({
      id: "weapon",
      width: 200,
      minWidth: 200,
      maxWidth: 200,
      header: () => "Weapon Type(s)",
      cell: (info: any) => <InlineMultiAssign value={info.row.original.weapon} onChange={(v) => updateTrainee(info.row.original.id, { weapon: v })} options={weaponOptions} error={showErrors} />,
    } as any),
    columnHelper.display({
      id: "registration",
      width: 160,
      minWidth: 160,
      maxWidth: 160,
      header: () => "Registration",
      cell: (info: any) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full border text-xs font-semibold",
          info.row.original.registration === "Registered"
            ? "bg-figma-muted border-figma-subtle text-figma-default"
            : "bg-figma-infobg border-figma-infoborder text-figma-info"
        )}>
          {info.row.original.registration}
        </span>
      ),
    } as any),
    columnHelper.display({
      id: "attendance",
      width: 128,
      minWidth: 128,
      maxWidth: 128,
      header: () => "Attendance",
      cell: (info: any) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full border text-xs font-semibold",
          info.row.original.attendance === "Present"
            ? "bg-figma-successbg border-figma-successborder text-figma-success"
            : "bg-figma-dangerbg border-figma-dangersoft2 text-figma-danger"
        )}>
          {info.row.original.attendance}
        </span>
      ),
    } as any),
    columnHelper.display({
      id: "lastUpdatedOn",
      width: 160,
      minWidth: 160,
      maxWidth: 160,
      header: () => "Last Updated On",
      cell: (info: any) => <span className="text-sm text-figma-default">{info.row.original.lastUpdatedOn}</span>,
    } as any),
    columnHelper.display({
      id: "actions",
      width: 104,
      minWidth: 104,
      maxWidth: 104,
      header: () => "Actions",
      cell: (info: any) => {
        const t = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDrawer({ mode: "edit", trainee: t })} className="p-1.5 rounded-md text-figma-disabled hover:text-figma-primary hover:bg-figma-primarysoft"><Icon name="pencil" size={13} /></button>
            <button type="button" onClick={() => setDeleteTarget(t.id)} className="p-1.5 rounded-md text-figma-disabled hover:text-figma-danger hover:bg-figma-dangerbg"><Icon name="trash-2" size={13} /></button>
          </div>
        );
      },
    } as any),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [paginated, selected, page, isCollective, roleOptions, weaponOptions, showErrors]);

  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      {/* Figma (5348:24188): Main Content is just the page's own 24px padding
          (the p-6 on the wrapper above) — content fills the rest of the width.
          `max-w-7xl mx-auto` doesn't exist there; on any screen wider than
          1280+48px (i.e. almost every real monitor) it centered the whole
          page inside two growing empty gutters instead. */}
      <div className="space-y-4">
        {/* Figma `Confirm Attendance - Error` (5348:24232): danger Alert above the page header. */}
        {showErrors && missingAssignments.length > 0 && (
          <Alert
            status="danger"
            className="mb-6"
            message={
              <>
                {missingAssignments.length} {missingAssignments.length === 1 ? "trainee has" : "trainees have"} missing assignments.{" "}
                <button type="button" onClick={reviewIssue} className="text-link">Review issue</button>
              </>
            }
          />
        )}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-figma-default">Confirm Attendance for the Training</h2>
            <p className="text-sm text-figma-body mt-0.5">Please check the attendance of the trainees by scanning or uploading final nominal roll list.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              <Icon name="file-up" size={14} /> Import List
            </button>
            {/* Figma confirms "Add Trainee" is the outlined button and "Scan ID"
                is the filled/primary one — swapped from the earlier build. */}
            <button type="button" onClick={() => setDrawer({ mode: "add" })} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              <Icon name="plus" size={14} /> Add Trainee
            </button>
            {/* Figma `Nominal Roll - Filled with Incomplete Trainees` (5626:196900): outlined primary
                button + red count badge, only while walk-ins are waiting for their details. */}
            {pending.length > 0 && (
              <button type="button" onClick={() => { setPendingError(false); setShowPending(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-figma-primary border border-figma-primary rounded-lg hover:bg-figma-primarysoft bg-white">
                Incomplete Trainee
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-danger-default border border-white text-xs font-semibold text-white flex items-center justify-center">{pending.length}</span>
              </button>
            )}
            <button type="button" onClick={() => setShowScan(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
              <Icon name="scan-line" size={14} /> Scan ID
            </button>
          </div>
        </div>

        <div className="bg-white border border-figma-subtle rounded-xl overflow-hidden">
          {/* Figma (5348:24188) draws the Flat Screen/C-Shaped switch as underline
              tabs INSIDE this card, above the Nominal Roll List header — not as
              standalone pill buttons floating above it. */}
          {/* Dev feedback #11: the tabs are always drawn; C-Shaped is disabled when the booking has none. */}
          <div className="flex items-center gap-1 px-5 border-b border-figma-subtle">
            {(["flat", "cshaped"] as const).map((t) => {
              const disabled = t === "cshaped" && !hasCShaped;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => { setStationType(t); setPage(1); setSelected(new Set()); }}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    stationType === t
                      ? "border-figma-primary text-figma-primary font-semibold"
                      : "border-transparent text-figma-body hover:text-figma-default",
                    disabled && "cursor-not-allowed text-figma-disabled hover:text-figma-disabled"
                  )}
                >
                  {t === "flat" ? "Flat Screen" : "C-Shaped"}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-base font-bold text-figma-default">Nominal Roll List</h3>
            <div className="relative">
              <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-figma-disabled" />
              <InputCustom
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 text-sm border border-figma-subtle rounded-lg w-52 placeholder:text-figma-placeholder focus:outline-none focus:ring-2 focus:ring-figma-primary/30 focus:border-figma-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3">
            {[
              { id: "all" as const, label: "All Trainees", count: roll.length },
              { id: "present" as const, label: "Present Trainees", count: presentCount },
              { id: "absent" as const, label: "Absent Trainees", count: absentCount },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setFilter(f.id); setPage(1); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors",
                  filter === f.id ? "border-figma-primary text-figma-primary bg-figma-primarysoft" : "border-figma-subtle text-figma-body bg-figma-muted hover:bg-figma-soft"
                )}
              >
                {f.label}
                <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-bold", filter === f.id ? "bg-figma-primary text-white" : "bg-figma-disabled text-white")}>{f.count}</span>
              </button>
            ))}
          </div>

          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={true}
            getRowClass={(t: OnboardingTrainee) => (showErrors && isMissingAssignment(t) ? "[&>td:first-child]:shadow-[inset_4px_0_0_rgb(var(--color-text-danger))]" : "")}
            classThead="bg-figma-dangersoft/70"
            classTheadTh="text-figma-primary text-xs font-semibold"
            className="[&_table]:w-auto"
          />
          <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
        </div>
      </div>

      {showImport && (
        <ImportNominalRollModal
          coursewareList={[courseware]}
          hasCShaped={() => false}
          onClose={() => setShowImport(false)}
          onImport={() => setShowImport(false)}
        />
      )}

      {showScan && (
        <ScanIdModal
          flatRoll={rolls.flat ?? []}
          cshapedRoll={rolls.cshaped ?? []}
          hasCShaped={hasCShaped}
          numBase={numBase}
          numCShaped={numCShaped}
          unitName={unitName || "Unit"}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          scannerInactive={scannerInactive}
          onClose={() => setShowScan(false)}
          onFinish={handleScanFinish}
        />
      )}

      {showConfirmSummary && (
        <ConfirmAttendanceSummaryModal
          roll={[...(rolls.flat ?? []), ...(rolls.cshaped ?? [])]}
          onCancel={() => setShowConfirmSummary(false)}
          onConfirm={() => { setShowConfirmSummary(false); onConfirmed?.(); }}
        />
      )}

      {drawer && (
        <EditTraineeDrawer
          mode={drawer.mode}
          initial={drawer.trainee}
          unitName={unitName || "Unit"}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          hasCShaped={hasCShaped}
          onClose={() => setDrawer(null)}
          onSubmit={(values) => {
            if (drawer.mode === "edit" && drawer.trainee) {
              updateTrainee(drawer.trainee.id, values);
            } else {
              const destStationType = values.stationType ?? "flat";
              setRolls((prev) => ({
                ...prev,
                [destStationType]: [...(prev[destStationType] ?? []), {
                  id: `manual-${Date.now()}`, ...values,
                  registration: "Non-Registered", attendance: "Present", lastUpdatedOn: formattedToday(), baseStation: "", lane: "",
                }],
              }));
            }
            setDrawer(null);
          }}
        />
      )}

      {/* F-009 (O-5): Figma `Confirmation - Confirm Attendance with Incomplete Trainees` (5626:198154). */}
      <ConfirmDialog
        open={showPendingConfirm}
        tone="warning"
        title="Nominal roll has incomplete trainees"
        subtitle={<><strong className="font-bold">{pending.length} non-registered trainees</strong> are missing required details and won&apos;t appear in the Nominal Roll List. Complete their details before confirming attendance.</>}
        confirmLabel="Review Incomplete Trainees"
        onCancel={() => setShowPendingConfirm(false)}
        onConfirm={() => { setShowPendingConfirm(false); setPendingError(false); setShowPending(true); }}
      />

      {showPending && (
        <CompleteTraineeDetailsModal
          trainees={pendingIncomplete}
          showError={pendingError}
          onCompleteDetails={setPendingFill}
          onClose={() => (pendingIncomplete.length > 0 ? setShowPendingLeave(true) : (placeCompletedPending(), setShowPending(false)))}
          onConfirm={() => {
            if (pendingIncomplete.length > 0) { setPendingError(true); return; }
            placeCompletedPending();
            setShowPending(false);
          }}
        />
      )}

      {pendingFill && (
        <EditTraineeDrawer
          mode="edit"
          initial={pendingFill}
          unitName={unitName || "Unit"}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          hasCShaped={hasCShaped}
          onClose={() => setPendingFill(null)}
          onSubmit={(values) => {
            setPending((prev) => prev.map((t) => (t.id === pendingFill.id ? { ...t, ...values } : t)));
            setPendingFill(null);
          }}
        />
      )}

      <LeaveIncompleteDialog
        open={showPendingLeave}
        count={pendingIncomplete.length}
        hasCShaped={hasCShaped}
        onContinue={() => setShowPendingLeave(false)}
        onLeave={() => { setShowPendingLeave(false); setShowPending(false); placeCompletedPending(); }}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[2000] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-5">Delete this trainee? This can't be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white">Cancel</button>
              <button
                type="button"
                onClick={() => { updateRoll((list) => list.filter((t) => t.id !== deleteTarget)); setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget); return n; }); setDeleteTarget(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
