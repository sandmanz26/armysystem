// Booking 2.0 Nominal Roll — "Add New Trainee" / "Edit Trainee" right-side drawer. Local to booking-2.
//
// Figma (Create Booking › Nominal Roll, page 5313:13115):
//   Add - Empty        5328:248276 (+ Role, Collective) / 5477:41265 (no Role)
//   Add - Empty Error  5328:248317 / 5477:41267 — after "Create Trainee" every empty field turns red
//                      with "<Field> is required" under it (C-26)
//   Add - Filled Error 5427:157220 — "Service ID already existed" when the Service ID is already in this roll
//   Edit               5328:248404 — same form, primary button "Confirm" (C-21)
// Built on the shared Drawer / Input / Select (same as Booking Details' Nominal Roll tab).
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { RANK_OPTIONS, type Trainee } from "../nominalRollTypes";

interface FormValues {
  name: string;
  rank: string;
  svcId: string;
  platoon: string;
  role: string;
  weapon: string;
}

/** Seeded rows hold a masked Service ID ("*****218J"), so uniqueness is compared on the masked form. */
const maskSvcId = (n: string) => (n.startsWith("*") ? n : `*****${n.slice(-4)}`);

interface AddTraineeDrawerProps {
  mode: "add" | "edit";
  initial?: Trainee;
  unitName: string;
  roleOptions: string[];
  weaponOptions: string[];
  /** Show (and require) the Role field — Collective only (Figma 5477:41265 has no Role). Default true. */
  showRole?: boolean;
  /** SERVICE_IDs already in this roll (excluding the trainee being edited) → "Service ID already existed". */
  takenSvcIds?: string[];
  onClose: () => void;
  onSubmit: (values: { name: string; rank: string; svcId: string; platoon: string; role: string; weapon: string[] }) => void;
}

export function AddTraineeDrawer({ mode, initial, unitName, roleOptions, weaponOptions, showRole = true, takenSvcIds = [], onClose, onSubmit }: AddTraineeDrawerProps) {
  const taken = takenSvcIds.map((n) => maskSvcId(n.trim().toUpperCase()));
  const schema = Yup.object().shape({
    name: Yup.string().trim().required("Trainee Name is required"),
    rank: Yup.string().required("Rank is required"),
    svcId: Yup.string().trim().required("Service ID is required")
      .test("unique", "Service ID already existed", (v) => !v || !taken.includes(maskSvcId(v.trim().toUpperCase()))),
    platoon: Yup.string().trim().required("Platoon Number is required"),
    role: showRole ? Yup.string().required("Role is required") : Yup.string(),
    weapon: Yup.string().required("Weapon Type is required"),
  });

  return (
    <Formik<FormValues>
      initialValues={{
        name: initial?.name ?? "",
        rank: initial?.rank ?? "",
        svcId: initial?.svcId ?? "",
        platoon: initial?.platoon ?? "",
        role: initial?.role ?? "",
        weapon: initial?.weapon[0] ?? "",
      }}
      validationSchema={schema}
      validateOnChange={false}
      onSubmit={(values) => onSubmit({ ...values, name: values.name.trim(), svcId: values.svcId.trim(), platoon: values.platoon.trim(), weapon: [values.weapon] })}
    >
      {({ values, errors, submitCount, setFieldValue, handleChange, submitForm }) => {
        // Errors appear only after "Create Trainee" / "Confirm" is pressed (Figma Add - Empty → Add - Empty Error).
        const err = (k: keyof FormValues) => (submitCount > 0 ? errors[k] : undefined);
        const st = (k: keyof FormValues) => (err(k) ? "danger" : "default") as "danger" | "default";
        return (
          <Drawer
            open
            onClose={onClose}
            title={mode === "add" ? "Add New Trainee" : "Edit Trainee"}
            footer={
              <>
                <button type="button" onClick={onClose} className="h-9 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">
                  Cancel
                </button>
                <button type="button" onClick={submitForm} className="h-9 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered">
                  {mode === "add" ? "Create Trainee" : "Confirm"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-5">
              <Input name="name" label="Trainee Name" required placeholder="Enter Trainee Name" value={values.name} onChange={handleChange} status={st("name")} caption={err("name")} />
              <Select label="Rank" required placeholder="Select Rank" options={initial?.rank && !RANK_OPTIONS.includes(initial.rank) ? [initial.rank, ...RANK_OPTIONS] : RANK_OPTIONS} value={values.rank} onChange={(v) => setFieldValue("rank", v)} status={st("rank")} caption={err("rank")} />
              <Input name="svcId" label="Service ID" required placeholder="e.g. A1234567" value={values.svcId} onChange={handleChange} status={st("svcId")} caption={err("svcId")} />
              <Input name="platoon" label="Platoon Number" required placeholder="Enter Platoon Number (e.g. 1)" value={values.platoon} onChange={handleChange} status={st("platoon")} caption={err("platoon")} />
              {showRole && (
                <Select label="Role" required placeholder="Select Role" options={roleOptions} value={values.role} onChange={(v) => setFieldValue("role", v)} status={st("role")} caption={err("role")} />
              )}
              <Select label="Weapon Type" required placeholder="Select Weapon Type" options={weaponOptions} value={values.weapon} onChange={(v) => setFieldValue("weapon", v)} status={st("weapon")} caption={err("weapon")} />
              <Input label="Unit Name" value={unitName} disabled readOnly />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}
