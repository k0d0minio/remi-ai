"use client";

import { useState } from "react";
import type { PatientAllergen } from "@remi/services/shared";
import {
  ALL_SUB_KEY,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  allSubKeyLabel,
  intoleranceLabels,
  intolerances,
  noneKnownLabels,
} from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { ChoiceChip, Input, Typography } from "@remi/ui/server";
import {
  allergenNames,
  type AllergenState,
} from "@/lib/patients/questionnaire-form";

type Kind = "allergy" | "intolerance";

type Props = {
  kind: Kind;
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

const subListOf = (key: string): readonly string[] =>
  Object.hasOwn(allergenSubLists, key)
    ? allergenSubLists[key as keyof typeof allergenSubLists]
    : [];

const subLabelOf = (key: string, subKey: string) => {
  if (subKey === ALL_SUB_KEY) {
    return allSubKeyLabel.fr;
  }
  const labels = allergenSubLabels[key as keyof typeof allergenSubLabels] as
    | Record<string, { fr: string }>
    | undefined;
  return labels?.[subKey]?.fr ?? subKey;
};

/**
 * One allergen list of the questionnaire, as the console encodes it: three
 * answers, then the boxes when the answer is « Oui ». A checked category opens
 * its sub-list, with « Tous » first. « Autre » takes a text.
 *
 * The radio is plain HTML, and the boxes post through Radix's hidden inputs,
 * so the form submits without any handler of this component. The state here
 * only decides what is shown.
 */
export const AllergenField = ({ kind, noneKnown, rows }: Props) => {
  const names = allergenNames(kind);
  const keys: readonly string[] = kind === "allergy" ? allergens : intolerances;
  const labels: Record<string, { fr: string }> =
    kind === "allergy" ? allergenLabels : intoleranceLabels;

  const [state, setState] = useState<AllergenState>(stateOf(noneKnown, rows));
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => new Set(rows.map((row) => boxValue(row.key, row.subKey))),
  );
  const otherTexts = new Map(
    rows
      .filter((row) => row.otherText !== null)
      .map((row) => [row.key, row.otherText ?? ""]),
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

  // A category counts as open when it or any of its sub-boxes is checked.
  const isOpen = (key: string) =>
    [...checked].some((value) => value === key || value.startsWith(`${key}/`));

  const title = kind === "allergy" ? "Allergies" : "Intolérances";

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{title}</legend>
      <div
        className="flex flex-wrap gap-2"
        onChange={(event) => {
          const target = event.target as HTMLInputElement;
          if (target.name === names.state) {
            setState(target.value as AllergenState);
          }
        }}
      >
        <ChoiceChip
          name={names.state}
          value="unanswered"
          label="Non renseigné"
          defaultChecked={state === "unanswered"}
        />
        <ChoiceChip
          name={names.state}
          value="none_known"
          label={noneKnownLabels[kind].fr}
          defaultChecked={state === "none_known"}
        />
        <ChoiceChip
          name={names.state}
          value="declared"
          label="Oui, lesquelles"
          defaultChecked={state === "declared"}
        />
      </div>

      {state === "declared" ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {keys.map((key) => {
            const value = boxValue(key, null);
            const subList = kind === "allergy" ? subListOf(key) : [];
            const id = `${kind}-${key}`;
            return (
              <li key={key} className="flex flex-col gap-2">
                <label
                  htmlFor={id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    id={id}
                    name={names.item}
                    value={value}
                    checked={checked.has(value) || isOpen(key)}
                    onCheckedChange={(on) => toggle(value, on === true)}
                  />
                  {labels[key]?.fr ?? key}
                </label>
                {key === "other" && checked.has(value) ? (
                  <Input
                    name={names.other(key)}
                    aria-label={`${title} : autre`}
                    defaultValue={otherTexts.get(key) ?? ""}
                  />
                ) : null}
                {subList.length > 0 && isOpen(key) ? (
                  <ul className="border-border ml-6 flex flex-col gap-1.5 border-l pl-3">
                    {[ALL_SUB_KEY, ...subList].map((subKey) => {
                      const subValue = boxValue(key, subKey);
                      const subId = `${kind}-${key}-${subKey}`;
                      return (
                        <li key={subKey} className="flex flex-col gap-1.5">
                          <label
                            htmlFor={subId}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Checkbox
                              id={subId}
                              name={names.item}
                              value={subValue}
                              checked={checked.has(subValue)}
                              onCheckedChange={(on) =>
                                toggle(subValue, on === true)
                              }
                            />
                            {subLabelOf(key, subKey)}
                          </label>
                          {subKey === "other" && checked.has(subValue) ? (
                            <Input
                              name={names.other(key)}
                              aria-label={`${labels[key]?.fr ?? key} : autre`}
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
    </fieldset>
  );
};
