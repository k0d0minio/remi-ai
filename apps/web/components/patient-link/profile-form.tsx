"use client";

import { useState } from "react";
import {
  cookingAffinities,
  cookingTimes,
  foodBudgets,
  type CookingAffinity,
  type CookingTime,
  type FoodBudget,
  type PatientProfile,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Textarea, Typography } from "@remi/ui/server";
import { saveProfileAction, type WriteState } from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  /** The seven values as they stand — the form opens on them. */
  profile: Pick<
    PatientProfile,
    | "dietaryRegime"
    | "allergies"
    | "intolerances"
    | "preferences"
    | "likesCooking"
    | "cookingTime"
    | "foodBudget"
  >;
  content: Content["patientLink"];
};

/**
 * A select item cannot carry `""`, so « pas renseigné » is this word inside
 * the control and `""` in the hidden field the form actually posts.
 */
const UNSET = "unset";

type LevelProps<T extends string> = {
  id: string;
  name: string;
  label: string;
  levels: readonly T[];
  labels: Record<T, string>;
  unsetLabel: string;
  value: T | "";
  onChange: (value: T | "") => void;
};

const LevelSelect = <T extends string>({
  id,
  name,
  label,
  levels,
  labels,
  unsetLabel,
  value,
  onChange,
}: LevelProps<T>) => (
  <>
    <Field id={id} label={label}>
      <Select
        value={value === "" ? UNSET : value}
        onValueChange={(next) => onChange(next === UNSET ? "" : (next as T))}
      >
        <SelectTrigger id={id} className="min-h-11">
          <SelectValue placeholder={unsetLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>{unsetLabel}</SelectItem>
          {levels.map((level) => (
            <SelectItem key={level} value={level}>
              {labels[level]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
    <input type="hidden" name={name} value={value} />
  </>
);

/**
 * « Mon profil » — the seven fields the patient keeps true, saved together by
 * one « Enregistrer ».
 *
 * Every field is controlled for the meal form's reason: a refused save must
 * not wipe what the patient just changed, so nothing here resets on submit.
 * The page re-renders from the saved row on success, and the values already
 * on screen are exactly those.
 */
export const ProfileForm = ({ token, locale, profile, content }: Props) => {
  const text = content.profile;
  const [dietaryRegime, setDietaryRegime] = useState(profile.dietaryRegime);
  const [allergies, setAllergies] = useState(profile.allergies);
  const [intolerances, setIntolerances] = useState(profile.intolerances);
  const [preferences, setPreferences] = useState(profile.preferences);
  const [likesCooking, setLikesCooking] = useState<CookingAffinity | "">(
    profile.likesCooking ?? "",
  );
  const [cookingTime, setCookingTime] = useState<CookingTime | "">(
    profile.cookingTime ?? "",
  );
  const [foodBudget, setFoodBudget] = useState<FoodBudget | "">(
    profile.foodBudget ?? "",
  );
  const [state, setState] = useState<WriteState | null>(null);

  const texts = [
    {
      id: "profile-dietary-regime",
      name: "dietaryRegime",
      label: text.dietaryRegimeLabel,
      value: dietaryRegime,
      set: setDietaryRegime,
    },
    {
      id: "profile-allergies",
      name: "allergies",
      label: text.allergiesLabel,
      hint: text.allergiesHint,
      value: allergies,
      set: setAllergies,
    },
    {
      id: "profile-intolerances",
      name: "intolerances",
      label: text.intolerancesLabel,
      value: intolerances,
      set: setIntolerances,
    },
    {
      id: "profile-preferences",
      name: "preferences",
      label: text.preferencesLabel,
      hint: text.preferencesHint,
      value: preferences,
      set: setPreferences,
    },
  ];

  return (
    <form
      action={async (formData: FormData) => {
        setState(await saveProfileAction({ error: null }, formData));
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      {texts.map((field) => (
        <Field
          key={field.id}
          id={field.id}
          label={field.label}
          hint={field.hint}
        >
          <Textarea
            id={field.id}
            name={field.name}
            rows={2}
            maxLength={2000}
            value={field.value}
            onChange={(event) => field.set(event.target.value)}
          />
        </Field>
      ))}

      <LevelSelect
        id="profile-likes-cooking"
        name="likesCooking"
        label={text.likesCookingLabel}
        levels={cookingAffinities}
        labels={text.likesCooking}
        unsetLabel={text.unset}
        value={likesCooking}
        onChange={setLikesCooking}
      />
      <LevelSelect
        id="profile-cooking-time"
        name="cookingTime"
        label={text.cookingTimeLabel}
        levels={cookingTimes}
        labels={text.cookingTime}
        unsetLabel={text.unset}
        value={cookingTime}
        onChange={setCookingTime}
      />
      <LevelSelect
        id="profile-food-budget"
        name="foodBudget"
        label={text.foodBudgetLabel}
        levels={foodBudgets}
        labels={text.foodBudget}
        unsetLabel={text.unset}
        value={foodBudget}
        onChange={setFoodBudget}
      />

      <div className="flex flex-col items-start gap-2">
        <Button type="submit" variant="primary" className="min-h-11">
          {text.save}
        </Button>
        {state ? (
          <Typography
            size="sm"
            tone={state.error ? "default" : "muted"}
            className={state.error ? "text-error-text" : undefined}
            role="status"
          >
            {state.error ? text.errors[state.error] : text.saved}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
