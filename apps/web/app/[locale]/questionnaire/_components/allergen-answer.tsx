"use client";

import { useState, type ReactNode } from "react";
import {
  ALL_SUB_KEY,
  type AllergenKind,
  type PatientAllergen,
} from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { saveAllergensAction } from "@/lib/questionnaire/actions";
import {
  refusalOf,
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
  /**
   * The sub-list under each category that has one, without « Tous ». The
   * intolerance list has none.
   */
  subLists?: Readonly<Record<string, readonly Option[]>>;
  /** « Tous ». */
  allLabel: string;
  /** The « none known » flag: true, false (declared rows) or null. */
  initialNoneKnown: boolean | null;
  /** This list's saved rows. */
  initialRows: readonly PatientAllergen[];
};

const OTHER = "other";

/** The top-level « Autre » text sits under this key, a sub-list's under its category. */
const TOP_OTHER = "";

/** What the patient has ticked and typed, before it becomes an answer. */
type Draft = {
  noneKnown: boolean;
  /** The ticked categories. */
  checked: readonly string[];
  /** Per category, the ticked sub-keys. `all` stands alone. */
  subs: Readonly<Record<string, readonly string[]>>;
  /** The « Autre » texts. */
  texts: Readonly<Record<string, string>>;
};

type Item = { key: string; subKey: string | null; otherText: string | null };

type Answer =
  | { state: "unanswered" }
  | { state: "none_known" }
  | { state: "declared"; items: Item[] };

/** The saved rows as the boxes show them. A bare category with a sub-list reads as « Tous ». */
const draftOf = (
  noneKnown: boolean | null,
  rows: readonly PatientAllergen[],
  subLists: Props["subLists"],
): Draft => {
  const subs: Record<string, string[]> = {};
  const texts: Record<string, string> = {};
  for (const row of rows) {
    const subKey =
      row.subKey === null && subLists?.[row.key] ? ALL_SUB_KEY : row.subKey;
    if (subKey !== null) {
      subs[row.key] = [...(subs[row.key] ?? []), subKey];
    }
    if (row.otherText !== null) {
      texts[subKey === OTHER ? row.key : TOP_OTHER] = row.otherText;
    }
  }
  return {
    noneKnown: noneKnown === true,
    checked: [...new Set(rows.map((row) => row.key))],
    subs,
    texts,
  };
};

/**
 * One category's rows. « Tous » stands alone. A sub-list « Autre » joins only
 * with its text. A category with no sub-choice is sent bare, and the service
 * stores it as « Tous »: no precision excludes the whole category (story 4,
 * criterion 14).
 */
const itemsOf = (draft: Draft, key: string, hasSubList: boolean): Item[] => {
  if (key === OTHER) {
    const text = (draft.texts[TOP_OTHER] ?? "").trim();
    return text ? [{ key, subKey: null, otherText: text }] : [];
  }
  if (!hasSubList) {
    return [{ key, subKey: null, otherText: null }];
  }
  const ticked = draft.subs[key] ?? [];
  if (ticked.includes(ALL_SUB_KEY)) {
    return [{ key, subKey: ALL_SUB_KEY, otherText: null }];
  }
  const items = ticked.flatMap((subKey): Item[] => {
    if (subKey !== OTHER) {
      return [{ key, subKey, otherText: null }];
    }
    const text = (draft.texts[key] ?? "").trim();
    return text ? [{ key, subKey, otherText: text }] : [];
  });
  return items.length > 0 ? items : [{ key, subKey: null, otherText: null }];
};

/** Unticking every box returns the list to « no answer », never to « none known ». */
const answerOf = (
  draft: Draft,
  options: readonly Option[],
  subLists: Props["subLists"],
): Answer => {
  if (draft.noneKnown) {
    return { state: "none_known" };
  }
  const items = options
    .filter((option) => draft.checked.includes(option.key))
    .flatMap((option) =>
      itemsOf(draft, option.key, Boolean(subLists?.[option.key])),
    );
  return items.length > 0 ? { state: "declared", items } : { state: "unanswered" };
};

const boxClass =
  "border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

type BoxProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
  strong?: boolean;
};

const Box = ({ id, label, checked, disabled, onChange, strong }: BoxProps) => (
  <label htmlFor={id} className={boxClass}>
    <Checkbox
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(value) => onChange(value === true)}
    />
    <Typography as="span" size="sm" weight={strong ? "medium" : "normal"}>
      {label}
    </Typography>
  </label>
);

/**
 * One list, allergies or intolerances (story 4, `allergy-intolerance-lists`):
 * « Aucune … connue », or the boxes the patient ticks. « Aucune … connue »
 * unticks and locks the rest of its list. A ticked category with a sub-list
 * opens it, « Tous » first, and « Tous » locks the individual boxes.
 */
export const AllergenAnswer = ({
  kind,
  legend,
  hint,
  noneKnownLabel,
  options,
  subLists,
  allLabel,
  initialNoneKnown,
  initialRows,
}: Props) => {
  const { text } = useQuestionnaire();
  const [draft, setDraft] = useState(() =>
    draftOf(initialNoneKnown, initialRows, subLists),
  );
  const serialise = (next: Draft) =>
    JSON.stringify(answerOf(next, options, subLists));
  const { state, commit, schedule, retry } = useAutosave(
    (next) => saveAllergensAction(kind, JSON.parse(next)),
    serialise(draftOf(initialNoneKnown, initialRows, subLists)),
  );
  const refusal = refusalOf(state, text);
  const apply = (next: Draft) => {
    setDraft(next);
    void commit(serialise(next));
  };

  const toggleNone = (on: boolean) =>
    apply(
      on
        ? { ...draft, noneKnown: true, checked: [], subs: {} }
        : { ...draft, noneKnown: false },
    );
  const toggle = (key: string, on: boolean) => {
    // Unticking a category drops its sub-choices. Ticking it starts clean.
    const subs = Object.fromEntries(
      Object.entries(draft.subs).filter(([k]) => k !== key),
    );
    apply({
      ...draft,
      noneKnown: false,
      checked: on
        ? [...draft.checked, key]
        : draft.checked.filter((k) => k !== key),
      subs,
    });
  };
  const toggleSub = (key: string, subKey: string, on: boolean) => {
    const ticked = draft.subs[key] ?? [];
    const next =
      subKey === ALL_SUB_KEY
        ? on
          ? [ALL_SUB_KEY]
          : []
        : on
          ? [...ticked, subKey]
          : ticked.filter((k) => k !== subKey);
    apply({ ...draft, subs: { ...draft.subs, [key]: next } });
  };
  const typeText = (slot: string, value: string) => {
    const next = { ...draft, texts: { ...draft.texts, [slot]: value } };
    setDraft(next);
    schedule(serialise(next));
  };

  const id = `questionnaire-${kind}`;

  const otherField = (slot: string, fieldId: string) => {
    const value = draft.texts[slot] ?? "";
    return (
      <Field
        id={fieldId}
        label={text.labels.otherText}
        hint={value.trim() ? undefined : text.hints.otherText}
      >
        <Input
          id={fieldId}
          size="lg"
          value={value}
          onChange={(event) => typeText(slot, event.target.value)}
          onBlur={() => void commit(serialise(draft))}
        />
      </Field>
    );
  };

  const subListOf = (option: Option, subOptions: readonly Option[]) => {
    const ticked = draft.subs[option.key] ?? [];
    const all = ticked.includes(ALL_SUB_KEY);
    return (
      <div
        role="group"
        aria-label={option.label}
        className="border-border col-span-full ml-4 flex flex-col gap-2 border-l pl-4"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Box
            id={`${id}-${option.key}-${ALL_SUB_KEY}`}
            label={allLabel}
            checked={all}
            strong
            onChange={(on) => toggleSub(option.key, ALL_SUB_KEY, on)}
          />
          {subOptions.map((sub) => (
            <Box
              key={sub.key}
              id={`${id}-${option.key}-${sub.key}`}
              label={sub.label}
              checked={!all && ticked.includes(sub.key)}
              disabled={all}
              onChange={(on) => toggleSub(option.key, sub.key, on)}
            />
          ))}
        </div>
        {!all && ticked.includes(OTHER)
          ? otherField(option.key, `${id}-${option.key}-other-text`)
          : null}
      </div>
    );
  };

  return (
    <fieldset id={id} tabIndex={-1} className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {legend}
      </Typography>
      <Typography as="p" size="sm" tone="muted">
        {hint}
      </Typography>
      <Box
        id={`${id}-none`}
        label={noneKnownLabel}
        checked={draft.noneKnown}
        strong
        onChange={toggleNone}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = draft.checked.includes(option.key);
          const subOptions = subLists?.[option.key];
          return (
            <div key={option.key} className="contents">
              <Box
                id={`${id}-${option.key}`}
                label={option.label}
                checked={checked}
                disabled={draft.noneKnown}
                onChange={(on) => toggle(option.key, on)}
              />
              {checked && subOptions ? subListOf(option, subOptions) : null}
            </div>
          );
        })}
      </div>
      {draft.checked.includes(OTHER)
        ? otherField(TOP_OTHER, `${id}-other-text`)
        : null}
      {refusal ? (
        <Typography as="p" size="sm" className="text-error-text">
          {refusal}
        </Typography>
      ) : null}
      <SaveStatus state={state} onRetry={() => void retry()} />
    </fieldset>
  );
};
