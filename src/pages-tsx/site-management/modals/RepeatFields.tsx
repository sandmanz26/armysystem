import type { FormikHelpers } from "formik";
import { Select } from "@/components/select";
import { Input } from "@/components/input";
import { Stepper } from "@/components/stepper";
import { SummaryCard } from "@/components/summary-card";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";
import { DateField } from "./DateField";
import {
  CUSTOM_UNITS,
  REPEAT_KINDS,
  WEEKDAY_CHIPS,
  monthModeLabel,
  parseISO,
  repeatOptionLabel,
  type BlackoutFormValues,
  type CustomUnit,
  type EndsKind,
  type MonthMode,
  type RepeatKind,
} from "../blackoutRules";

/*
 * Add Blackout Date → the "Repeat" block and, once something repeats, "Ends".
 * Figma `Repeats` frames: `Annual` 7973:29431, `Custom - Day` 7973:32189, `Custom - Week`
 * 7974:34057, `Custom-Month` 7974:34842, `End of Date` 7973:30862.
 *
 *   Repeat *   Select, 472 wide. Options come from the chosen date (Figma's
 *              `Dropdown - Repeat`): Does not repeat · Annually on 3 November · Every semester
 *              (6 months) on day 3 · Every quarter (3 months) on day 3 · Monthly on day 3 ·
 *              Monthly on the first Monday · Custom
 *   Custom     a grey SummaryCard under it, 16px padding / gap:
 *                "Repeats every" [Stepper 157] [unit Select 157: day · week · month · year]
 *                week  → "On" + S M T W T F S chips
 *                month → a Select: "On day 3" / "On the first Monday"
 *   Ends *     a row, 12px apart, bottom-aligned: Select 224 (After · On date) then
 *                After   → a 187 number field + "times"
 *                On date → a 236 date field
 *
 * Repeat stays disabled until a date is chosen: every option's wording is built from it.
 */

type SetField = FormikHelpers<BlackoutFormValues>["setFieldValue"];

interface RepeatFieldsProps {
  values: BlackoutFormValues;
  setFieldValue: SetField;
  setFieldTouched: FormikHelpers<BlackoutFormValues>["setFieldTouched"];
  err: (k: keyof BlackoutFormValues) => string | undefined;
}

const ENDS_OPTIONS: { value: EndsKind; label: string }[] = [
  { value: "after", label: "After" },
  { value: "onDate", label: "On date" },
];

export function RepeatFields({ values, setFieldValue, setFieldTouched, err }: RepeatFieldsProps) {
  const start = parseISO(values.startDate);

  /** Week needs at least one day: open on the weekday of the chosen date, as Figma's frame does. */
  const seedWeekday = () => {
    if (start && values.weekdays.length === 0) setFieldValue("weekdays", [start.getDay()]);
  };

  const onRepeat = (value: string) => {
    const kind = value as RepeatKind;
    setFieldValue("repeat", kind);
    if (kind !== "none") {
      // Figma only offers "Add End Date" while Repeat is "Does not repeat".
      setFieldValue("hasEndDate", false);
      setFieldValue("endDate", "");
    }
    if (kind === "custom" && values.unit === "week") seedWeekday();
  };

  const onUnit = (value: string) => {
    setFieldValue("unit", value as CustomUnit);
    if (value === "week") seedWeekday();
  };

  const toggleWeekday = (i: number) =>
    setFieldValue(
      "weekdays",
      values.weekdays.includes(i) ? values.weekdays.filter((d) => d !== i) : [...values.weekdays, i],
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Select
          label="Repeat"
          required
          disabled={!start}
          listMaxHeight={264}
          options={REPEAT_KINDS.map((k) => ({ value: k, label: repeatOptionLabel(k, start) }))}
          value={values.repeat}
          onChange={onRepeat}
        />

        {values.repeat === "custom" && (
          <SummaryCard>
            <div className="flex items-center gap-4">
              <span className="shrink-0 whitespace-nowrap text-sm text-default">Repeats every</span>
              <Stepper
                className="w-[157px]"
                aria-label="Repeats every"
                min={1}
                value={values.every}
                onChange={(n) => setFieldValue("every", n)}
              />
              <Select
                wrapperClassName="w-[157px]"
                options={CUSTOM_UNITS}
                value={values.unit}
                onChange={onUnit}
              />
            </div>

            {values.unit === "week" && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-default">On</span>
                <ChipAdvancedGroup multi>
                  {WEEKDAY_CHIPS.map((letter, i) => (
                    <ChipAdvanced
                      key={i}
                      multi
                      label={letter}
                      selected={values.weekdays.includes(i)}
                      onSelect={() => toggleWeekday(i)}
                    />
                  ))}
                </ChipAdvancedGroup>
                {err("weekdays") && <p className="text-xs text-danger">{err("weekdays")}</p>}
              </div>
            )}

            {values.unit === "month" && (
              <Select
                options={(["day", "nth"] as MonthMode[]).map((m) => ({
                  value: m,
                  label: monthModeLabel(m, start),
                }))}
                value={values.monthMode}
                onChange={(m) => setFieldValue("monthMode", m as MonthMode)}
              />
            )}
          </SummaryCard>
        )}
      </div>

      {values.repeat !== "none" && (
        <div className="flex items-end gap-3">
          <Select
            label="Ends"
            required
            wrapperClassName="w-[224px] shrink-0"
            options={ENDS_OPTIONS}
            value={values.endsKind}
            onChange={(k) => setFieldValue("endsKind", k as EndsKind)}
          />
          {values.endsKind === "after" ? (
            <>
              <Input
                type="number"
                min={1}
                step={1}
                wrapperClassName="w-[187px] shrink-0"
                aria-label="Number of times"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={values.endsAfter}
                status={err("endsAfter") ? "danger" : "default"}
                caption={err("endsAfter")}
                onChange={(e) =>
                  setFieldValue("endsAfter", e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <span className="flex h-10 items-center text-sm text-default">times</span>
            </>
          ) : (
            <DateField
              name="endsOnDate"
              wrapperClassName="w-[236px] shrink-0"
              value={values.endsOnDate}
              onChange={(iso) => setFieldValue("endsOnDate", iso)}
              onBlur={() => setFieldTouched("endsOnDate", true)}
              status={err("endsOnDate") ? "danger" : "default"}
              caption={err("endsOnDate")}
            />
          )}
        </div>
      )}
    </div>
  );
}
