import { useState, useEffect, useRef } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { CustomSelect } from "./CustomSelect";
import { WEAPON_OPTIONS, COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_ROLES, COURSEWARE_BY_MODE, TRAINING_MODES_BY_TYPE, } from "../constants";
// ── Multi-Courseware Select (Group booking — WPT) ─────────────────────────────
function MultiCoursewareSelect({ selected, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const selectedArr = Array.isArray(selected) ? selected : selected ? selected.split(", ").filter(Boolean) : [];
    const toggle = (opt) => {
        const next = selectedArr.includes(opt) ? selectedArr.filter((s) => s !== opt) : [...selectedArr, opt];
        onChange(next.join(", "));
    };
    const displayText = selectedArr.length ? selectedArr.join(", ") : placeholder;
    return (<div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={cn("w-full flex items-start justify-between px-3 py-2.5 border rounded-lg text-sm bg-white min-h-[44px]", open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300", selectedArr.length ? "text-gray-800" : "text-gray-400")}>
        <span className="flex flex-wrap gap-1 flex-1 mr-2">
          {selectedArr.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {selectedArr.map((s) => (<span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
              {s}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s); }} className="text-brand-primary hover:text-brand-primary-hover leading-none">×</button>
            </span>))}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0 mt-1"/> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0 mt-1"/>}
      </button>
      {open && (<div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {options.map((opt) => (<div key={opt} onClick={() => toggle(opt)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
              <Checkbox size={16} checked={selectedArr.includes(opt)} onChange={() => toggle(opt)}/>
              <span className="text-sm text-gray-700">{opt}</span>
            </div>))}
        </div>)}
    </div>);
}
// ── Local widget: Weapon Multi-Select ─────────────────────────────────────────
function WeaponMultiSelect({ weapons, setWeapons, withQty = true, maxSelect }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target))
            setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const selected = weapons.filter((w) => w.selected);
    const displayText = selected.length
        ? selected.map((w) => withQty ? `${w.label} (${w.qty})` : w.label).join(", ")
        : "Select weapon type";
    const toggle = (id) => setWeapons(weapons.map((w) => {
        if (w.id === id) return { ...w, selected: !w.selected, qty: !w.selected ? 1 : 0 };
        // If maxSelect=1, deselect all others when selecting this one
        if (maxSelect === 1 && !weapons.find(x => x.id === id)?.selected) return { ...w, selected: false, qty: 0 };
        return w;
    }));
    const changeQty = (id, delta) => setWeapons(weapons.map((w) => w.id === id ? { ...w, qty: Math.max(0, w.qty + delta) } : w));
    return (<div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={cn("w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white", open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300", selected.length ? "text-gray-800" : "text-gray-400")}>
        <span className="truncate">{displayText}</span>
        {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0"/> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0"/>}
      </button>
      {open && (<div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {weapons.map((w) => (<div key={w.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
              <Checkbox size={16} checked={w.selected} onChange={() => toggle(w.id)}/>
              <span className="flex-1 text-sm text-gray-700">{w.label}</span>
              {withQty && (<div className="flex items-center gap-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); changeQty(w.id, -1); }} className="text-brand-primary font-bold w-5 text-center">−</button>
                  <span className="text-sm text-gray-700 w-4 text-center">{w.qty}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); changeQty(w.id, 1); }} className="text-brand-primary font-bold w-5 text-center">+</button>
                </div>)}
            </div>))}
        </div>)}
    </div>);
}
// ── Local widget: Role Tag Multi-Select ───────────────────────────────────────
function RoleTagSelect({ selected, onChange, options }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target))
            setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const toggle = (role) => onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);
    const remove = (role, e) => { e.stopPropagation(); onChange(selected.filter((r) => r !== role)); };
    const MAX_VISIBLE = 3;
    const visible = selected.slice(0, MAX_VISIBLE);
    const extra = selected.length - MAX_VISIBLE;
    return (<div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={cn("w-full min-h-[40px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm bg-white text-left", open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300")}>
        {selected.length === 0 && <span className="text-gray-400 py-1">Select role(s)</span>}
        {visible.map((role) => (<span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-700 bg-gray-50">
            {role}
            <button type="button" onClick={(e) => remove(role, e)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
          </span>))}
        {extra > 0 && (<span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs text-brand-primary font-medium bg-red-50">
            +{extra}
          </span>)}
        <ChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0"/>
      </button>
      {open && (<div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {options.map((opt) => (<button key={opt} type="button" onClick={() => toggle(opt)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Checkbox size={16} checked={selected.includes(opt)} onChange={() => toggle(opt)}/>
              <span>{opt}</span>
            </button>))}
        </div>)}
    </div>);
}
// ── Local widget: Station Qty Input ───────────────────────────────────────────
function StationQtyInput({ value, onChange, placeholder, max }) {
    const current = parseInt(value) || 0;
    const atMax = max !== undefined && current >= max;
    return (<div className="flex flex-col gap-1.5">
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
        <button type="button" onClick={() => onChange(String(Math.max(0, current - 1) || ""))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 border-l border-gray-200 text-lg">−</button>
        <button type="button" disabled={atMax} onClick={() => { if (!atMax) onChange(String(current + 1)); }} className={cn("w-10 h-10 flex items-center justify-center border-l border-gray-200 text-lg transition-colors", atMax ? "text-gray-200 cursor-not-allowed bg-gray-50" : "text-gray-400 hover:bg-gray-50")}>+</button>
      </div>
      {atMax && max === 1 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Individual booking is limited to 1 base station only
        </p>
      )}
    </div>);
}
function FormObserver({ trainingMode, weapons, collectiveWeapons, judementalWeapons, roles, onUpdate }) {
    const { values } = useFormikContext();
    useEffect(() => {
        const activeItems = trainingMode === "Collective" ? collectiveWeapons.filter((w) => w.selected)
            : trainingMode === "Judgemental" ? judementalWeapons.filter((w) => w.selected)
                : weapons.filter((w) => w.selected);
        const activeWeapons = activeItems.map((w) => w.label);
        const weaponSummary = activeItems.length
            ? activeItems.map((w) => w.qty > 0 ? `${w.label} (${w.qty})` : w.label).join(", ")
            : "";
        onUpdate({
            weapons: activeWeapons,
            weaponSummary,
            baseQty: values.baseQty,
            cShapedQty: values.cShapedQty,
            courseware: values.courseware,
            trainingType: values.trainingType,
            roles,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values, trainingMode, weapons, collectiveWeapons, judementalWeapons, roles]);
    return null;
}
// ── Validation schema ─────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
    trainingType: Yup.string().required("Training Type is required"),
    courseware: Yup.string().required("Courseware is required"),
    dryRun: Yup.string().required("Dry Run selection is required"),
    baseQty: Yup.string().required("Base Station quantity is required"),
});
// ── Main component ────────────────────────────────────────────────────────────
export function BookingDetailsStep({ trainingMode, onModeChange, onUpdate }) {
    const [weapons, setWeapons] = useState(WEAPON_OPTIONS);
    const [collectiveWeapons, setCollectiveWeapons] = useState(COLLECTIVE_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
    const [judementalWeapons, setJudementalWeapons] = useState(JUDGEMENTAL_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
    const [roles, setRoles] = useState([]);
    const isCollective = trainingMode === "Collective";
    const isJudgemental = trainingMode === "Judgemental";
    return (<Formik initialValues={{ trainingType: "", courseware: "", dryRun: "", baseQty: "", cShapedQty: "" }} validationSchema={validationSchema} onSubmit={() => { }}>
      {({ values, setFieldValue }) => {
            const availableModes = values.trainingType ? (TRAINING_MODES_BY_TYPE[values.trainingType] ?? []) : [];
            // For Individual, auto-fallback to Marksmanship even before prop updates
            const effectiveMode = trainingMode || (values.trainingType === "Individual" ? "Marksmanship" : "");
            const coursewareOptions = COURSEWARE_BY_MODE[effectiveMode] ?? [];
            const handleModeChange = (mode) => {
                onModeChange(mode);
                setFieldValue("courseware", "");
                setWeapons(WEAPON_OPTIONS.map((w) => ({ ...w, selected: false, qty: 0 })));
                setCollectiveWeapons(COLLECTIVE_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
                setJudementalWeapons(JUDGEMENTAL_WEAPONS.map((id) => ({ id, label: id, qty: 0, selected: false })));
            };
            return (<Form className="flex-1 overflow-auto bg-gray-50 py-8 px-6">
            <FormObserver trainingMode={trainingMode} weapons={weapons} collectiveWeapons={collectiveWeapons} judementalWeapons={judementalWeapons} roles={roles} onUpdate={onUpdate}/>
            <h2 className="text-center text-base font-semibold text-gray-800 mb-6">Booking Details</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

                {/* Training Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Type <span className="text-brand-primary">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Individual", "Group"].map((type) => (<button key={type} type="button" onClick={() => {
                        setFieldValue("trainingType", type);
                        setFieldValue("courseware", type === "Group" ? "" : ""); // reset on switch
                        onModeChange(type === "Individual" ? "Marksmanship" : "");
                        if (type === "Individual") setFieldValue("baseQty", "1");
                    }} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors", values.trainingType === type ? "border-brand-primary bg-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                        <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center", values.trainingType === type ? "border-white" : "border-gray-400")}>
                          {values.trainingType === type && <span className="w-2 h-2 rounded-full bg-white"/>}
                        </span>
                        {type}
                      </button>))}
                  </div>
                </div>

                {/* Training Mode + Courseware */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Training Mode <span className="text-brand-primary">*</span></label>
                    <CustomSelect value={trainingMode} onChange={handleModeChange} options={availableModes} placeholder="Select training mode"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Courseware <span className="text-brand-primary">*</span>
                      {values.trainingType === "Group" && (
                        <span className="ml-2 text-[10px] font-medium text-brand-primary/70 bg-brand-primary/10 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                          Multiple selection
                        </span>
                      )}
                    </label>
                    {values.trainingType === "Group" ? (
                      <MultiCoursewareSelect
                        selected={values.courseware}
                        onChange={(v) => setFieldValue("courseware", v)}
                        options={coursewareOptions}
                        placeholder="Choose courseware(s)"
                      />
                    ) : (
                      <CustomSelect
                        value={values.courseware}
                        onChange={(v) => setFieldValue("courseware", v)}
                        options={coursewareOptions}
                        placeholder="Choose courseware"
                      />
                    )}
                  </div>
                </div>

                {/* Collective-only: Choose Role(s) */}
                {isCollective && (<div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose Role(s) <span className="text-brand-primary">*</span></label>
                    <RoleTagSelect selected={roles} onChange={setRoles} options={COLLECTIVE_ROLES}/>
                  </div>)}

                {/* Weapon Type + Dry Run */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ? <WeaponMultiSelect weapons={collectiveWeapons} setWeapons={setCollectiveWeapons} withQty={false}/>
                    : isJudgemental
                        ? <WeaponMultiSelect weapons={judementalWeapons} setWeapons={setJudementalWeapons} withQty={false}/>
                        : <WeaponMultiSelect weapons={weapons} setWeapons={setWeapons} withQty={true} maxSelect={values.trainingType === "Individual" ? 1 : undefined}/>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dry Run Training <span className="text-brand-primary">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["Yes", "No"].map((val) => (<button key={val} type="button" onClick={() => setFieldValue("dryRun", val)} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors", values.dryRun === val ? "border-brand-primary bg-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                          <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center", values.dryRun === val ? "border-white" : "border-gray-400")}>
                            {values.dryRun === val && <span className="w-2 h-2 rounded-full bg-white"/>}
                          </span>
                          {val}
                        </button>))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Station(s) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Base Station(s) <span className="text-brand-primary">*</span></label>
                  <StationQtyInput value={values.baseQty} onChange={(v) => setFieldValue("baseQty", v)} placeholder="Enter base station qty" max={values.trainingType === "Individual" ? 1 : undefined}/>
                </div>
                {isCollective && (<div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">C-Shaped Station <span className="text-brand-primary">*</span></label>
                    <StationQtyInput value={values.cShapedQty} onChange={(v) => setFieldValue("cShapedQty", v)} placeholder="Enter c-shaped station qty"/>
                  </div>)}
              </div>
            </div>
          </Form>);
        }}
    </Formik>);
}
