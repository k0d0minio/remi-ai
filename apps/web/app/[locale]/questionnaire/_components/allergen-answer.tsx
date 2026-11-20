"use client";

import { useState, type ReactNode } from "react";
import {
  ALL_SUB_KEY,
  allergenOptionOfRow,
  allergenOptions,
  allergenRowLabel,
  allSubKeyLabel,
  noneKnownLabels,
  uncategorisedAllergenRows,
  type AllergenKind,
  type AllergenOption,
  type PatientAllergen,
} from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { saveAllergensAction } from "@/lib/questionnaire/actions";
import {
  MandatoryLabel,
  refusalOf,
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

type Props = {
  kind: AllergenKind;
  legend: ReactNode;
  hint: string;
  /** The « none known » flag: true, false (declared rows) or null. */
  initialNoneKnown: boolean | null;
  /** This list's saved rows. */
  initialRows: readonly PatientAllergen[];
};

const OTHER = "other";

/** The top-level « Autre » text sits under this key, a sub-list's under its category. */
const TOP_OTHER = "";

/**
 * A stored row that no box of the list holds (`uncategorisedAllergenRows`). It
 * shows as a ticked box of its own, and a save sends it again as it is: a
 * declared allergy is never lost.
 */
type Kept = { id: string; label: string; item: Item };

const keptId = (row: Pick<PatientAllergen, "key" | "subKey">) =>
  `kept:${row.key}/${row.subKey ?? ""}`;

/** What the patient has ticked and typed, before it becomes an answer. */
type Draft = {
  noneKnown: boolean;
  /** The ids of the ticked boxes, the kept rows included. */
  checked: readonly string[];
  /** Per family box, the ticked sub-keys. `all` stands alone. */
  subs: Readonly<Record<string, readonly string[]>>;
  /** The « Autre » texts. */
  texts: Readonly<Record<string, string>>;
};

type Item = { key: string; subKey: string | null; otherText: string | null };

type Answer =
  | { state: "unanswered" }
  | { state: "none_known" }
  | { state: "declared"; items: Item[] };

/** The saved rows as the boxes show them. A bare family with a sub-list reads as « Tous ». */
const draftOf = (
  kind: AllergenKind,
  noneKnown: boolean | null,
  rows: readonly PatientAllergen[],
): Draft => {
  const checked = new Set<string>();
  const subs: Record<string, string[]> = {};
  const texts: Record<string, string> = {};
  for (const row of rows) {
    const option = allergenOptionOfRow(kind, row);
    if (!option) {
      checked.add(keptId(row));
      continue;
    }
    checked.add(option.id);
    // A member box (« Blé ») is its row: it has no sub-choice and no text.
    if (option.subKey !== null) {
      continue;
    }
    const subKey =
      row.subKey === null && option.subList.length > 0
        ? ALL_SUB_KEY
        : row.subKey;
    if (subKey !== null) {
      subs[option.id] = [...(subs[option.id] ?? []), subKey];
    }
    if (row.otherText !== null) {
      texts[subKey === OTHER ? option.id : TOP_OTHER] = row.otherText;
    }
  }
  return { noneKnown: noneKnown === true, checked: [...checked], subs, texts };
};

/**
 * One box's rows. A member box is its one row. « Tous » stands alone. A
 * sub-list « Autre » joins only with its text. A family with no sub-choice is
 * sent bare, and the service stores it as « Tous »: no precision excludes the
 * whole family (story 4, criterion 14).
 */
const itemsOf = (draft: Draft, option: AllergenOption): Item[] => {
  const { key } = option;
  if (option.subKey !== null) {
    return [{ key, subKey: option.subKey, otherText: null }];
  }
  if (key === OTHER) {
    const text = (draft.texts[TOP_OTHER] ?? "").trim();
    return text ? [{ key, subKey: null, otherText: text }] : [];
  }
  if (option.subList.length === 0) {
    return [{ key, subKey: null, otherText: null }];
  }
  const ticked = draft.subs[option.id] ?? [];
  if (ticked.includes(ALL_SUB_KEY)) {
    return [{ key, subKey: ALL_SUB_KEY, otherText: null }];
  }
  const items = ticked.flatMap((subKey): Item[] => {
    if (subKey !== OTHER) {
      return [{ key, subKey, otherText: null }];
    }
    const text = (draft.texts[option.id] ?? "").trim();
    return text ? [{ key, subKey, otherText: text }] : [];
  });
  return items.length > 0 ? items : [{ key, subKey: null, otherText: null }];
};

/** Unticking every box returns the list to « no answer », never to « none known ». */
const answerOf = (
  draft: Draft,
  options: readonly AllergenOption[],
  kept: readonly Kept[],
): Answer => {
  if (draft.noneKnown) {
    return { state: "none_known" };
  }
  const items = [
    ...kept
      .filter((row) => draft.checked.includes(row.id))
      .map((row) => row.item),
    ...options
      .filter((option) => draft.checked.includes(option.id))
      .flatMap((option) => itemsOf(draft, option)),
  ];
  return items.length > 0 ? { state: "declared", items } : { state: "unanswered" };
};

const boxClass =
  "border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

type BoxProps = {
  id: string;
  label: string;
  /** A short explanation under the label (REM-164). */
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
  strong?: boolean;
};

const Box = ({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
  strong,
}: BoxProps) => (
  <label htmlFor={id} className={boxClass}>
    <Checkbox
      id={id}
      checked={checked}
      disabled={disabled}
      aria-describedby={description ? `${id}-description` : undefined}
      onCheckedChange={(value) => onChange(value === true)}
    />
    <span className="flex min-w-0 flex-col gap-0.5">
      <Typography as="span" size="sm" weight={strong ? "medium" : "normal"}>
        {label}
      </Typography>
      {description ? (
        <Typography id={`${id}-description`} as="span" size="xs" tone="muted">
          {description}
        </Typography>
      ) : null}
    </span>
  </label>
);

/**
 * One list, allergies or intolerances (story 4, `allergy-intolerance-lists`):
 * « Aucune … connue », or the boxes the patient ticks. « Aucune … connue »
 * unticks and locks the rest of its list. A ticked family with a sub-list
 * opens it, « Tous » first, and « Tous » locks the individual boxes. The boxes
 * come from `allergenOptions` (REM-163, REM-164), the same list as the console.
 */
export const AllergenAnswer = ({
  kind,
  legend,
  hint,
  initialNoneKnown,
  initialRows,
}: Props) => {
  const { text, locale } = useQuestionnaire();
  const options = allergenOptions(kind);
  // Fixed for the mount: an unticked kept row stays on screen, so the patient
  // can tick it again.
  const [kept] = useState<readonly Kept[]>(() =>
    uncategorisedAllergenRows(kind, initialRows).map((row) => ({
      id: keptId(row),
      label: allergenRowLabel(kind, row),
      item: { key: row.key, subKey: row.subKey, otherText: row.otherText },
    })),
  );
  const [draft, setDraft] = useState(() =>
    draftOf(kind, initialNoneKnown, initialRows),
  );
  const serialise = (next: Draft) =>
    JSON.stringify(answerOf(next, options, kept));
  const { state, commit, schedule, retry } = useAutosave(
    (next) => saveAllergensAction(kind, JSON.parse(next)),
    serialise(draftOf(kind, initialNoneKnown, initialRows)),
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
    // Unticking a family drops its sub-choices. Ticking it starts clean.
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
        label={<MandatoryLabel label={text.labels.otherText} />}
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

  const subListOf = (option: AllergenOption) => {
    const ticked = draft.subs[option.id] ?? [];
    const all = ticked.includes(ALL_SUB_KEY);
    return (
      <div
        role="group"
        aria-label={option.label[locale]}
        className="border-border col-span-full ml-4 flex flex-col gap-2 border-l pl-4"
      >
        <Typography as="p" size="xs" tone="muted">
          {text.food.familyRule}
        </Typography>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Box
            id={`${id}-${option.key}-${ALL_SUB_KEY}`}
            label={allSubKeyLabel[locale]}
            checked={all}
            strong
            onChange={(on) => toggleSub(option.id, ALL_SUB_KEY, on)}
          />
          {option.subList.map((sub) => (
            <Box
              key={sub.key}
              id={`${id}-${option.key}-${sub.key}`}
              label={sub.label[locale]}
              checked={!all && ticked.includes(sub.key)}
              disabled={all}
              onChange={(on) => toggleSub(option.id, sub.key, on)}
            />
          ))}
        </div>
        {!all && ticked.includes(OTHER)
          ? otherField(option.id, `${id}-${option.key}-other-text`)
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
        label={noneKnownLabels[kind][locale]}
        checked={draft.noneKnown}
        strong
        onChange={toggleNone}
      />
      {kept.length > 0 ? (
        <div
          role="group"
          aria-label={text.food.alsoDeclared}
          className="flex flex-col gap-2"
        >
          <Typography as="p" size="xs" tone="muted">
            {text.food.alsoDeclared}
          </Typography>
          {kept.map((row, index) => (
            <Box
              key={row.id}
              id={`${id}-kept-${index}`}
              label={row.label}
              checked={draft.checked.includes(row.id)}
              disabled={draft.noneKnown}
              onChange={(on) => toggle(row.id, on)}
            />
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = draft.checked.includes(option.id);
          const boxId = `${id}-${option.id.replace("/", "-")}`;
          return (
            <div key={option.id} className="contents">
              <Box
                id={boxId}
                label={option.label[locale]}
                description={option.description?.[locale]}
                checked={checked}
                disabled={draft.noneKnown}
                onChange={(on) => toggle(option.id, on)}
              />
              {checked && option.subList.length > 0
                ? subListOf(option)
                : null}
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
