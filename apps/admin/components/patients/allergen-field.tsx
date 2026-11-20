"use client";

import { useEffect, useState } from "react";
import type { PatientAllergen } from "@remi/services/shared";
import {
  ALL_SUB_KEY,
  allergenOptions,
  allergenRowLabel,
  allSubKeyLabel,
  noneKnownLabels,
  uncategorisedAllergenRows,
} from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { Input, Typography } from "@remi/ui/server";
import {
  ChoiceCards,
  useFormChange,
} from "@/components/patients/choice-cards";
import { MandatoryLabel } from "@/components/patients/form-groups";
import {
  allergenNames,
  type AllergenState,
} from "@/lib/patients/questionnaire-form";

type Kind = "allergy" | "intolerance";

type Props = {
  kind: Kind;
  legend: string;
  /** The list's « none known » flag: true, false or null. */
  noneKnown: boolean | null;
  /** The rows already stored for this list. */
  rows: readonly PatientAllergen[];
};

/** How the stored answer reads: no answer, none known, or declared boxes. */
const stateOf = (
  noneKnown: boolean | null,
  rows: readonly PatientAllergen[],
): AllergenState =>
  noneKnown === true
    ? "none_known"
    : rows.length > 0
      ? "declared"
      : "unanswered";

/** A box's form value: `key`, or `key/subKey` for a box of a sub-list. */
const boxValue = (key: string, subKey: string | null) =>
  subKey === null ? key : `${key}/${subKey}`;

const boxClass =
  "border-border bg-card flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

/**
 * One allergen list of the questionnaire, as the console encodes it: the
 * answer first, then the boxes when the answer is « Oui ». A checked category
 * opens its sub-list, with « Tous » first, and « Tous » locks the other boxes
 * of the sub-list, as on the patient's page. « Autre » takes a text.
 *
 * The boxes are `allergenOptions`, the patient's own list (REM-163, REM-164):
 * each cereal is a box, and its value is `gluten/<cereal>`. A stored row that
 * no box holds shows first, checked, so a save keeps it.
 *
 * No answer is selected until one exists. The boxes post through Radix's
 * hidden inputs, so the form reads them with no handler of this component.
 * The state here only decides what is shown.
 */
export const AllergenField = ({ kind, legend, noneKnown, rows }: Props) => {
  const names = allergenNames(kind);
  const options = allergenOptions(kind);
  const kept = uncategorisedAllergenRows(kind, rows);

  const [state, setState] = useState<AllergenState>(stateOf(noneKnown, rows));
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => new Set(rows.map((row) => boxValue(row.key, row.subKey))),
  );
  const notify = useFormChange();
  useEffect(() => {
    notify();
  }, [state, checked, notify]);

  // Keyed by the box's key: `other`, or the category of a sub-list « Autre ».
  const otherTexts = new Map<string, string>(
    rows
      .filter((row) => row.otherText !== null)
      .map((row): [string, string] => [row.key, row.otherText ?? ""]),
  );

  // Unchecking a category unchecks its sub-list too: a sub-box alone would
  // keep the category open and checked.
  const toggle = (value: string, on: boolean) =>
    setChecked((current) => {
      const next = new Set(current);
      if (on) {
        next.add(value);
        return next;
      }
      for (const box of current) {
        if (box === value || box.startsWith(`${value}/`)) {
          next.delete(box);
        }
      }
      return next;
    });

  // A family counts as open when it or any of its sub-boxes is checked. A
  // kept row is not a sub-box: it does not open a family.
  const keptValues = new Set(kept.map((row) => boxValue(row.key, row.subKey)));
  const isOpen = (key: string) =>
    [...checked].some(
      (value) =>
        value === key ||
        (value.startsWith(`${key}/`) && !keptValues.has(value)),
    );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ChoiceCards
        name={names.state}
        legend={<MandatoryLabel>{legend}</MandatoryLabel>}
        initial={state}
        emptyValue="unanswered"
        onSelect={(value) =>
          setState(value === "" ? "unanswered" : (value as AllergenState))
        }
        options={[
          { value: "none_known", label: noneKnownLabels[kind].fr },
          { value: "declared", label: "Oui, lesquelles" },
        ]}
      />

      {state === "declared" ? (
        <ul
          aria-label={legend}
          className="@xl:grid-cols-2 grid grid-cols-1 gap-2"
        >
          {kept.map((row, index) => {
            const value = boxValue(row.key, row.subKey);
            const id = `${kind}-kept-${index}`;
            return (
              <li key={value} className="col-span-full flex flex-col gap-2">
                <label htmlFor={id} className={boxClass}>
                  <Checkbox
                    id={id}
                    name={names.item}
                    value={value}
                    checked={checked.has(value)}
                    onCheckedChange={(on) => toggle(value, on === true)}
                  />
                  {allergenRowLabel(kind, row)}
                </label>
              </li>
            );
          })}
          {options.map((option) => {
            const { key } = option;
            const value = option.id;
            const subList = option.subList;
            const id = `${kind}-${value.replace("/", "-")}`;
            const label = option.label.fr;
            // A member box (« Blé ») is its one value. A family opens.
            const open = option.subKey === null && isOpen(key);
            const all = checked.has(boxValue(key, ALL_SUB_KEY));
            return (
              <li
                key={value}
                className={
                  subList.length > 0 && open
                    ? "col-span-full flex flex-col gap-2"
                    : "flex flex-col gap-2"
                }
              >
                <label htmlFor={id} className={boxClass}>
                  <Checkbox
                    id={id}
                    name={names.item}
                    value={value}
                    checked={checked.has(value) || open}
                    onCheckedChange={(on) => toggle(value, on === true)}
                  />
                  <span className="flex min-w-0 flex-col">
                    {label}
                    {option.description ? (
                      <span className="text-muted-foreground text-xs">
                        {option.description.fr}
                      </span>
                    ) : null}
                  </span>
                </label>
                {key === "other" && checked.has(value) ? (
                  <Input
                    name={names.other(key)}
                    aria-label={`${legend} : autre`}
                    placeholder="Précisez"
                    defaultValue={otherTexts.get(key) ?? ""}
                  />
                ) : null}
                {subList.length > 0 && open ? (
                  <ul
                    aria-label={label}
                    className="border-border @xl:grid-cols-2 ml-3 grid grid-cols-1 gap-2 border-l pl-3"
                  >
                    {[
                      { key: ALL_SUB_KEY, label: allSubKeyLabel },
                      ...subList,
                    ].map(({ key: subKey, label: subLabel }) => {
                      const subValue = boxValue(key, subKey);
                      const subId = `${kind}-${key}-${subKey}`;
                      const locked = all && subKey !== ALL_SUB_KEY;
                      const on = !locked && checked.has(subValue);
                      return (
                        <li key={subKey} className="flex flex-col gap-2">
                          <label htmlFor={subId} className={boxClass}>
                            <Checkbox
                              id={subId}
                              name={names.item}
                              value={subValue}
                              checked={on}
                              disabled={locked}
                              onCheckedChange={(next) =>
                                toggle(subValue, next === true)
                              }
                            />
                            {subLabel.fr}
                          </label>
                          {subKey === "other" && on ? (
                            <Input
                              name={names.other(key)}
                              aria-label={`${label} : autre`}
                              placeholder="Précisez"
                              defaultValue={otherTexts.get(key) ?? ""}
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {state === "declared" && checked.size === 0 ? (
        <Typography size="sm" tone="muted">
          Cochez au moins une case, ou choisissez « {noneKnownLabels[kind].fr} ».
        </Typography>
      ) : null}
    </div>
  );
};
