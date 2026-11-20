"use client";

import { useState } from "react";
import {
  activityLevelDetails,
  activityLevels,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  allSubKeyLabel,
  dietLabels,
  diets,
  intoleranceLabels,
  intolerances,
  noneKnownLabels,
  type Locale,
  type PatientAllergen,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { AllergenAnswer } from "@/app/[locale]/questionnaire/_components/allergen-answer";
import { ChoiceAnswer } from "@/app/[locale]/questionnaire/_components/choice-answer";
import { DietAnswer } from "@/app/[locale]/questionnaire/_components/diet-answer";
import {
  OptionalLabel,
  QuestionnaireProvider,
} from "@/app/[locale]/questionnaire/_components/questionnaire-context";
import { TextAnswer } from "@/app/[locale]/questionnaire/_components/text-answer";
import type { Content } from "@/lib/content/types";
import type { SaveResult } from "@/lib/questionnaire/state";

/** The saved answers as the editors show them. `""` is « Non renseigné ». */
export type ProfileDataValues = {
  activityLevel: string;
  desiredWeightKg: string;
  diet: string;
  dietNote: string;
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
  allergens: readonly PatientAllergen[];
  medications: string;
  supplements: string;
};

type Props = {
  locale: Locale;
  /** The questionnaire's texts: the editors are the questionnaire's own. */
  questionnaire: Content["questionnaire"];
  text: Content["patientPersonalData"]["dataPage"];
  values: ProfileDataValues;
};

/** The allergy sub-lists in the patient's language, each in the story's order. */
const subListsOf = (locale: Locale) =>
  Object.fromEntries(
    Object.entries(allergenSubLists).map(([key, subKeys]) => {
      const labels = allergenSubLabels[
        key as keyof typeof allergenSubLabels
      ] as Record<string, Record<Locale, string>>;
      return [
        key,
        subKeys.map((subKey) => ({
          key: subKey,
          label: labels[subKey][locale],
        })),
      ];
    }),
  );

const nothing = () => undefined;

/** The page has no end screen, so no answer waits for a flush. */
const register = () => nothing;

/**
 * The data that the patient keeps up to date after the questionnaire (story
 * 21, REM-85). It does not rebuild the editors: it mounts the questionnaire's
 * own answers, each with its own save. Those saves read the patient's id from
 * the session and go through `savePatientQuestionnaire`,
 * `savePatientProfileAnswers` and `setPatientAllergens`, which record each
 * change for the practitioner. No save here writes a recommendation.
 *
 * Two providers, because a save reports to its provider with no field name:
 * the first group is the diet and the two lists, and a save there shows the
 * sentence that the change applies at once.
 */
export const ProfileDataEditor = ({
  locale,
  questionnaire,
  text,
  values,
}: Props) => {
  const [foodSaved, setFoodSaved] = useState(false);
  const onFoodSettled = (result: SaveResult) => setFoodSaved(result.ok);
  const labels = questionnaire.labels;

  return (
    <div className="flex flex-col gap-10">
      <QuestionnaireProvider
        value={{
          locale,
          text: questionnaire,
          onSettled: onFoodSettled,
          register,
        }}
      >
        <section
          aria-labelledby="profile-data-food"
          className="flex flex-col gap-6"
        >
          <Typography
            as="h2"
            id="profile-data-food"
            size="lg"
            weight="semibold"
          >
            {text.foodTitle}
          </Typography>
          <DietAnswer
            legend={labels.diet}
            initialDiet={values.diet}
            initialNote={values.dietNote}
            options={diets.map((value) => ({
              value,
              label: dietLabels[value][locale],
            }))}
          />
          <AllergenAnswer
            kind="allergy"
            legend={labels.mandatory.allergies}
            hint={questionnaire.hints.allergies}
            noneKnownLabel={noneKnownLabels.allergy[locale]}
            options={allergens.map((key) => ({
              key,
              label: allergenLabels[key][locale],
            }))}
            subLists={subListsOf(locale)}
            allLabel={allSubKeyLabel[locale]}
            initialNoneKnown={values.noKnownAllergies}
            initialRows={values.allergens.filter(
              (row) => row.kind === "allergy",
            )}
          />
          <AllergenAnswer
            kind="intolerance"
            legend={labels.mandatory.intolerances}
            hint={questionnaire.hints.intolerances}
            noneKnownLabel={noneKnownLabels.intolerance[locale]}
            options={intolerances.map((key) => ({
              key,
              label: intoleranceLabels[key][locale],
            }))}
            allLabel={allSubKeyLabel[locale]}
            initialNoneKnown={values.noKnownIntolerances}
            initialRows={values.allergens.filter(
              (row) => row.kind === "intolerance",
            )}
          />
          <Typography as="p" size="sm" weight="medium" role="status">
            {foodSaved ? text.foodSaved : ""}
          </Typography>
        </section>
      </QuestionnaireProvider>

      <QuestionnaireProvider
        value={{
          locale,
          text: questionnaire,
          onSettled: nothing,
          register,
        }}
      >
        <section
          aria-labelledby="profile-data-other"
          className="flex flex-col gap-6"
        >
          <Typography
            as="h2"
            id="profile-data-other"
            size="lg"
            weight="semibold"
          >
            {text.otherTitle}
          </Typography>
          <ChoiceAnswer
            field="activityLevel"
            legend={labels.mandatory.activityLevel}
            initial={values.activityLevel}
            options={activityLevels.map((value) => ({
              value,
              label: activityLevelDetails[value].label[locale],
              description: activityLevelDetails[value].description[locale],
            }))}
          />
          <TextAnswer
            field="desiredWeightKg"
            numeric="decimal"
            label={<OptionalLabel label={labels.desiredWeight} />}
            hint={questionnaire.hints.desiredWeight}
            initial={values.desiredWeightKg}
          />
          <TextAnswer
            field="medications"
            multiline
            label={<OptionalLabel label={labels.medications} />}
            hint={questionnaire.hints.medications}
            initial={values.medications}
          />
          <TextAnswer
            field="supplements"
            multiline
            label={<OptionalLabel label={labels.supplements} />}
            hint={questionnaire.hints.supplements}
            initial={values.supplements}
          />
        </section>
      </QuestionnaireProvider>
    </div>
  );
};
