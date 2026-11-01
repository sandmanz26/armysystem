import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Checkbox } from "@/components/checkbox";
import { Icon } from "@/components/icon";
import { CompanyNameField } from "../components/CompanyNameField";
import { RANKS, ROLES } from "../constants";
import type { AddUserDrawerProps, AddUserFormValues } from "../types";

/*
 * Add User — Figma `Action - Add User` (page 5014:57): Empty 5014:9194, Rank /
 * Role dropdowns 5014:9207 / 5014:9221, Company Name 7014:572185 / 572712 /
 * 572509, Empty Error 5014:9235, password states Weak 5014:9248 · Fair 5014:9261
 * · Good 5014:9274 · Strong 5014:9287, Operator 7021:594352.
 *
 * Shared 384px `Drawer` (z-[2000] — covers the table's sticky header and
 * sticky Actions column). Body: two groups 32px apart, each a 14 Semi Bold
 * plain title then stacked fields 16px apart. "Armskote Personnel" only shows
 * when the role is Operator. Footer: Cancel · Create User, right-aligned.
 *
 * mode="edit" — Figma `Action - Edit User` (5014:9323, opened from User Details
 * "Edit User"): title "Edit User", same Personal Information / Account Settings
 * groups without the Password field, footer Cancel · Confirm. Figma's Edit frame
 * still shows the old required "Unit Name" field; the Add drawer replaced it with
 * Company Name, so edit keeps Company Name (flagged as an open question).
 */

// ── Password rules + strength (5 segments) ───────────────────────────────────
const PW_RULES = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw: string) => /\d/.test(pw) },
  { label: "One special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

/**
 * Figma state frames: Weak = 1 segment `background/danger/default` + text/danger,
 * Fair = 3 `background/warning/default` + text/warning, Good = 4
 * `background/info/default` + text/info, Strong = 5 `background/success/default`
 * + text/success; unfilled segments #9ca3af. Segments filled = rules met.
 */
function strengthOf(score: number) {
  if (score >= 5) return { label: "Strong", bar: "bg-success-default", text: "text-success" };
  if (score === 4) return { label: "Good", bar: "bg-info-default", text: "text-info" };
  if (score === 3) return { label: "Fair", bar: "bg-warning-default", text: "text-warning" };
  return { label: "Weak", bar: "bg-danger-default", text: "text-danger" };
}

const baseShape = {
  name: Yup.string().trim().required("Full Name is required"),
  rank: Yup.string().required("Rank is required"),
  svcId: Yup.string().trim().required("Service ID is required"),
  companyName: Yup.string(),
  role: Yup.string().required("User Role is required"),
  armskotePersonnel: Yup.boolean(),
};

const validationSchema = Yup.object().shape({
  ...baseShape,
  password: Yup.string()
    .required("Password is required")
    .test("rules", "Password does not meet all requirements", (pw) =>
      PW_RULES.every((r) => r.test(pw ?? "")),
    ),
});

/** Edit User has no Password field (5014:9323). */
const editValidationSchema = Yup.object().shape(baseShape);

const initialValues: AddUserFormValues = {
  name: "",
  rank: "",
  svcId: "",
  companyName: "",
  role: "",
  armskotePersonnel: false,
  password: "",
};

export function AddUserDrawer({
  open,
  onClose,
  onCreate,
  companyOptions,
  mode = "add",
  initialValues: prefill,
  onUpdate,
}: AddUserDrawerProps) {
  const [showPw, setShowPw] = useState(false);
  const isEdit = mode === "edit";

  if (!open) return null;

  return (
    <Formik<AddUserFormValues>
      initialValues={{ ...initialValues, ...prefill }}
      validationSchema={isEdit ? editValidationSchema : validationSchema}
      onSubmit={(values, { resetForm }) => {
        const out = {
          ...values,
          armskotePersonnel: values.role === "Operator" ? values.armskotePersonnel : false,
        };
        if (isEdit) onUpdate?.(out);
        else onCreate?.(out);
        resetForm();
        onClose();
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched, submitForm }) => {
        const err = (k: keyof AddUserFormValues) =>
          touched[k] && errors[k] ? (errors[k] as string) : undefined;
        const score = PW_RULES.filter((r) => r.test(values.password)).length;
        const strength = strengthOf(score);

        return (
          <Drawer
            open
            onClose={onClose}
            title={isEdit ? "Edit User" : "Add New User"}
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  {isEdit ? "Confirm" : "Create User"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-8">
              {/* Personal Information */}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-default">Personal Information</p>

                <Input
                  name="name"
                  label="Full Name"
                  required
                  placeholder="Enter Full Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={err("name") ? "danger" : "default"}
                  caption={err("name")}
                />

                <Select
                  label="Rank"
                  required
                  placeholder="Select Rank"
                  options={RANKS}
                  value={values.rank}
                  onChange={(v) => {
                    setFieldValue("rank", v);
                    setFieldTouched("rank", true, false);
                  }}
                  status={err("rank") ? "danger" : "default"}
                  caption={err("rank")}
                />

                <Input
                  name="svcId"
                  label="Service ID"
                  required
                  placeholder="e.g. A1234567"
                  value={values.svcId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={err("svcId") ? "danger" : "default"}
                  caption={err("svcId")}
                />

                <CompanyNameField
                  value={values.companyName}
                  onChange={(v) => setFieldValue("companyName", v)}
                  options={companyOptions}
                  caption="Select an existing company name or type a new name to add it."
                />
              </div>

              {/* Account Settings */}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-default">Account Settings</p>

                <Select
                  label="User Role"
                  required
                  placeholder="Select Role"
                  options={ROLES}
                  value={values.role}
                  onChange={(v) => {
                    setFieldValue("role", v);
                    setFieldTouched("role", true, false);
                    if (v !== "Operator") setFieldValue("armskotePersonnel", false);
                  }}
                  status={err("role") ? "danger" : "default"}
                  caption={err("role")}
                />

                {values.role === "Operator" && (
                  <Checkbox
                    id="add-user-armskote"
                    name="armskotePersonnel"
                    size={18}
                    checked={values.armskotePersonnel}
                    onChange={(e) => setFieldValue("armskotePersonnel", e.target.checked)}
                    label={<span className="font-normal">Armskote Personnel</span>}
                    wrapperClassName="h-5 self-start"
                  />
                )}

                {!isEdit && (
                <div className="flex flex-col gap-1">
                  <Input
                    name="password"
                    label="Password"
                    required
                    type={showPw ? "text" : "password"}
                    placeholder="Create a Password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    status={err("password") ? "danger" : "default"}
                    caption={err("password")}
                    suffixIcon={
                      <button
                        type="button"
                        aria-label={showPw ? "Hide password" : "Show password"}
                        onClick={() => setShowPw((v) => !v)}
                        className="flex items-center text-caption hover:text-default"
                      >
                        <Icon name={showPw ? "eye" : "eye-off"} size={22} />
                      </button>
                    }
                  />

                  {/* Figma `Password Parameter`: 5 bars 8px tall + label, then
                      the rule checklist in two columns (16px gap, 4px row gap). */}
                  {values.password.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex h-4 items-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-2 flex-1 rounded-full transition-colors",
                              i <= score ? strength.bar : "bg-figma-line",
                            )}
                          />
                        ))}
                        <span className={cn("w-10 text-right text-xs font-semibold", strength.text)}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {PW_RULES.map((r) => {
                          const ok = r.test(values.password);
                          return (
                            <div
                              key={r.label}
                              className={cn(
                                "flex items-center gap-1.5 text-xs",
                                ok ? "text-success" : "text-body",
                              )}
                            >
                              <Icon name="check" size={16} className="flex-shrink-0" />
                              {r.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}
