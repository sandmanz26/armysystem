// MST Create Booking — Step 1: Booking Details (CM-1, Figma `↪ Step 1 - Booking Details` 6068:92689).
//
// Frames: Empty 6068:92702 · Dropdown - Training Type 6068:92693 · Training Type Selected 6068:92704 /
// 6183:410251 · Dropdown - Platform 7851:5387 / 8102:43284 · Briefing Room - Active 6183:411793 ·
// Dropdown - Briefing Room 6183:411795 · Empty Error 6068:92709 · Selected Error 6068:92707 / 6183:410253 ·
// Filled 6068:92711 / 6183:410255 / 6183:411797 · Discard Booking 6068:92715 (in the wizard).
//
// One 640px column with two cards, Training Details and Contact Information. Schedule and the date slot
// moved to Step 2 (MST-5); the Briefing Room is now an opt-in ("Include Briefing Room") and only Level 1-2
// rooms are offered ("MST can only book Level 1 and Level 2 briefing rooms.").
// Business logic kept from the previous build: single-select Training Type, Cabin Amount locked at 1 except
// Standalone (up to 11), Platform Type multi-select at every cabin amount (MST-D1), fixed Vehicle Type.
import { useEffect, useMemo, type MutableRefObject } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/checkbox";
import { Input, PhoneInputSelector } from "@/components/input";
import { Select } from "@/components/select";
import { Stepper } from "@/components/stepper";
import { BRIEFING_ROOMS } from "@/pages-tsx/settings/constants";
import { cn } from "@/lib/utils";
import { mstMaxCabins, mstTrainingKind, mstTrainingTypes } from "../mstTrainingTypes";
import { FieldCaption, FieldLabel, InstructorField, MultiSelectField, SearchSelect, SectionCard, type MultiOption } from "./MSTFields";

// ── Types (also read by src/data/localBookings.ts and Booking Detail — keep the shape) ──────────────────

// Vehicle type is fixed to ICV (TERREX) — Figma shows it as a disabled field reading "ICV (Terrex)".
const FIXED_VEHICLE_TYPE = "ICV (TERREX)";

export interface VariantItem {
  id:       string;
  label:    string;
  selected: boolean;
}

/** Platform type options for ICV (TERREX) — multi-select */
const DEFAULT_PLATFORM_VARIANTS: VariantItem[] = [
  { id: "40AGL", label: "40AGL", selected: false },
  { id: "50HMG", label: "50HMG", selected: false },
];

export interface MSTBookingDetailsValues {
  bookingType:         string;
  cabinAmount:         number;
  /** Always one entry (the Training Type) — kept as an array for the saved-booking shape. */
  compartments:        string[];
  vehicleType:         string;
  platformVariants:    VariantItem[];
  unitName:            string;
  instructor:          string;
  unitContactDetails:  string;
  /** Filled in from Step 2 (Schedule) when the booking is saved: "AM Session" | "PM Session" | "Full Day" | "Ad-hoc". */
  scheduleType:        string | null;
  briefingRooms:       string[];
  /** Filled in from Step 2 (Schedule). */
  selectedDate:        Date | null;
  /** Added with the Figma rebuild — optional so bookings saved before it still type-check. */
  instructorRank?:     string;
  includeBriefingRoom?: boolean;
  startTime?:          string;
  endTime?:            string;
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface FormValues {
  trainingType:        string;
  cabinAmount:         number;
  platformTypes:       string[];
  unitName:            string;
  includeBriefingRoom: boolean;
  briefingRooms:       string[];
  instructorRank:      string;
  instructorName:      string;
  unitContact:         string;
}

const schema = Yup.object().shape({
  trainingType:  Yup.string().required("Training Type is required"),
  platformTypes: Yup.array().of(Yup.string()).min(1, "Platform Type is required"),
  unitName:      Yup.string().trim().required("Unit Name is required"),
  // Figma has no error frame for the Briefing Room; wording follows Booking 2.0's "Briefing Room is required".
  briefingRooms: Yup.array().of(Yup.string()).when("includeBriefingRoom", {
    is: true,
    then: (s) => s.min(1, "Briefing Room is required"),
  }),
  instructorName: Yup.string().trim().required("Instructor Name is required"),
  unitContact:    Yup.string().trim().required("Unit Contact Details is required"),
});

function toValues(f: FormValues): MSTBookingDetailsValues {
  return {
    bookingType:        "Compartment Selection",
    cabinAmount:        f.trainingType ? f.cabinAmount : 1,
    compartments:       f.trainingType ? [f.trainingType] : [],
    vehicleType:        FIXED_VEHICLE_TYPE,
    platformVariants:   DEFAULT_PLATFORM_VARIANTS.map((v) => ({ ...v, selected: f.platformTypes.includes(v.id) })),
    unitName:           f.unitName.trim(),
    instructor:         [f.instructorRank, f.instructorName.trim()].filter(Boolean).join(" "),
    unitContactDetails: f.unitContact.trim(),
    scheduleType:       null,
    briefingRooms:      f.includeBriefingRoom ? f.briefingRooms : [],
    selectedDate:       null,
    instructorRank:     f.instructorRank,
    includeBriefingRoom: f.includeBriefingRoom,
  };
}

function fromValues(v?: MSTBookingDetailsValues | null): FormValues {
  const rank = v?.instructorRank ?? "Mr";
  const instructor = v?.instructor ?? "";
  return {
    trainingType:        v?.compartments?.[0] ?? "",
    cabinAmount:         v?.cabinAmount ?? 0,
    platformTypes:       v?.platformVariants?.filter((p) => p.selected).map((p) => p.id) ?? [],
    unitName:            v?.unitName ?? "",
    includeBriefingRoom: v?.includeBriefingRoom ?? false,
    briefingRooms:       v?.briefingRooms ?? [],
    instructorRank:      rank,
    instructorName:      instructor.startsWith(`${rank} `) ? instructor.slice(rank.length + 1) : instructor,
    unitContact:         v?.unitContactDetails ?? "",
  };
}

/** Level 1-2 rooms only ("MST can only book Level 1 and Level 2 briefing rooms."); inactive rooms are not bookable. */
const BRIEFING_ROOM_OPTIONS: MultiOption[] = BRIEFING_ROOMS
  .filter((r) => r.status === "Active" && r.level <= 2)
  .map((r) => ({
    value: r.name,
    label: r.name,
    meta: (
      <span className="flex flex-shrink-0 items-center gap-3 text-xs font-normal text-body">
        <span>Level {r.level}</span>
        <span className="flex items-center gap-1"><Icon name="user-round" size={14} />{r.capacity}</span>
      </span>
    ),
  }));

/** Pushes every edit up (so Back from Step 2 restores the form) and hands the wizard its "Next" check. */
function Bridge({ onChange, validateRef }: {
  onChange: (v: MSTBookingDetailsValues) => void;
  validateRef: MutableRefObject<(() => Promise<MSTBookingDetailsValues | null>) | null>;
}) {
  const { values, submitForm, validateForm } = useFormikContext<FormValues>();
  useEffect(() => { onChange(toValues(values)); }, [values, onChange]);
  useEffect(() => {
    validateRef.current = async () => {
      await submitForm();
      const errors = await validateForm();
      return Object.keys(errors).length === 0 ? toValues(values) : null;
    };
    return () => { validateRef.current = null; };
  }, [validateRef, submitForm, validateForm, values]);
  return null;
}

export function MSTBookingDetailsStep({ initial, onChange, validateRef }: {
  initial?: MSTBookingDetailsValues | null;
  onChange: (v: MSTBookingDetailsValues) => void;
  validateRef: MutableRefObject<(() => Promise<MSTBookingDetailsValues | null>) | null>;
}) {
  const trainingTypeNames = useMemo(() => mstTrainingTypes().map((t) => t.value), []);
  const initialValues = useMemo(() => fromValues(initial), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Formik<FormValues> initialValues={initialValues} validationSchema={schema} onSubmit={() => {}}>
      {({ values, errors, submitCount, setFieldValue, handleChange }) => {
        // Errors show once Next has been pressed (Figma "… - Error" frames), then clear live.
        const err = (k: keyof FormValues) => (submitCount > 0 ? (errors[k] as string | undefined) : undefined);
        const kind = mstTrainingKind(values.trainingType);
        const maxCabins = mstMaxCabins(kind);
        const hasType = !!values.trainingType;
        const typeHint = "Select Training Type first — the platform type list depends on it.";

        return (
          <Form className="flex-1 overflow-auto bg-main-background px-6 py-6">
            <Bridge onChange={onChange} validateRef={validateRef} />
            <div className="mx-auto flex w-[640px] max-w-full flex-col gap-6">
              <SectionCard title="Training Details">
                <SearchSelect
                  label="Training Type" required placeholder="Select Training Type" marker="radio"
                  options={trainingTypeNames} value={values.trainingType}
                  onChange={(v) => { setFieldValue("trainingType", v); setFieldValue("cabinAmount", 1); }}
                  status={err("trainingType") ? "danger" : "default"} caption={err("trainingType")}
                />

                <div className="flex flex-col gap-1">
                  <FieldLabel required={hasType}>Cabin Amount</FieldLabel>
                  <Stepper
                    value={hasType ? values.cabinAmount : 0} min={hasType ? 1 : 0} max={maxCabins}
                    disabled={!hasType || maxCabins === 1} aria-label="Cabin Amount"
                    onChange={(n) => setFieldValue("cabinAmount", Number(n) || 1)}
                  />
                  <FieldCaption>
                    {!hasType ? "Select Training Type first — the cabin amount depends on it." : maxCabins === 1 ? "Max 1" : `Up to ${maxCabins} cabins`}
                  </FieldCaption>
                </div>

                <Select label="Vehicle Type" required options={["ICV (Terrex)"]} value="ICV (Terrex)" onChange={() => {}} disabled />

                <MultiSelectField
                  label="Platform Type" required={hasType} placeholder="Select Platform Type"
                  options={DEFAULT_PLATFORM_VARIANTS.map((v) => ({ value: v.id, label: v.label }))}
                  value={values.platformTypes} onChange={(v) => setFieldValue("platformTypes", v)}
                  disabled={!hasType} hint={!hasType ? typeHint : undefined}
                  status={err("platformTypes") ? "danger" : "default"} caption={err("platformTypes")}
                />

                <Input
                  name="unitName" label="Unit Name" required placeholder="Enter Unit Name"
                  value={values.unitName} onChange={handleChange}
                  status={err("unitName") ? "danger" : "default"} caption={err("unitName")}
                />

                <div className="flex flex-col gap-5">
                  <Checkbox
                    size={20} label="Include Briefing Room" checked={values.includeBriefingRoom}
                    onChange={() => {
                      const next = !values.includeBriefingRoom;
                      setFieldValue("includeBriefingRoom", next);
                      if (!next) setFieldValue("briefingRooms", []);
                    }}
                  />
                  {values.includeBriefingRoom && (
                    <MultiSelectField
                      label="Briefing Room" required placeholder="Select Briefing Room"
                      options={BRIEFING_ROOM_OPTIONS} value={values.briefingRooms}
                      onChange={(v) => setFieldValue("briefingRooms", v)}
                      hint="MST can only book Level 1 and Level 2 briefing rooms."
                      status={err("briefingRooms") ? "danger" : "default"} caption={err("briefingRooms")}
                    />
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Contact Information">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InstructorField
                    rank={values.instructorRank} name={values.instructorName}
                    onRank={(v) => setFieldValue("instructorRank", v)} onName={(v) => setFieldValue("instructorName", v)}
                    status={err("instructorName") ? "danger" : "default"} caption={err("instructorName")}
                  />
                  <div className="flex flex-col gap-1">
                    <FieldLabel required>Unit Contact Details</FieldLabel>
                    <PhoneInputSelector
                      value={values.unitContact} onChange={(v) => setFieldValue("unitContact", v)}
                      className={cn("h-10 w-full", err("unitContact") && "border-danger")}
                    />
                    {err("unitContact") && <FieldCaption danger>{err("unitContact")}</FieldCaption>}
                  </div>
                </div>
              </SectionCard>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
