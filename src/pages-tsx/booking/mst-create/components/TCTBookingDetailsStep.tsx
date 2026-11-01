import { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ChevronDown, ChevronLeft, ChevronRight, Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TCT_MAX_CLUSTERS } from "../tctZones";

// ── Constants ─────────────────────────────────────────────────────────────────

const FIXED_TRAINING_TYPE = "TCT_Standalone";
const MAX_CLUSTER_AMOUNT  = TCT_MAX_CLUSTERS;

const TCT_VEHICLE_TYPES = ["ICV", "Armour", "Engineer", "PCSV", "Transport Vehicles"] as const;

const PLATFORM_OPTIONS_BY_VEHICLE: Record<string, string[]> = {
  "ICV": [
    "ICV Commander", "ICV Trooper", "ICV Scout",
    "ICV Pioneer",   "ICV Medical", "ICV Storm",
  ],
  "Armour": ["L2SG", "L2-AEV"],
  "Engineer": ["M3G", "ATTC-LAMBE"],
  "PCSV": [
    "PCSV Mortar", "PCSV Rebro", "PCSV Fuel",
    "PCSV Bn Casualty Station (BCS)",
    "PCSV Combat Train (Logistic)",
    "PCSV FMP (Maintenance)",
  ],
  "Transport Vehicles": ["Tonner", "LUV"],
};

const SCHEDULE_OPTIONS = [
  { value: "AM Session", label: "AM Session (8:00 AM – 12:00 PM)" },
  { value: "PM Session", label: "PM Session (12:00 PM – 5:00 PM)" },
  { value: "Full Day",   label: "Full Day Schedule"                },
  { value: "Ad-hoc",    label: "Ad-hoc Schedule"                  },
];
/** Level/Pax are placeholder values (not sourced from Settings > Briefing Room master
 *  data, whose room list doesn't overlap this one) — per user direction, 29 Sep 2026. */
interface BriefingRoomOption { name: string; level: 1 | 2 | 3 | 4; pax: number }

const BRIEFING_ROOMS: BriefingRoomOption[] = [
  { name: "Briefing Room A", level: 1, pax: 40 },
  { name: "Briefing Room B", level: 1, pax: 25 },
  { name: "Briefing Room C", level: 2, pax: 30 },
  { name: "Briefing Room D", level: 2, pax: 20 },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlatformVariantItem {
  id:          string;
  label:       string;
  vehicleType: string;
  selected:    boolean;
  qty:         number;
}

export interface TCTBookingDetailsValues {
  trainingType:     string;
  clusterAmount:    number;
  vehicleTypes:     string[];
  platformVariants: PlatformVariantItem[];
  unitName:           string;
  instructor:         string;
  unitContactDetails: string;
  scheduleType:       string | null;
  scheduleSection:    string | null;
  briefingRooms:      string[];
  selectedDate:       Date | null;
}

// ── Helpers: build platform variants list from vehicle type selection ──────────

function buildPlatformVariants(
  vehicleTypes: string[],
  existing: PlatformVariantItem[],
): PlatformVariantItem[] {
  const existingMap = new Map(existing.map(v => [v.id, v]));
  return vehicleTypes.flatMap(vType =>
    (PLATFORM_OPTIONS_BY_VEHICLE[vType] ?? []).map(label => {
      const prev = existingMap.get(label);
      return prev
        ? { ...prev, vehicleType: vType }                       // keep existing selection/qty
        : { id: label, label, vehicleType: vType, selected: false, qty: 1 };
    })
  );
}

// ── Vehicle Type multi-checkbox dropdown ──────────────────────────────────────

function VehicleTypeDropdown({
  value, onChange, error,
}: {
  value: string[]; onChange: (next: string[]) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);

  const summary = value.length > 0 ? value.join(", ") : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none",
          error ? "border-red-400" : open ? "border-brand-primary" : "border-gray-200"
        )}
      >
        <span className={cn("truncate flex-1 text-left", summary ? "text-gray-800" : "text-gray-400")}>
          {summary || "Select vehicle types"}
        </span>
        <ChevronDown size={14} className={cn("text-gray-400 flex-shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
          {TCT_VEHICLE_TYPES.map(opt => {
            const checked   = value.includes(opt);
            const count     = PLATFORM_OPTIONS_BY_VEHICLE[opt]?.length ?? 0;
            return (
              <div
                key={opt}
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggle(opt)}
              >
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  checked ? "bg-brand-primary border-brand-primary" : "border-gray-300"
                )}>
                  {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="flex-1 text-sm text-gray-700">{opt}</span>
                <span className="text-[10px] text-gray-400">{count} platforms</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Platform Type selector (grouped by vehicle type, with qty) ────────────────

function PlatformVariantSelector({
  value, onChange, disabled, error,
}: {
  value:    PlatformVariantItem[];
  onChange: (next: PlatformVariantItem[]) => void;
  disabled?: boolean;
  error?:   string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close dropdown when disabled state changes
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const toggle = (id: string) =>
    onChange(value.map(v => v.id === id ? { ...v, selected: !v.selected } : v));
  const setQty = (id: string, delta: number) =>
    onChange(value.map(v => v.id === id ? { ...v, qty: Math.max(1, v.qty + delta) } : v));

  const selected = value.filter(v => v.selected);
  const summary  = selected.length > 0
    ? selected.map(v => `${v.label} (${v.qty})`).join(", ")
    : "";

  // Group items by vehicleType preserving order
  const groups: { vehicleType: string; items: PlatformVariantItem[] }[] = [];
  TCT_VEHICLE_TYPES.forEach(vt => {
    const items = value.filter(v => v.vehicleType === vt);
    if (items.length > 0) groups.push({ vehicleType: vt, items });
  });

  if (disabled) {
    return (
      <div className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
        Select vehicle type first
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none",
          error ? "border-red-400" : open ? "border-brand-primary" : "border-gray-200"
        )}
      >
        <span className={cn("truncate flex-1 text-left", summary ? "text-gray-800" : "text-gray-400")}>
          {summary || "Select platform types"}
        </span>
        <ChevronDown size={14} className={cn("text-gray-400 flex-shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 max-h-72 overflow-y-auto">
          {groups.map(({ vehicleType, items }) => (
            <div key={vehicleType}>
              {/* Vehicle type group header */}
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-y border-gray-100 sticky top-0">
                {vehicleType}
              </div>
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      item.selected ? "bg-brand-primary border-brand-primary" : "border-gray-300"
                    )}
                  >
                    {item.selected && <Check size={10} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={cn(
                    "flex-1 text-sm",
                    item.selected ? "text-gray-800 font-medium" : "text-gray-700"
                  )}>
                    {item.label}
                  </span>
                  {item.selected && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQty(item.id, -1); }}
                        className="w-5 h-5 rounded flex items-center justify-center text-brand-primary hover:bg-red-50 border border-brand-primary/30"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-gray-700">{item.qty}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setQty(item.id, +1); }}
                        className="w-5 h-5 rounded flex items-center justify-center text-brand-primary hover:bg-red-50 border border-brand-primary/30"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Calendar helpers ──────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

function isSameDay(a: Date | null, b: Date) {
  return a !== null
    && a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate();
}

function MonthView({ year, month, selected, onSelect }: {
  year: number; month: number; selected: Date | null; onSelect: (d: Date) => void;
}) {
  const days  = getDaysInMonth(year, month);
  const start = getFirstDay(year, month);
  const cells: (number | null)[] = Array(start).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center text-xs font-semibold text-gray-600 mb-2">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date   = new Date(year, month, day);
          const active = isSameDay(selected, date);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "mx-auto w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors",
                active ? "bg-brand-primary text-white font-semibold" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = Yup.object({
  clusterAmount: Yup.number().min(1, "Min 1").max(MAX_CLUSTER_AMOUNT, `Max ${MAX_CLUSTER_AMOUNT}`).required("Required"),
  vehicleTypes:  Yup.array().of(Yup.string()).min(1, "Select at least one vehicle type"),
  platformVariants: Yup.array().test(
    "at-least-one-selected",
    "Select at least one platform type",
    (items) => (items as PlatformVariantItem[] | undefined)?.some(i => i.selected) ?? false
  ),
  unitName:           Yup.string().trim().required("Required"),
  instructor:         Yup.string().trim().required("Required"),
  unitContactDetails: Yup.string().trim().required("Required"),
  scheduleType:       Yup.string().nullable().required("Required"),
  briefingRooms: Yup.array().of(Yup.string()).min(1, "Select at least one briefing room"),
});

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onNext: (values: TCTBookingDetailsValues) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TCTBookingDetailsStep({ onNext }: Props) {
  const [calYear,      setCalYear]      = useState(2025);
  const [calMonth,     setCalMonth]     = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month2 = calMonth === 11 ? 0          : calMonth + 1;
  const year2  = calMonth === 11 ? calYear + 1 : calYear;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <Formik
        initialValues={{
          trainingType:     FIXED_TRAINING_TYPE,
          clusterAmount:    1,
          vehicleTypes:     [] as string[],
          platformVariants: [] as PlatformVariantItem[],
          unitName:           "",
          instructor:         "",
          unitContactDetails: "",
          scheduleType:       null as string | null,
          scheduleSection:    null as string | null,
          briefingRooms:      [] as string[],
        }}
        validationSchema={schema}
        onSubmit={(values) => { onNext({ ...values, selectedDate }); }}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const noPlatformsAvailable = values.platformVariants.length === 0;

          return (
            <Form>
              {/* Hidden submit trigger */}
              <button type="submit" id="tct-details-next-trigger" className="hidden" />

              <div className="text-center mb-5">
                <h2 className="text-base font-semibold text-gray-800">Booking Details</h2>
              </div>

              {/* 50/50 grid: form column + calendar column */}
              <div className="grid grid-cols-2 gap-4 items-start">

                {/* ── LEFT COLUMN ─────────────────────────────────── */}
                <div className="space-y-4">

                  {/* ── Box 1: TCT Configuration ──────────────────── */}
                  <div className="bg-white rounded-xl border border-gray-200">

                    {/* Card header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white tracking-wide">
                        TCT
                      </span>
                      <span className="text-sm font-semibold text-gray-700">TCT Configuration</span>
                    </div>

                    <div className="p-4 space-y-4">

                      {/* Row 1: Training Type (fixed) | Cluster Amount */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Training Type — fixed, read-only */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Training Type
                          </label>
                          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              {FIXED_TRAINING_TYPE}
                            </span>
                          </div>
                        </div>

                        {/* Cluster Amount — stepper up to 64 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Cluster Amount <span className="text-brand-primary">*</span>
                          </label>
                          <div className={cn(
                            "flex items-center border rounded-lg overflow-hidden",
                            touched.clusterAmount && errors.clusterAmount
                              ? "border-red-400" : "border-gray-200"
                          )}>
                            <button
                              type="button"
                              onClick={() => setFieldValue("clusterAmount", Math.max(1, values.clusterAmount - 1))}
                              className="px-3 py-2.5 border-r border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={13} />
                            </button>
                            <input
                              type="text"
                              readOnly
                              value={values.clusterAmount}
                              className="flex-1 px-3 py-2.5 text-sm text-center text-gray-700 bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setFieldValue("clusterAmount", Math.min(MAX_CLUSTER_AMOUNT, values.clusterAmount + 1))}
                              className="px-3 py-2.5 border-l border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-400">Up to {MAX_CLUSTER_AMOUNT} clusters</p>
                          <ErrorMessage name="clusterAmount" component="p" className="mt-1 text-xs text-red-500" />
                        </div>

                      </div>

                      {/* Row 2: Vehicle Type | Platform Type */}
                      <div className="grid grid-cols-2 gap-4">

                        {/* Vehicle Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Vehicle Type <span className="text-brand-primary">*</span>
                          </label>
                          <VehicleTypeDropdown
                            value={values.vehicleTypes}
                            onChange={(next) => {
                              const newVariants = buildPlatformVariants(next, values.platformVariants);
                              setFieldValue("vehicleTypes", next);
                              setFieldValue("platformVariants", newVariants);
                            }}
                            error={
                              touched.vehicleTypes && typeof errors.vehicleTypes === "string"
                                ? errors.vehicleTypes : undefined
                            }
                          />
                          {touched.vehicleTypes && typeof errors.vehicleTypes === "string" && (
                            <p className="mt-1 text-xs text-red-500">{errors.vehicleTypes}</p>
                          )}
                        </div>

                        {/* Platform Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Platform Type <span className="text-brand-primary">*</span>
                          </label>
                          <PlatformVariantSelector
                            value={values.platformVariants}
                            onChange={(next) => setFieldValue("platformVariants", next)}
                            disabled={noPlatformsAvailable}
                            error={
                              touched.platformVariants && typeof errors.platformVariants === "string"
                                ? errors.platformVariants : undefined
                            }
                          />
                          {touched.platformVariants && typeof errors.platformVariants === "string" && (
                            <p className="mt-1 text-xs text-red-500">{errors.platformVariants}</p>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>{/* /TCT Config Card */}

                  {/* ── Box 2: Unit info ───────────────────────────── */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Unit Name <span className="text-brand-primary">*</span>
                        </label>
                        <Field
                          name="unitName" type="text" placeholder="Enter unit name"
                          className={cn(
                            "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                            touched.unitName && errors.unitName ? "border-red-400" : "border-gray-200"
                          )}
                        />
                        <ErrorMessage name="unitName" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Instructor <span className="text-brand-primary">*</span>
                        </label>
                        <Field
                          name="instructor" type="text" placeholder="Enter instructor name"
                          className={cn(
                            "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                            touched.instructor && errors.instructor ? "border-red-400" : "border-gray-200"
                          )}
                        />
                        <ErrorMessage name="instructor" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Unit Contact Details <span className="text-brand-primary">*</span>
                      </label>
                      <Field
                        name="unitContactDetails" type="text" placeholder="Enter unit contact details"
                        className={cn(
                          "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                          touched.unitContactDetails && errors.unitContactDetails ? "border-red-400" : "border-gray-200"
                        )}
                      />
                      <ErrorMessage name="unitContactDetails" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                  </div>{/* /Box 2 */}

                  {/* ── Box 3: Schedule + Briefing ─────────────────── */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Selection <span className="text-brand-primary">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SCHEDULE_OPTIONS.map(({ value, label }) => {
                          const isActive = values.scheduleType === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setFieldValue("scheduleType", value)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors text-left",
                                isActive
                                  ? "bg-brand-primary border-brand-primary text-white"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                              )}
                            >
                              <span className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                isActive ? "border-white" : "border-gray-300"
                              )}>
                                {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
                              </span>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <ErrorMessage name="scheduleType" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Briefing Room <span className="text-brand-primary">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {BRIEFING_ROOMS.map(room => {
                          const isSelected = values.briefingRooms.includes(room.name);
                          return (
                            <label key={room.name} className={cn(
                              "flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer text-sm transition-colors",
                              isSelected
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            )}>
                              <span className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                isSelected ? "border-white bg-white" : "border-gray-300"
                              )}>
                                {isSelected && <Check size={10} className="text-brand-primary" strokeWidth={3} />}
                              </span>
                              <input
                                type="checkbox" checked={isSelected}
                                onChange={() => {
                                  const next = isSelected
                                    ? values.briefingRooms.filter(r => r !== room.name)
                                    : [...values.briefingRooms, room.name];
                                  setFieldValue("briefingRooms", next);
                                }}
                                className="sr-only"
                              />
                              <span className="flex flex-col">
                                <span>{room.name}</span>
                                <span className={cn("text-xs", isSelected ? "text-white/80" : "text-gray-400")}>
                                  Level {room.level} · {room.pax} Pax
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <ErrorMessage name="briefingRooms" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                  </div>{/* /Box 3 */}

                </div>{/* /LEFT COLUMN */}

                {/* ── RIGHT COLUMN: Calendar ──────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    Select Date Slot <span className="text-brand-primary">*</span>
                  </p>
                  <div className="flex items-start gap-1">
                    <button type="button" onClick={prevMonth}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0 mt-1">
                      <ChevronLeft size={15} />
                    </button>
                    <div className="flex-1 flex gap-4 min-w-0">
                      <MonthView year={calYear} month={calMonth} selected={selectedDate} onSelect={setSelectedDate} />
                      <div className="w-px bg-gray-100 flex-shrink-0 self-stretch" />
                      <MonthView year={year2}   month={month2}   selected={selectedDate} onSelect={setSelectedDate} />
                    </div>
                    <button type="button" onClick={nextMonth}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0 mt-1">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                  {selectedDate && (
                    <p className="mt-4 text-xs text-center text-brand-primary font-medium">
                      {selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>

              </div>{/* /grid */}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
