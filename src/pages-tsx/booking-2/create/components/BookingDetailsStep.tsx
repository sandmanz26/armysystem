// Booking 2.0 — Step 1: Booking Details.
//
// Same field set and validation rules as the current WPT Create Booking's
// BookingDetailsStep (Training Type, Unit Name, FTMS ID, Training Mode,
// Courseware, Weapon Type(s), Role(s) for Collective, Dry Run, Station
// Configuration, Contact Information), plus a new Briefing Room checkbox
// (handled in the Schedule step in the old flow — surfaced here per the new
// design). Built as a new, simpler-styled file rather than reusing the old
// BookingDetailsStep verbatim, since the visual widgets differ (plain
// dropdowns/checkboxes here vs. chip multi-selects there); constants/types
// are imported read-only from the existing booking/create module so the
// option lists (coursewares, weapons, roles) stay identical.
import { useState, useEffect, useRef } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { InputCustom, PhoneInputSelector } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import {
  COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, WEAPON_OPTIONS,
  COLLECTIVE_ROLES, COURSEWARE_BY_MODE, TRAINING_MODES_BY_TYPE,
} from "@/pages-tsx/booking/create/constants";
import type { TrainingType } from "@/pages-tsx/booking/create/types";
import type { Booking2DetailsSnapshot } from "../types";

// ── Chip multi-select dropdown — selected items render as individually
// removable pills inside the field itself (not a comma-joined summary
// string), matching the reference design. Local to this file; not shared. ──
function PlainMultiSelect({ selected, onChange, options, placeholder, invalid, label, required }: {
  invalid?: boolean;
  /** Field label — rendered on the left of a header row whose right side shows "N selected | Clear All"
   *  (Figma Courseware / Weapon Type, 5029:69269). Omit to render the bare field. */
  label?: string;
  required?: boolean;
  selected: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== opt));
  };

  return (
    <div ref={ref} className="relative">
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-figma-default">{label} {required && <span className="text-figma-danger">*</span>}</label>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 text-xs leading-4">
              <span className="text-figma-body">{selected.length} selected</span>
              <span className="h-3 w-px bg-figma-subtle" aria-hidden />
              <button type="button" onClick={() => onChange([])} className="font-semibold text-figma-primary hover:text-figma-primaryhover">
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          // Chips stay on ONE line (Figma): overflow scrolls sideways instead of wrapping.
          "w-full min-h-[44px] flex items-center flex-nowrap gap-2 px-3 py-2 border rounded-lg bg-white transition-colors cursor-pointer",
          invalid ? "border-figma-danger" : open ? "border-figma-primary" : "border-figma-subtle hover:border-figma-strong"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {selected.length === 0 && <span className="text-sm text-figma-placeholder">{placeholder}</span>}
          {selected.map((opt) => (
            <span
              key={opt}
              className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap pl-2.5 pr-2 py-1 rounded-lg border border-figma-subtle bg-white text-xs leading-4 text-figma-default"
            >
              {opt}
              <button type="button" onClick={(e) => remove(opt, e)} className="text-figma-disabled hover:text-figma-caption" aria-label={`Remove ${opt}`}>
                <Icon name="x" size={13} />
              </button>
            </span>
          ))}
        </div>
        <Icon name="chevron-down" size={14} className="text-figma-disabled flex-shrink-0 ml-auto" />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-figma-subtle rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-figma-default hover:bg-figma-soft"
            >
              <Checkbox size={16} checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              <span className="flex-1 text-left">{opt}</span>
              {selected.includes(opt) && <Icon name="check" size={14} className="text-figma-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Plain single-select dropdown (Courseware for Individual) ─────────────────
function PlainSingleSelect({ value, onChange, options, placeholder, invalid }: {
  invalid?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white transition-colors",
          invalid ? "border-figma-danger" : open ? "border-figma-primary" : "border-figma-subtle hover:border-figma-strong",
          value ? "text-figma-default" : "text-figma-placeholder"
        )}
      >
        <span>{value || placeholder}</span>
        <Icon name="chevron-down" size={14} className="text-figma-disabled" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-figma-subtle rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-figma-default hover:bg-figma-soft"
            >
              <span>{opt}</span>
              {value === opt && <Icon name="check" size={14} className="text-figma-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Figma `Input - Stepper` (Station Configuration table, node 5029:69307): minus
// button | value | plus button, 120x40, `border/invert/default`, `background/surface`.
function StationStepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex h-10 w-[120px] items-stretch overflow-hidden rounded-lg border border-figma-subtle bg-white">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex w-10 items-center justify-center text-figma-default hover:bg-figma-soft transition-colors"
      >
        <Icon name="minus" size={18} />
      </button>
      <span className="flex flex-1 items-center justify-center text-sm text-figma-default">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="flex w-10 items-center justify-center text-figma-default hover:bg-figma-soft transition-colors"
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}

const RANK_OPTIONS = ["PTE", "LCP", "CPL", "CFC", "3SG", "2SG", "1SG", "CPT", "MAJ", "LTA", "LTC", "COL"];

/** Instructor is stored as one string ("CPT Daren Ong") — split it back for the rank + name inputs. */
const splitInstructor = (full: string): { rank: string; name: string } => {
  const [first, ...rest] = full.trim().split(/\s+/);
  return RANK_OPTIONS.includes(first) ? { rank: first, name: rest.join(" ") } : { rank: "", name: full };
};

// Figma Contact Information → Instructor (5029:69269): one bordered box — rank dropdown (e.g. "CPT ∨")
// | divider | name input.
function InstructorField({ rank, name, onRank, onName, invalid }: {
  rank: string; name: string;
  onRank: (v: string) => void; onName: (v: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-stretch rounded-lg border bg-white transition-colors focus-within:border-figma-primary focus-within:ring-1 focus-within:ring-figma-primary",
        invalid ? "border-figma-danger" : "border-figma-subtle"
      )}
    >
      <button
        type="button"
        aria-label="Instructor rank"
        onClick={() => setOpen((o) => !o)}
        className="flex w-[84px] flex-shrink-0 items-center justify-between gap-1 rounded-l-lg border-r border-figma-subtle px-3 py-2.5 text-sm hover:bg-figma-soft"
      >
        <span className={rank ? "text-figma-default" : "text-figma-disabled"}>{rank || "Rank"}</span>
        <Icon name="chevron-down" size={14} className="text-figma-disabled" />
      </button>
      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Enter instructor name"
        className="min-w-0 flex-1 rounded-r-lg bg-transparent px-3 py-2.5 text-sm text-figma-default placeholder:text-figma-disabled focus:outline-none"
      />
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-[120px] overflow-y-auto rounded-lg border border-figma-subtle bg-white py-1 shadow-lg">
          {RANK_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { onRank(r); setOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-figma-default hover:bg-figma-soft"
            >
              {r}
              {rank === r && <Icon name="check" size={14} className="text-figma-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BRIEFING_ROOM_OPTIONS = ["Briefing Room 1", "Briefing Room 2", "Briefing Room 3"];

interface FormValues {
  trainingType: string;
  unitName: string;
  ftmsId: string;
  dryRun: boolean;
  briefingRoom: boolean;
  briefingRoomName: string;
  unitContact: string;
  instructor: string;
  /** Rank half of the Instructor field; combined with `instructor` (the name) in the snapshot. */
  instructorRank: string;
  /** Mirrors of the non-Formik pickers (state kept below / in the parent), synced in so the
   *  Yup schema can validate them — C-4, Figma 5029:69269 / 5313:12370. */
  trainingMode: string;
  courseware: string[];
  weapons: string[];
  roles: string[];
}

const validationSchema = Yup.object().shape({
  trainingType: Yup.string().required("Training Type is required"),
  unitName: Yup.string().required("Unit Name is required"),
  ftmsId: Yup.string().required("FTMS ID is required"),
  trainingMode: Yup.string().when("trainingType", {
    is: (t: string) => t !== "Individual",
    then: (schema) => schema.required("Training Mode is required"),
  }),
  courseware: Yup.array().of(Yup.string()).min(1, "Courseware is required"),
  weapons: Yup.array().of(Yup.string()).min(1, "Weapon Type is required"),
  roles: Yup.array().of(Yup.string()).when("trainingMode", {
    is: "Collective",
    then: (schema) => schema.min(1, "Role is required"),
  }),
  unitContact: Yup.string().required("Unit Contact Details is required"),
  instructor: Yup.string().required("Instructor Name is required"),
  briefingRoomName: Yup.string().when("briefingRoom", {
    is: true,
    then: (schema) => schema.required("Briefing Room is required"),
  }),
});

function FormObserver({ trainingMode, courseware, weapons, roles, baseQty, cShapedQty, perCoursewareCounts, onUpdate }: {
  trainingMode: string;
  courseware: string[];
  weapons: string[];
  roles: string[];
  baseQty: string;
  cShapedQty: string;
  perCoursewareCounts: Record<string, { base: number; cshaped: number }>;
  onUpdate: (data: Booking2DetailsSnapshot) => void;
}) {
  const { values } = useFormikContext<FormValues>();

  useEffect(() => {
    const isMultiCourseware = courseware.length > 1;
    let effectiveBaseQty = baseQty;
    let effectiveCShapedQty = cShapedQty;
    if (isMultiCourseware && Object.keys(perCoursewareCounts).length > 0) {
      const counts = Object.values(perCoursewareCounts);
      effectiveBaseQty = String(Math.max(...counts.map((c) => c.base), 0));
      effectiveCShapedQty = String(Math.max(...counts.map((c) => c.cshaped), 0));
    }
    onUpdate({
      weapons,
      weaponSummary: weapons.join(", "),
      baseQty: effectiveBaseQty,
      cShapedQty: effectiveCShapedQty,
      courseware: courseware.join(", "),
      trainingType: values.trainingType,
      roles,
      unitContact: values.unitContact,
      instructor: values.instructor.trim() ? [values.instructorRank, values.instructor.trim()].filter(Boolean).join(" ") : "",
      ftmsId: values.ftmsId,
      unitName: values.unitName,
      stationCountsByCourseware: perCoursewareCounts,
      briefingRoomName: values.briefingRoom ? values.briefingRoomName : undefined,
      dryRun: values.dryRun,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, trainingMode, courseware, weapons, roles, baseQty, cShapedQty, perCoursewareCounts]);

  return null;
}

// Copies the picker state into Formik (so Yup sees it) and registers the parent's Next handler:
// submitForm() marks every field submitted (errors show), then resolves whether the form is valid.
function FormValidationBridge({ trainingMode, courseware, weapons, roles, validateRef }: {
  trainingMode: string;
  courseware: string[];
  weapons: string[];
  roles: string[];
  validateRef?: React.MutableRefObject<(() => Promise<boolean>) | null>;
}) {
  const { setValues, submitForm, validateForm, submitCount } = useFormikContext<FormValues>();

  useEffect(() => {
    setValues((v) => ({ ...v, trainingMode, courseware, weapons, roles }), submitCount > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingMode, courseware, weapons, roles]);

  useEffect(() => {
    if (!validateRef) return;
    validateRef.current = async () => {
      await submitForm();
      const errors = await validateForm();
      return Object.keys(errors).length === 0;
    };
    return () => { validateRef.current = null; };
  }, [validateRef, submitForm, validateForm]);

  return null;
}

const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function BookingDetailsStep({ trainingMode, onModeChange, onUpdate, initial, validateRef }: {
  trainingMode: string;
  onModeChange: (m: string) => void;
  onUpdate: (data: Booking2DetailsSnapshot) => void;
  /** Last snapshot sent up — restores the form when the user comes Back to Step 1. */
  initial?: Booking2DetailsSnapshot;
  /** Filled with a "submit + is valid?" function the wizard's Next button awaits. */
  validateRef?: React.MutableRefObject<(() => Promise<boolean>) | null>;
}) {
  const [courseware, setCourseware] = useState<string[]>(() => splitList(initial?.courseware ?? ""));
  const [weapons, setWeapons] = useState<string[]>(() => initial?.weapons ?? []);
  const [roles, setRoles] = useState<string[]>(() => initial?.roles ?? []);
  const [baseQty, setBaseQty] = useState(() => initial?.baseQty ?? "1");
  const [cShapedQty, setCShapedQty] = useState(() => initial?.cShapedQty ?? "0");
  const [perCoursewareCounts, setPerCoursewareCounts] = useState<Record<string, { base: number; cshaped: number }>>(() => initial?.stationCountsByCourseware ?? {});

  const isCollective = trainingMode === "Collective";
  const isJudgemental = trainingMode === "Judgemental";

  return (
    <Formik<FormValues>
      initialValues={{
        trainingType: initial?.trainingType ?? "",
        unitName: initial?.unitName ?? "",
        ftmsId: initial?.ftmsId ?? "",
        dryRun: initial?.dryRun ?? false,
        briefingRoom: !!initial?.briefingRoomName,
        briefingRoomName: initial?.briefingRoomName ?? "",
        unitContact: initial?.unitContact ?? "",
        instructor: splitInstructor(initial?.instructor ?? "").name,
        instructorRank: splitInstructor(initial?.instructor ?? "").rank,
        trainingMode,
        courseware: splitList(initial?.courseware ?? ""),
        weapons: initial?.weapons ?? [],
        roles: initial?.roles ?? [],
      }}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue, errors, submitCount }) => {
        // Errors appear once Next has been pressed (Figma "… - Error" frames), then clear live.
        const err = (k: keyof FormValues) => (submitCount > 0 ? (errors[k] as string | undefined) : undefined);
        const caption = (k: keyof FormValues) => err(k) && <p className="mt-1 text-xs text-figma-danger">{err(k)}</p>;
        const inputBorder = (k: keyof FormValues) => (err(k) ? "border-figma-danger" : "border-figma-subtle");
        const isIndividual = values.trainingType === "Individual";
        const availableModes = values.trainingType ? (TRAINING_MODES_BY_TYPE[values.trainingType] ?? []) : [];
        const effectiveMode = trainingMode || (isIndividual ? "Marksmanship" : "");
        const coursewareOptions = COURSEWARE_BY_MODE[effectiveMode] ?? [];
        const weaponOptions =
          isCollective ? COLLECTIVE_WEAPONS
          : isJudgemental ? JUDGEMENTAL_WEAPONS
          : WEAPON_OPTIONS.map((w) => w.label);
        const showCShaped = isCollective || isJudgemental || trainingMode === "Marksmanship";
        const isMultiCourseware = courseware.length > 1;

        const handleTrainingTypeChange = (type: string) => {
          setFieldValue("trainingType", type);
          setCourseware([]);
          setPerCoursewareCounts({});
          onModeChange(type === "Individual" ? "Marksmanship" : "");
          setWeapons([]);
          setRoles([]);
          if (type === "Individual") setBaseQty("1");
        };

        const handleModeChange = (mode: string) => {
          onModeChange(mode);
          setCourseware([]);
          setPerCoursewareCounts({});
          setWeapons([]);
          setRoles([]);
        };

        const handleCoursewareChange = (list: string[]) => {
          setCourseware(list);
          setPerCoursewareCounts((prev) => {
            const next: Record<string, { base: number; cshaped: number }> = {};
            list.forEach((cw) => { next[cw] = prev[cw] ?? { base: 1, cshaped: 0 }; });
            return next;
          });
        };

        return (
          <Form className="flex-1 overflow-auto bg-figma-soft py-8 px-6">
            <FormObserver
              trainingMode={trainingMode}
              courseware={courseware}
              weapons={weapons}
              roles={roles}
              baseQty={baseQty}
              cShapedQty={cShapedQty}
              perCoursewareCounts={perCoursewareCounts}
              onUpdate={onUpdate}
            />
            <FormValidationBridge trainingMode={trainingMode} courseware={courseware} weapons={weapons} roles={roles} validateRef={validateRef} />
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white border border-figma-subtle rounded-xl p-6 space-y-5">
                <h2 className="text-base font-bold text-figma-default">Training Details</h2>

                <div>
                  <label className="block text-sm font-medium text-figma-default mb-2">Training Type <span className="text-figma-danger">*</span></label>
                  <div className="flex gap-3">
                    {(["Group", "Individual"] as TrainingType[]).map((type) => (
                      <button key={type!} type="button" onClick={() => handleTrainingTypeChange(type!)}
                        className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                          values.trainingType === type ? "border-figma-primary text-figma-primary bg-figma-primarysoft ring-1 ring-figma-primary" : "border-figma-line text-figma-default hover:border-gray-500")}>
                        {values.trainingType === type && <Icon name="check" size={16} />}
                        {type}
                      </button>
                    ))}
                  </div>
                  {caption("trainingType")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-figma-default mb-1.5">Unit Name <span className="text-figma-danger">*</span></label>
                    <InputCustom
                      value={values.unitName}
                      onChange={(e) => setFieldValue("unitName", e.target.value)}
                      placeholder="Enter Unit Name"
                      className={cn("w-full px-3 py-2.5 text-sm border rounded-lg", inputBorder("unitName"), " placeholder:text-figma-disabled focus:ring-1 focus:ring-figma-primary focus:border-figma-primary")}
                    />
                    {caption("unitName")}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-figma-default mb-1.5">
                      FTMS ID <span className="text-figma-danger">*</span>
                      <div className="relative group inline-flex">
                        <Icon name="info" size={13} className="text-figma-disabled cursor-pointer hover:text-figma-caption transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-lg">
                            The FTMS ID links this booking to the Field Training Management System record. Enter the reference number form FTMS for traceability.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    </label>
                    <InputCustom
                      value={values.ftmsId}
                      onChange={(e) => setFieldValue("ftmsId", e.target.value)}
                      placeholder="Enter FTMS ID"
                      className={cn("w-full px-3 py-2.5 text-sm border rounded-lg", inputBorder("ftmsId"), "placeholder:text-figma-disabled focus:ring-1 focus:ring-figma-primary focus:border-figma-primary")}
                    />
                    {caption("ftmsId")}
                  </div>
                </div>

                {!isIndividual && (
                  <div>
                    <label className="block text-sm font-medium text-figma-default mb-2">Training Mode <span className="text-figma-danger">*</span></label>
                    <div className="flex flex-wrap gap-3">
                      {availableModes.map((mode) => (
                        <button key={mode} type="button" onClick={() => handleModeChange(mode)}
                          className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                            trainingMode === mode ? "border-figma-primary text-figma-primary bg-figma-primarysoft ring-1 ring-figma-primary" : err("trainingMode") ? "border-figma-danger text-figma-default" : "border-figma-line text-figma-default hover:border-gray-500")}>
                          {trainingMode === mode && <Icon name="check" size={16} />}
                          {mode}
                        </button>
                      ))}
                    </div>
                    {caption("trainingMode")}
                  </div>
                )}

                <div>
                  {isIndividual && <label className="block text-sm font-medium text-figma-default mb-1.5">Courseware <span className="text-figma-danger">*</span></label>}
                  {isIndividual ? (
                    <PlainSingleSelect
                      value={courseware[0] ?? ""}
                      onChange={(v) => handleCoursewareChange([v])}
                      options={coursewareOptions}
                      placeholder="Select Courseware"
                      invalid={!!err("courseware")}
                    />
                  ) : (
                    <PlainMultiSelect
                      selected={courseware}
                      onChange={handleCoursewareChange}
                      options={coursewareOptions}
                      placeholder="Select Courseware"
                      invalid={!!err("courseware")}
                      label="Courseware"
                      required
                    />
                  )}
                  {caption("courseware")}
                </div>

                <div>
                  <PlainMultiSelect
                    label="Weapon Type"
                    required
                    selected={weapons}
                    onChange={setWeapons}
                    options={weaponOptions}
                    placeholder="Select Weapon Type"
                    invalid={!!err("weapons")}
                  />
                  {caption("weapons")}
                </div>

                {isCollective && (
                  <div>
                    <PlainMultiSelect
                      label="Role(s)"
                      required
                      selected={roles}
                      onChange={setRoles}
                      options={COLLECTIVE_ROLES}
                      placeholder="Select Role(s)"
                      invalid={!!err("roles")}
                    />
                    {caption("roles")}
                  </div>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox size={16} checked={values.dryRun} onChange={() => setFieldValue("dryRun", !values.dryRun)} />
                  <span className="text-sm text-figma-default">Include Dry Run Training</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    size={16}
                    checked={values.briefingRoom}
                    onChange={() => {
                      const next = !values.briefingRoom;
                      setFieldValue("briefingRoom", next);
                      if (!next) setFieldValue("briefingRoomName", "");
                    }}
                  />
                  <span className="text-sm text-figma-default">Include Briefing Room</span>
                </label>

                {values.briefingRoom && (
                  <div>
                    <label className="block text-sm font-medium text-figma-default mb-1.5">Briefing Room <span className="text-figma-danger">*</span></label>
                    <PlainSingleSelect
                      value={values.briefingRoomName}
                      onChange={(v) => setFieldValue("briefingRoomName", v)}
                      options={BRIEFING_ROOM_OPTIONS}
                      placeholder="Select Briefing Room"
                      invalid={!!err("briefingRoomName")}
                    />
                    {caption("briefingRoomName")}
                  </div>
                )}
              </div>

              <div className="bg-white border border-figma-subtle rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-figma-default">Station Configuration</h2>
                  <p className="text-xs text-figma-body mt-0.5">Configure stations for each courseware independently.</p>
                </div>
                {courseware.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-figma-muted flex items-center justify-center">
                      <Icon name="monitor" size={18} className="text-figma-disabled" />
                    </div>
                    <p className="text-sm text-figma-placeholder text-center">Select a Courseware above to configure stations</p>
                  </div>
                ) : (
                  // Figma `Table Data Import - Booking` (node 5029:69307): one row per
                  // courseware regardless of count — a single courseware is still a
                  // 1-row table, not a different side-by-side layout.
                  <div className="rounded-lg border border-figma-subtle overflow-hidden">
                    <div
                      className="grid bg-figma-dangersoft"
                      style={{ gridTemplateColumns: showCShaped ? "1fr 160px 160px" : "1fr 160px" }}
                    >
                      <div className="px-5 py-3 text-sm font-semibold text-figma-primary">Courseware</div>
                      <div className="px-5 py-3 text-sm font-semibold text-figma-primary">Flat Screen</div>
                      {showCShaped && (
                        <div className="px-5 py-3 text-sm font-semibold text-figma-primary">C-Shaped</div>
                      )}
                    </div>
                    {(isMultiCourseware
                      ? courseware.map((cw) => {
                          const counts = perCoursewareCounts[cw] ?? { base: 1, cshaped: 0 };
                          return {
                            key: cw,
                            name: cw,
                            base: counts.base,
                            cshaped: counts.cshaped,
                            onBase: (v: number) => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, base: v } })),
                            onCshaped: (v: number) => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, cshaped: v } })),
                          };
                        })
                      : [{
                          key: courseware[0],
                          name: courseware[0],
                          base: parseInt(baseQty) || 0,
                          cshaped: parseInt(cShapedQty) || 0,
                          onBase: (v: number) => setBaseQty(String(v)),
                          onCshaped: (v: number) => setCShapedQty(String(v)),
                        }]
                    ).map((row) => (
                      <div
                        key={row.key}
                        className="grid items-center border-t border-figma-subtle"
                        style={{ gridTemplateColumns: showCShaped ? "1fr 160px 160px" : "1fr 160px" }}
                      >
                        <div className="px-5 py-3 text-sm text-figma-default truncate">{row.name}</div>
                        <div className="px-5 py-3">
                          <StationStepper value={row.base} onChange={row.onBase} min={1} />
                        </div>
                        {showCShaped && (
                          <div className="px-5 py-3">
                            <StationStepper value={row.cshaped} onChange={row.onCshaped} min={0} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-figma-subtle rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-figma-default">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-figma-default mb-1.5">Instructor <span className="text-figma-danger">*</span></label>
                    <InstructorField
                      rank={values.instructorRank}
                      name={values.instructor}
                      onRank={(v) => setFieldValue("instructorRank", v)}
                      onName={(v) => setFieldValue("instructor", v)}
                      invalid={!!err("instructor")}
                    />
                    {caption("instructor")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-figma-default mb-1.5">Unit Contact Details <span className="text-figma-danger">*</span></label>
                    <PhoneInputSelector
                      value={values.unitContact}
                      onChange={(v) => setFieldValue("unitContact", v)}
                      className={cn("w-full", err("unitContact") && "border-figma-danger")}
                    />
                    {caption("unitContact")}
                  </div>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
