// Booking Details 2.0 — "Select a courseware to …" modal for a booking with multiple courseware.
//
// Figma (page `Booking Details: Upcoming`, 5834:183279):
//   Reschedule      `Select Courseware` 6495:75080 · `- Empty Error` 6501:284873 · `- Filled` 6501:284925
//   Cancel Booking  6495:75085 · 6501:284977 · 6501:285029  (checkboxes + "Select all")
//   Start Onboarding 6829:39115 · 6829:40392 · 6829:40394   (no info alert)
//   Top Up Asset    `Select Assignment` 6829:38601 · 6831:40929 · 6831:40931
// Modal 512 wide, radius 16. Header 32 padding: 20/28 Semi Bold title + 40px ✕ icon button.
// Content 0/32, 20 gap: optional info `Alert` (blue fill, 1px border/info, 14 Medium text/info,
// 20px `info` icon), then `ChoiceTile Group` — 14 Medium label, 4px gap, tiles 8px apart.
// `ChoiceTile`: radius 8, 8/12 padding, 12 gap, 1px border/default; selected = primary/invert/soft
// fill + border/primary; error = border/danger on every tile + a 12px text/danger caption.
// Footer 32 padding: ghost "Cancel" + primary "Continue", 12 apart, right-aligned.
import { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { Radio } from "@/components/radio";
import { Checkbox } from "@/components/checkbox";
import { cn } from "@/lib/utils";

export interface ChoiceOption {
  value: string;
  title: string;
  /** One or more 12px caption lines. */
  description: string[];
}

interface Props {
  title: string;
  label: string;
  info?: string;
  options: ChoiceOption[];
  /** `multiple` = checkbox tiles with a "Select all" row (Cancel Booking). */
  multiple?: boolean;
  /** Caption under the tiles when Continue is pressed with nothing selected. Omit to show only the
   *  red tile borders (Figma's Top Up `Empty Error` frame shows no caption). */
  errorText?: string;
  onCancel: () => void;
  onContinue: (values: string[]) => void;
}

const schema = Yup.object({ selected: Yup.array().of(Yup.string()).min(1) });

export function SelectCoursewareModal({ title, label, info, options, multiple, errorText, onCancel, onContinue }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} aria-hidden />
      <Formik<{ selected: string[] }>
        initialValues={{ selected: [] }}
        validationSchema={schema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(v) => onContinue(v.selected)}
      >
        {({ values, errors, setFieldValue, setErrors, handleSubmit }) => {
          const invalid = Boolean(errors.selected);
          const set = (next: string[]) => {
            setFieldValue("selected", next, false);
            if (next.length) setErrors({});
          };
          const toggle = (v: string) =>
            set(values.selected.includes(v) ? values.selected.filter((s) => s !== v) : [...values.selected, v]);
          const all = options.length > 0 && values.selected.length === options.length;
          return (
            <form
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onSubmit={handleSubmit}
              className="relative flex w-[512px] max-w-full flex-col rounded-2xl bg-surface shadow-2xl"
            >
              <div className="flex items-center gap-6 p-8">
                <h2 className="flex-1 text-xl font-semibold leading-7 text-default">{title}</h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onCancel}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-soft"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 px-8">
                {info && (
                  <div role="status" className="flex items-start gap-3 rounded-lg border border-info bg-info-invert-default p-3.5">
                    <Icon name="info" size={20} className="flex-shrink-0 text-info" />
                    <p className="text-sm font-medium leading-5 text-info">{info}</p>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-5 text-default">{label}</p>
                  {multiple && (
                    <Checkbox
                      id="select-cw-all"
                      name="select-cw-all"
                      size={18}
                      checked={all}
                      indeterminate={!all && values.selected.length > 0}
                      onChange={() => set(all ? [] : options.map((o) => o.value))}
                      label={<span className="font-normal">Select all</span>}
                    />
                  )}
                  <div className="flex flex-col gap-2" role={multiple ? "group" : "radiogroup"} aria-label={label}>
                    {options.map((o) => {
                      const checked = values.selected.includes(o.value);
                      const tile = cn(
                        "h-auto items-start gap-3 rounded-lg border px-3 py-2",
                        invalid ? "border-danger" : checked ? "border-primary bg-primary-invert-soft" : "border-default",
                      );
                      const text = (
                        <span className="flex flex-col gap-0.5 font-normal">
                          <span className="text-sm leading-5 text-default">{o.title}</span>
                          {o.description.map((d) => (
                            <span key={d} className="text-xs leading-4 text-caption">{d}</span>
                          ))}
                        </span>
                      );
                      return multiple ? (
                        <Checkbox
                          key={o.value}
                          id={`select-cw-${o.value}`}
                          name="select-cw"
                          size={18}
                          checked={checked}
                          onChange={() => toggle(o.value)}
                          label={text}
                          wrapperClassName={cn(tile, "[&>div]:mt-px")}
                        />
                      ) : (
                        <Radio
                          key={o.value}
                          name="select-cw"
                          value={o.value}
                          checked={checked}
                          onChange={(v) => set([v])}
                          label={text}
                          className={cn(tile, "[&>span:first-child]:mt-px")}
                        />
                      );
                    })}
                  </div>
                  {invalid && errorText && <p className="text-xs leading-4 text-danger">{errorText}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-8">
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-10 rounded-lg bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered"
                >
                  Continue
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
