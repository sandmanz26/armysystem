import { useState, useEffect, useRef } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputCustom, PhoneInputSelector } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { CustomSelect } from "./CustomSelect";
import {
  WEAPON_OPTIONS, COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS,
  COLLECTIVE_ROLES, COURSEWARE_BY_MODE, TRAINING_MODES_BY_TYPE,
} from "../constants";
import type { WeaponItem, TrainingType, DryRun, BookingDetailsSnapshot } from "../types";

// ── Multi-Courseware Select (Group booking) ────────────────────────────────────
function MultiCoursewareSelect({ selected, onChange, options, placeholder }: {
  selected: string;
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

  const selectedArr = Array.isArray(selected) ? selected : selected ? selected.split(", ").filter(Boolean) : [];
  const toggle = (opt: string) => {
    const next = selectedArr.includes(opt) ? selectedArr.filter((s) => s !== opt) : [...selectedArr, opt];
    onChange(next.join(", "));
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn("w-full min-h-[40px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm bg-white text-left",
          open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300")}>
        {selectedArr.length === 0 && <span className="text-gray-400 py-1">{placeholder}</span>}
        {selectedArr.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-700 bg-gray-50">
            {s}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s); }} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
          </span>
        ))}
        {open ? <ChevronUp size={14} className="text-gray-400 ml-auto flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <div key={opt} onClick={() => toggle(opt)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
              <Checkbox size={16} checked={selectedArr.includes(opt)} onChange={() => toggle(opt)} />
              <span className="text-sm text-gray-700">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Local widget: Weapon Multi-Select ─────────────────────────────────────────
function WeaponMultiSelect({ weapons, setWeapons, withQty = true, maxSelect }: {
  weapons: WeaponItem[];
  setWeapons: (w: WeaponItem[]) => void;
  withQty?: boolean;
  maxSelect?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = weapons.filter((w) => w.selected);
  const toggle = (id: string) => setWeapons(weapons.map((w) => {
    if (w.id === id) return { ...w, selected: !w.selected, qty: !w.selected ? 1 : 0 };
    if (maxSelect === 1 && !weapons.find(x => x.id === id)?.selected) return { ...w, selected: false, qty: 0 };
    return w;
  }));
  const remove = (id: string, e: React.MouseEvent) => { e.stopPropagation(); toggle(id); };
  const changeQty = (id: string, delta: number) => setWeapons(weapons.map((w) => w.id === id ? { ...w, qty: Math.max(0, w.qty + delta) } : w));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn("w-full min-h-[40px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm bg-white text-left",
          open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300")}>
        {selected.length === 0 && <span className="text-gray-400 py-1">Select weapon type</span>}
        {selected.map((w) => (
          <span key={w.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-700 bg-gray-50">
            {withQty ? `${w.label} (${w.qty})` : w.label}
            <button type="button" onClick={(e) => remove(w.id, e)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
          </span>
        ))}
        {open ? <ChevronUp size={14} className="text-gray-400 ml-auto flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {weapons.map((w) => (
            <div key={w.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
              <Checkbox size={16} checked={w.selected} onChange={() => toggle(w.id)} />
              <span className="flex-1 text-sm text-gray-700">{w.label}</span>
              {withQty && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); changeQty(w.id, -1); }} className="text-brand-primary font-bold w-5 text-center">−</button>
                  <span className="text-sm text-gray-700 w-4 text-center">{w.qty}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); changeQty(w.id, 1); }} className="text-brand-primary font-bold w-5 text-center">+</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Local widget: Role Tag Multi-Select ───────────────────────────────────────
function RoleTagSelect({ selected, onChange, options }: {
  selected: string[];
  onChange: (roles: string[]) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (role: string) => onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);
  const remove = (role: string, e: React.MouseEvent) => { e.stopPropagation(); onChange(selected.filter((r) => r !== role)); };
  const MAX_VISIBLE = 3;
  const visible = selected.slice(0, MAX_VISIBLE);
  const extra = selected.length - MAX_VISIBLE;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn("w-full min-h-[40px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm bg-white text-left",
          open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300")}>
        {selected.length === 0 && <span className="text-gray-400 py-1">Select role(s)</span>}
        {visible.map((role) => (
          <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-700 bg-gray-50">
            {role}
            <button type="button" onClick={(e) => remove(role, e)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
          </span>
        ))}
        {extra > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs text-brand-primary font-medium bg-red-50">
            +{extra}
          </span>
        )}
        <ChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Checkbox size={16} checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Local widget: Station Qty Input ───────────────────────────────────────────
function StationQtyInput({ value, onChange, placeholder, max }: { value: string; onChange: (v: string) => void; placeholder: string; max?: number }) {
  const current = parseInt(value) || 0;
  const atMax = max !== undefined && current >= max;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <InputCustom
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 0;
            const capped = max !== undefined ? Math.min(v, max) : v;
            onChange(String(capped || ""));
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 text-sm text-gray-700 border-0 focus:ring-0 rounded-none"
        />
        <button type="button" onClick={() => onChange(String(Math.max(0, current - 1) || ""))}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 border-l border-gray-200 text-lg">−</button>
        <button type="button" disabled={atMax} onClick={() => { if (!atMax) onChange(String(current + 1)); }}
          className={cn("w-10 h-10 flex items-center justify-center border-l border-gray-200 text-lg transition-colors",
            atMax ? "text-gray-200 cursor-not-allowed bg-gray-50" : "text-gray-400 hover:bg-gray-50")}>+</button>
      </div>
      {atMax && max === 1 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Individual booking is limited to 1 base station only
        </p>
      )}
    </div>
  );
}

// ── Formik observer: bubbles form values + widget state up to parent ──────────
interface FormValues {
  trainingType: string;
  courseware: string;
  dryRun: string;
  baseQty: string;
  cShapedQty: string;
  unitContact: string;
  instructor: string;
  ftmsId: string;
  unitName: string;
}

function FormObserver({ trainingMode, weapons, collectiveWeapons, judementalWeapons, roles, perCoursewareCounts, onUpdate }: {
  trainingMode: string;
  weapons: WeaponItem[];
  collectiveWeapons: WeaponItem[];
  judementalWeapons: WeaponItem[];
  roles: string[];
  perCoursewareCounts: Record<string, { base: number; cshaped: number }>;
  onUpdate: (data: BookingDetailsSnapshot) => void;
}) {
  const { values } = useFormikContext<FormValues>();

  useEffect(() => {
    const activeItems =
      trainingMode === "Collective" ? collectiveWeapons.filter((w) => w.selected)
      : trainingMode === "Judgemental" ? judementalWeapons.filter((w) => w.selected)
      : weapons.filter((w) => w.selected);
    const activeWeapons = activeItems.map((w) => w.label);
    const isIndividual = values.trainingType === "Individual";
    const weaponSummary = activeItems.length
      ? activeItems.map((w) => (!isIndividual && w.qty > 0) ? `${w.label} (${w.qty})` : w.label).join(", ")
      : "";

    const coursewareList = values.courseware ? values.courseware.split(", ").filter(Boolean) : [];
    const isMultiCourseware = coursewareList.length > 1;

    let effectiveBaseQty = values.baseQty;
    let effectiveCShapedQty = values.cShapedQty;
    if (isMultiCourseware && Object.keys(perCoursewareCounts).length > 0) {
      const counts = Object.values(perCoursewareCounts);
      effectiveBaseQty = String(Math.max(...counts.map((c) => c.base), 0));
      effectiveCShapedQty = String(Math.max(...counts.map((c) => c.cshaped), 0));
    }

    onUpdate({
      weapons: activeWeapons,
      weaponSummary,
      baseQty: effectiveBaseQty,
      cShapedQty: effectiveCShapedQty,
      courseware: values.courseware,
      trainingType: values.trainingType,
      roles,
      unitContact: values.unitContact,
      instructor: values.instructor,
      ftmsId: values.ftmsId,
      unitName: values.unitName,
      stationCountsByCourseware: perCoursewareCounts,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, trainingMode, weapons, collectiveWeapons, judementalWeapons, roles, perCoursewareCounts]);

  return null;
}

// ── Validation schema ─────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
  trainingType: Yup.string().required("Training Type is required"),
  courseware: Yup.string().required("Courseware is required"),
  dryRun: Yup.string().required("Dry Run selection is required"),
  baseQty: Yup.string().required("Base Station quantity is required"),
  unitContact: Yup.string().required("Unit contact number is required"),
  instructor: Yup.string().required("Instructor name is required"),
  ftmsId: Yup.string().required("FTMS ID is required"),
  unitName: Yup.string().required("Unit Name is required"),
});

// ── Main component ────────────────────────────────────────────────────────────
export function BookingDetailsStep({ trainingMode, onModeChange, onUpdate }: {
  trainingMode: string;
  onModeChange: (m: string) => void;
  onUpdate: (data: BookingDetailsSnapshot) => void;
}) {
  const [weapons, setWeapons] = useState<WeaponItem[]>(WEAPON_OPTIONS);
  const [collectiveWeapons, setCollectiveWeapons] = useState<WeaponItem[]>(
    COLLECTIVE_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false }))
  );
  const [judementalWeapons, setJudementalWeapons] = useState<WeaponItem[]>(
    JUDGEMENTAL_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false }))
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [perCoursewareCounts, setPerCoursewareCounts] = useState<Record<string, { base: number; cshaped: number }>>({});

  const syncCoursewareCounts = (coursewareStr: string) => {
    const list = coursewareStr ? coursewareStr.split(", ").filter(Boolean) : [];
    setPerCoursewareCounts((prev) => {
      const next: Record<string, { base: number; cshaped: number }> = {};
      list.forEach((cw) => { next[cw] = prev[cw] ?? { base: 1, cshaped: 0 }; });
      return next;
    });
  };

  const isCollective = trainingMode === "Collective";
  const isJudgemental = trainingMode === "Judgemental";

  return (
    <Formik<FormValues>
      initialValues={{ trainingType: "", courseware: "", dryRun: "", baseQty: "", cShapedQty: "", unitContact: "", instructor: "", ftmsId: "", unitName: "" }}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => {
        const availableModes = values.trainingType ? (TRAINING_MODES_BY_TYPE[values.trainingType] ?? []) : [];
        const effectiveMode = trainingMode || (values.trainingType === "Individual" ? "Marksmanship" : "");
        const coursewareOptions = COURSEWARE_BY_MODE[effectiveMode] ?? [];
        const isIndividual = values.trainingType === "Individual";

        const handleModeChange = (mode: string) => {
          onModeChange(mode);
          setFieldValue("courseware", "");
          syncCoursewareCounts("");
          setWeapons(WEAPON_OPTIONS.map((w) => ({ ...w, selected: false, qty: 0 })));
          setCollectiveWeapons(COLLECTIVE_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
          setJudementalWeapons(JUDGEMENTAL_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
        };

        return (
          <Form className="flex-1 overflow-auto bg-gray-50 py-8 px-6">
            <FormObserver
              trainingMode={trainingMode}
              weapons={weapons}
              collectiveWeapons={collectiveWeapons}
              judementalWeapons={judementalWeapons}
              roles={roles}
              perCoursewareCounts={perCoursewareCounts}
              onUpdate={onUpdate}
            />
            <div className="max-w-2xl mx-auto space-y-4">

              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-3"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0">Training Details</span><div className="flex-1 h-px bg-gray-100" /></div>

                {/* Training Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Type <span className="text-brand-primary">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(["Individual", "Group"] as TrainingType[]).map((type) => (
                      <button key={type!} type="button"
                        onClick={() => {
                          setFieldValue("trainingType", type);
                          setFieldValue("courseware", "");
                          syncCoursewareCounts("");
                          onModeChange(type === "Individual" ? "Marksmanship" : "");
                          if (type === "Individual") setFieldValue("baseQty", "1");
                        }}
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                          values.trainingType === type ? "border-brand-primary bg-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                        <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                          values.trainingType === type ? "border-white" : "border-gray-400")}>
                          {values.trainingType === type && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unit Name + FTMS ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Name <span className="text-brand-primary">*</span></label>
                    <InputCustom
                      value={values.unitName}
                      onChange={(e) => setFieldValue("unitName", e.target.value)}
                      placeholder="Enter unit name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      FTMS ID <span className="text-brand-primary">*</span>
                      <div className="relative group inline-flex">
                        <Info size={13} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-lg">
                            The FTMS ID links this booking to the Field Training Management System record. Enter the reference number from FTMS for traceability.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    </label>
                    <InputCustom
                      value={values.ftmsId}
                      onChange={(e) => setFieldValue("ftmsId", e.target.value)}
                      placeholder="Enter FTMS ID"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Training Mode + Weapon Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Training Mode <span className="text-brand-primary">*</span></label>
                    <CustomSelect value={trainingMode} onChange={handleModeChange} options={availableModes} placeholder="Select training mode" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Weapon Type(s) <span className="text-brand-primary">*</span>
                      {values.trainingType === "Individual" && (
                        <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full normal-case tracking-normal border border-amber-200">
                          Max 1 weapon
                        </span>
                      )}
                    </label>
                    {isCollective
                      ? <WeaponMultiSelect weapons={collectiveWeapons} setWeapons={setCollectiveWeapons} withQty={false} />
                      : isJudgemental
                        ? <WeaponMultiSelect weapons={judementalWeapons} setWeapons={setJudementalWeapons} withQty={false} />
                        : <WeaponMultiSelect weapons={weapons} setWeapons={setWeapons} withQty={false} maxSelect={isIndividual ? 1 : undefined} />
                    }
                  </div>
                </div>

                {/* Courseware — full width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Courseware <span className="text-brand-primary">*</span>
                  </label>
                  {values.trainingType === "Group" ? (
                    <MultiCoursewareSelect
                      selected={values.courseware}
                      onChange={(v) => { setFieldValue("courseware", v); syncCoursewareCounts(v); }}
                      options={coursewareOptions}
                      placeholder="Choose courseware(s)"
                    />
                  ) : (
                    <CustomSelect value={values.courseware} onChange={(v) => setFieldValue("courseware", v)} options={coursewareOptions} placeholder="Choose courseware" />
                  )}
                </div>

                {/* Collective-only: Choose Role(s) */}
                {isCollective && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose Role(s) <span className="text-brand-primary">*</span></label>
                    <RoleTagSelect selected={roles} onChange={setRoles} options={COLLECTIVE_ROLES} />
                  </div>
                )}

                {/* Dry Run */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dry Run Training <span className="text-brand-primary">*</span></label>
                  <div className="flex gap-3">
                    {(["Yes", "No"] as DryRun[]).map((val) => (
                      <button key={val!} type="button" onClick={() => setFieldValue("dryRun", val)}
                        className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                          values.dryRun === val ? "border-brand-primary bg-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                        <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                          values.dryRun === val ? "border-white" : "border-gray-400")}>
                          {values.dryRun === val && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Station(s) */}
              {(() => {
                const coursewareList = values.courseware ? values.courseware.split(", ").filter(Boolean) : [];
                const isMultiCourseware = coursewareList.length > 1;
                const showCShaped = isCollective || isJudgemental || trainingMode === "Marksmanship";
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0">Station Configuration</span><div className="flex-1 h-px bg-gray-100" /></div>
                    {!values.trainingType || !values.courseware ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                          Select a <span className="font-medium text-gray-500">{!values.trainingType ? "Training Type" : "Courseware"}</span> above to configure stations
                        </p>
                      </div>
                    ) : isMultiCourseware ? (
                      <>
                        <p className="text-xs text-gray-500 -mt-1">Configure stations for each courseware independently.</p>
                        <div className="space-y-2">
                          {coursewareList.map((cw) => {
                            const counts = perCoursewareCounts[cw] ?? { base: 1, cshaped: 0 };
                            return (
                              <div key={cw} className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">{cw}</span>
                                <div className="flex items-center gap-5 flex-shrink-0 ml-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 font-medium w-[68px] text-right">Flat Screen</span>
                                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                      <button type="button" onClick={() => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, base: Math.max(1, counts.base - 1) } }))}
                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-r border-gray-200 font-bold text-sm">−</button>
                                      <span className="w-8 text-center text-sm font-bold text-gray-800">{counts.base}</span>
                                      <button type="button" onClick={() => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, base: counts.base + 1 } }))}
                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 font-bold text-sm">+</button>
                                    </div>
                                  </div>
                                  {showCShaped && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400 font-medium w-[60px] text-right">C-Shaped</span>
                                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                        <button type="button" onClick={() => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, cshaped: Math.max(0, counts.cshaped - 1) } }))}
                                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-r border-gray-200 font-bold text-sm">−</button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-800">{counts.cshaped}</span>
                                        <button type="button" onClick={() => setPerCoursewareCounts((prev) => ({ ...prev, [cw]: { ...counts, cshaped: counts.cshaped + 1 } }))}
                                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 border-l border-gray-200 font-bold text-sm">+</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Flat Screen <span className="text-brand-primary">*</span></label>
                          <StationQtyInput value={values.baseQty} onChange={(v) => setFieldValue("baseQty", v)} placeholder="Enter flat screen qty" max={values.trainingType === "Individual" ? 1 : undefined} />
                        </div>
                        {showCShaped && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">C-Shaped Station <span className="text-brand-primary">*</span></label>
                            <StationQtyInput value={values.cShapedQty} onChange={(v) => setFieldValue("cShapedQty", v)} placeholder="Enter c-shaped station qty" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Contact Information — placed last so training context is set first */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0">Contact Information</span><div className="flex-1 h-px bg-gray-100" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructor <span className="text-brand-primary">*</span></label>
                    <InputCustom
                      value={values.instructor}
                      onChange={(e) => setFieldValue("instructor", e.target.value)}
                      placeholder="Enter instructor name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Contact Details <span className="text-brand-primary">*</span></label>
                    <PhoneInputSelector
                      value={values.unitContact}
                      onChange={(v) => setFieldValue("unitContact", v)}
                      className="w-full"
                    />
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
