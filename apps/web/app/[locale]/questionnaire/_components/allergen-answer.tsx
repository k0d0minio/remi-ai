"use client";

import { useState, type ReactNode } from "react";
import type { AllergenKind, PatientAllergen } from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { saveAllergensAction } from "@/lib/questionnaire/actions";
import {
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

type Option = { key: string; label: string };

type Props = {
  kind: AllergenKind;
  legend: ReactNode;
  hint: string;
  noneKnownLabel: string;
  /** The list's categories, « Autre » last. */
  options: readonly Option[];
  /** The « none known » flag: true, false (declared rows) or null. */
  initialNoneKnown: boolean | null;
  /** This list's saved rows. */
  initialRows: readonly PatientAllergen[];
};

const OTHER = "other";

type Answer =
  | { state: "unanswered" }
  | { state: "none_known" }
  | {
      state: "declared";
      items: { key: string; subKey: string | null; otherText: string | null }[];
    };

/**
 * The answer to send. A checked category keeps the rows already saved under
 * it, so a precision the practitioner or a later sub-list recorded is not
 * lost. « Autre » joins only with its text: without one it is not an answer.
 */
const answerOf = (
  noneKnown: boolean,
  checked: readonly string[],
  otherText: string,
  rows: readonly PatientAllergen[],
): Answer => {
  if (noneKnown) {
    return { state: "none_known" };
  }
  const items = checked.flatMap((key) => {
    if (key === OTHER) {
      const trimmed = otherText.trim();
      return trimmed ? [{ key, subKey: null, otherText: trimmed }] : [];
    }
    const kept = rows.filter((row) => row.key === key);
    return kept.length > 0
      ? kept.map((row) => ({
          key,
          subKey: row.subKey,
          otherText: row.otherText,
        }))
      : [{ key, subKey: null, otherText: null }];
  });
  return items.length > 0 ? { state: "declared", items } : { state: "unanswered" };
};

/**
 * One list, allergies or intolerances: « Aucune … connue », or the boxes the
 * patient checks. The two are exclusive. Unchecking everything returns the
 * list to « no answer », which is not « none known » (story 4, criterion 16).
 * The sub-lists, « Tous » and celiac disease come with
 * `allergy-intolerance-lists`.
 */
export const AllergenAnswer = ({
  kind,
  legend,
  hint,
  noneKnownLabel,
  options,
  initialNoneKnown,
  initialRows,
}: Props) => {
  const { text } = useQuestionnaire();
  const [noneKnown, setNoneKnown] = useState(initialNoneKnown === true);
  const [checked, setChecked] = useState<string[]>(() => [
    ...new Set(initialRows.map((row) => row.key)),
  ]);
  const [otherText, setOtherText] = useState(
    initialRows.find((row) => row.key === OTHER)?.otherText ?? "",
  );
  const initialAnswer = JSON.stringify(
    answerOf(noneKnown, checked, otherText, initialRows),
  );
  const { state, commit, schedule } = useAutosave(
    (next) => saveAllergensAction(kind, JSON.parse(next)),
    initialAnswer,
  );
  const serialise = (
    nextNone: boolean,
    nextChecked: readonly string[],
    nextText: string,
  ) =>
    JSON.stringify(answerOf(nextNone, nextChecked, nextText, initialRows));

  const toggleNone = (on: boolean) => {
    const nextChecked = on ? [] : checked;
    setNoneKnown(on);
    setChecked(nextChecked);
    void commit(serialise(on, nextChecked, otherText));
  };
  const toggle = (key: string, on: boolean) => {
    const nextChecked = on
      ? options.map((o) => o.key).filter((k) => k === key || checked.includes(k))
      : checked.filter((k) => k !== key);
    setNoneKnown(false);
    setChecked(nextChecked);
    void commit(serialise(false, nextChecked, otherText));
  };
  const typeOther = (value: string) => {
    setOtherText(value);
    schedule(serialise(false, checked, value));
  };

  const id = `questionnaire-${kind}`;
  const otherChecked = checked.includes(OTHER);

  return (
    <fieldset className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {legend}
      </Typography>
      <Typography as="p" size="sm" tone="muted">
        {hint}
      </Typography>
      <label
        htmlFor={`${id}-none`}
        className="border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2"
      >
        <Checkbox
          id={`${id}-none`}
          checked={noneKnown}
          onCheckedChange={(value) => toggleNone(value === true)}
        />
        <Typography as="span" size="sm" weight="medium">
          {noneKnownLabel}
        </Typography>
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.key}
            htmlFor={`${id}-${option.key}`}
            className="border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2"
          >
            <Checkbox
              id={`${id}-${option.key}`}
              checked={checked.includes(option.key)}
              onCheckedChange={(value) => toggle(option.key, value === true)}
            />
            <Typography as="span" size="sm">
              {option.label}
            </Typography>
          </label>
        ))}
      </div>
      {otherChecked ? (
        <Field
          id={`${id}-other-text`}
          label={text.labels.otherText}
          hint={otherText.trim() ? undefined : text.hints.otherText}
        >
          <Input
            id={`${id}-other-text`}
            size="lg"
            value={otherText}
            onChange={(event) => typeOther(event.target.value)}
            onBlur={() =>
              void commit(serialise(false, checked, otherText))
            }
          />
        </Field>
      ) : null}
      {state.kind === "error" ? (
        <Typography as="p" size="sm" className="text-error-text">
          {text.errors[state.error]}
        </Typography>
      ) : null}
      <SaveStatus state={state} />
    </fieldset>
  );
};
