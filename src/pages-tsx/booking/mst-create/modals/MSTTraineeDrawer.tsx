// MST Create Booking — Step 4: "Add New Trainee" / "Edit Trainee" drawer (CM-4).
//
// There is no MST frame for this (6183:481240 is an WPT clone). Built from the WPT frames that sit on the same
// page — Add - Empty 6183:481323, Add - Empty Error 6183:481336, Add - Filled Error (Service ID already existed),
// Edit 6183:481352 — so the title, button labels ("Create Trainee" / "Confirm"), the "… is required" errors
// and "Service ID already existed" are Figma's; the FIELDS are MST's own roll columns (Rank, Name, Service ID, Batch,
// Unit, Course, Call Sign, Role), not WPT's Platoon Number / Weapon Type.
// It was a centred modal ("Add Trainee" / "Please fill all the information") before.
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { callSigns, roles } from "@/data/mstTctMasterData";
import { MST_RANKS, maskSvcId } from "../mstRollData";
import { SearchSelect } from "../components/MSTFields";

/** One nominal-roll row — the same fields the MST Nominal Roll table shows. */
export interface MSTTraineeValues {
  rank:     string;
  name:     string;
  svcId:     string;
  batch:    string;
  course:   string;
  unit:     string;
  callSign: string;
  roles:    string;
}

const ROLE_OPTIONS      = roles.filter((r) => r.status === "Active").map((r) => r.name);
const CALL_SIGN_OPTIONS = callSigns.filter((c) => c.status === "Active").map((c) => c.name);

export function MSTTraineeDrawer({ mode, initial, takenSvcIds, onClose, onSubmit }: {
  mode: "add" | "edit";
  initial?: MSTTraineeValues;
  /** SERVICE_IDs already in this roll → "Service ID already existed". */
  takenSvcIds: string[];
  onClose: () => void;
  onSubmit: (values: MSTTraineeValues) => void;
}) {
  const taken = takenSvcIds.map((n) => maskSvcId(n.trim().toUpperCase()));
  const schema = Yup.object().shape({
    name:     Yup.string().trim().required("Trainee Name is required"),
    rank:     Yup.string().required("Rank is required"),
    svcId:     Yup.string().trim().required("Service ID is required")
      // An untouched Service ID on Edit is not a duplicate of itself (the seeded rows even share masked SERVICE_IDs).
      .test("unique", "Service ID already existed", (v) => !v || v === initial?.svcId || !taken.includes(maskSvcId(v.trim().toUpperCase()))),
    batch:    Yup.string().trim().required("Batch is required"),
    unit:     Yup.string().trim().required("Unit is required"),
    course:   Yup.string().trim().required("Course is required"),
    callSign: Yup.string(),
    roles:    Yup.string().required("Role is required"),
  });

  return (
    <Formik<MSTTraineeValues>
      initialValues={{ rank: "", name: "", svcId: "", batch: "", course: "", unit: "", callSign: "", roles: "", ...initial }}
      validationSchema={schema}
      validateOnChange={false}
      onSubmit={(v) => onSubmit({ ...v, name: v.name.trim(), svcId: v.svcId.trim(), batch: v.batch.trim(), unit: v.unit.trim(), course: v.course.trim() })}
    >
      {({ values, errors, submitCount, setFieldValue, handleChange, submitForm }) => {
        // Errors appear only after "Create Trainee" / "Confirm" is pressed (Figma Add - Empty → Add - Empty Error).
        const err = (k: keyof MSTTraineeValues) => (submitCount > 0 ? errors[k] : undefined);
        const st = (k: keyof MSTTraineeValues) => (err(k) ? "danger" : "default") as "danger" | "default";
        return (
          <Drawer
            open
            onClose={onClose}
            title={mode === "add" ? "Add New Trainee" : "Edit Trainee"}
            footer={
              <>
                <button type="button" onClick={onClose} className="h-9 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">Cancel</button>
                <button type="button" onClick={submitForm} className="h-9 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered">
                  {mode === "add" ? "Create Trainee" : "Confirm"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-5">
              <Input name="name" label="Trainee Name" required placeholder="Enter Trainee Name" value={values.name} onChange={handleChange} status={st("name")} caption={err("name")} />
              <Select label="Rank" required placeholder="Select Rank" options={initial?.rank && !MST_RANKS.includes(initial.rank) ? [initial.rank, ...MST_RANKS] : MST_RANKS} value={values.rank} onChange={(v) => setFieldValue("rank", v)} status={st("rank")} caption={err("rank")} />
              <Input name="svcId" label="Service ID" required placeholder="e.g. A1234567" value={values.svcId} onChange={handleChange} status={st("svcId")} caption={err("svcId")} />
              <div className="grid grid-cols-2 gap-4">
                <Input name="batch" label="Batch" required placeholder="e.g. 05/26" value={values.batch} onChange={handleChange} status={st("batch")} caption={err("batch")} />
                <Input name="unit" label="Unit" required placeholder="e.g. 05SIR" value={values.unit} onChange={handleChange} status={st("unit")} caption={err("unit")} />
              </div>
              <Input name="course" label="Course" required placeholder="e.g. IOCC_1(TRX)" value={values.course} onChange={handleChange} status={st("course")} caption={err("course")} />
              <SearchSelect label="Call Sign" placeholder="Select Call Sign" options={CALL_SIGN_OPTIONS} value={values.callSign} onChange={(v) => setFieldValue("callSign", v)} />
              <Select label="Role" required placeholder="Select Role" options={ROLE_OPTIONS} value={values.roles} onChange={(v) => setFieldValue("roles", v)} status={st("roles")} caption={err("roles")} />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}
