"use client";

import { useState } from "react";
import {
  cookingAffinities,
  cookingTimes,
  foodBudgets,
  type PatientProfile,
} from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  ChoiceChip,
  Field,
  Input,
  Textarea,
  Typography,
} from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  updateProfileAction,
  type WriteState,
} from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  patient: PatientProfile;
  content: Content["patientLink"];
};

type ChoiceGroupProps<T extends string> = {
  name: string;
  label: string;
  hint?: string;
  /** `null` is « Non renseigné », which is a real answer and starts selected. */
  current: T | null;
  options: readonly T[];
  labels: Record<T, string>;
  notRecorded: string;
};

/**
 * One closed set as a row of chips, generic in its own vocabulary.
 *
 * Generic rather than three near-identical blocks, and generic rather than one
 * array of three configs: an array would make `labels` a union of three
 * `Record`s and `options` a union of three tuples, and indexing one with the
 * other is exactly the mistake the type system should catch. The parameter
 * keeps each call site's vocabulary tied to its own label map.
 */
const ChoiceGroup = <T extends string>({
  name,
  label,
  hint,
  current,
  options,
  labels,
  notRecorded,
}: ChoiceGroupProps<T>) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-1">
      <Typography as="span" size="sm" weight="medium">
        {label}
      </Typography>
    </legend>
    {hint ? (
      <Typography size="xs" tone="muted">
        {hint}
      </Typography>
    ) : null}
    <div className="flex flex-wrap gap-2">
      <ChoiceChip
        name={name}
        value=""
        label={notRecorded}
        defaultChecked={current === null}
      />
      {options.map((option) => (
        <ChoiceChip
          key={option}
          name={name}
          value={option}
          label={labels[option]}
          defaultChecked={current === option}
        />
      ))}
    </div>
  </fieldset>
);

/**
 * The seven fields § A marks patient-supplied, as one form the patient saves
 * once.
 *
 * Uncontrolled, and that is the difference from the meal form: this form edits
 * a record that already exists rather than composing a new row, so React's
 * reset-on-success is exactly right — it re-reads the defaults, which are the
 * values that were just saved. The meal form had to hold its text in state
 * because a refused write would otherwise wipe what the patient typed; here a
 * refusal leaves the DOM untouched and the fields keep what they hold.
 *
 * The three closed sets are chips rather than selects for the reason the meal
 * slot is: this is opened from a WhatsApp message on a phone, and a chip is one
 * tap where a select is three. Each group carries « Non renseigné » first and
 * checked when nothing is on file, so "not asked yet" stays a visible answer
 * rather than being collapsed into the first level.
 */
export const ProfileForm = ({ token, locale, patient, content }: Props) => {
  const [state, setState] = useState<WriteState>({ error: null });
  const [saved, setSaved] = useState(false);
  const copy = content.profile;

  return (
    <form
      action={async (formData: FormData) => {
        const result = await updateProfileAction({ error: null }, formData);
        setState(result);
        setSaved(!result.error);
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      <Field id="profile-regime" label={copy.regimeLabel}>
        <Input
          id="profile-regime"
          name="dietaryRegime"
          maxLength={200}
          placeholder={copy.regimePlaceholder}
          defaultValue={patient.dietaryRegime}
        />
      </Field>

      <Field
        id="profile-allergies"
        label={copy.allergiesLabel}
        hint={copy.allergiesHint}
      >
        <Input
          id="profile-allergies"
          name="allergies"
          maxLength={200}
          placeholder={copy.allergiesPlaceholder}
          defaultValue={patient.allergies}
        />
      </Field>

      <Field id="profile-intolerances" label={copy.intolerancesLabel}>
        <Input
          id="profile-intolerances"
          name="intolerances"
          maxLength={200}
          placeholder={copy.intolerancesPlaceholder}
          defaultValue={patient.intolerances}
        />
      </Field>

      <Field id="profile-preferences" label={copy.preferencesLabel}>
        <Textarea
          id="profile-preferences"
          name="preferences"
          rows={2}
          maxLength={200}
          placeholder={copy.preferencesPlaceholder}
          defaultValue={patient.preferences}
        />
      </Field>

      <ChoiceGroup
        name="likesCooking"
        label={copy.likesCookingLabel}
        current={patient.likesCooking}
        options={cookingAffinities}
        labels={copy.likesCooking}
        notRecorded={copy.notRecorded}
      />

      <ChoiceGroup
        name="cookingTime"
        label={copy.cookingTimeLabel}
        hint={copy.cookingTimeHint}
        current={patient.cookingTime}
        options={cookingTimes}
        labels={copy.cookingTimes}
        notRecorded={copy.notRecorded}
      />

      <ChoiceGroup
        name="foodBudget"
        label={copy.budgetLabel}
        current={patient.foodBudget}
        options={foodBudgets}
        labels={copy.budgets}
        notRecorded={copy.notRecorded}
      />

      {state.error ? (
        <Alert variant="error">
          <AlertDescription>{copy.errors[state.error]}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" className="min-h-11">
          {copy.save}
        </Button>
        {saved && !state.error ? (
          <Typography size="sm" tone="muted">
            {copy.saved}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
