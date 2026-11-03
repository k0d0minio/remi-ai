"use client";

import type { ReactNode } from "react";
import type {
  PatientAllergen,
  PatientQuestionnaire,
} from "@remi/services/shared";
import {
  activityLevelDetails,
  activityLevels,
  amy1aCategories,
  apoeGenotypes,
  dietLabels,
  diets,
  dio2Categories,
  geneticTestAnswerLabels,
  geneticTestAnswers,
  sexesForCalculation,
  sexForCalculationLabels,
} from "@remi/services/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { AllergenField } from "@/components/patients/allergen-field";
import { UNSET, UNSET_LABEL } from "@/lib/patients/questionnaire-form";

type Props = {
  /** The stored answers. Absent on « Nouveau patient »: every field is empty. */
  answers?: PatientQuestionnaire;
  allergens?: readonly PatientAllergen[];
  /** Taille and poids live on the profile. The questionnaire asks them here. */
  heightCm: number | null;
  weightKg: number | null;
  /** The patient gave the genetic consent. Locked without it. */
  genotypeOpen: boolean;
};

/** The hint of a field of `mandatoryQuestionnaireFields`. */
const MANDATORY = "Obligatoire pour « Prêt pour consultation ».";

type Option = { value: string; label: string };

/** A select with « Non renseigné » first. `UNSET` posts as a cleared field. */
const ChoiceSelect = ({
  id,
  value,
  options,
}: {
  id: string;
  value: string | null | undefined;
  options: readonly Option[];
}) => (
  <Select name={id} defaultValue={value ?? UNSET}>
    <SelectTrigger id={id}>
      <SelectValue placeholder={UNSET_LABEL} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={UNSET}>{UNSET_LABEL}</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const plain = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <Typography as="h3" variant="eyebrow" tone="muted">
      {title}
    </Typography>
    {children}
  </div>
);

/**
 * Every field of the preparatory questionnaire, in the questionnaire's order
 * (story 4): Profil, Consultation, Alimentation, Santé, Génétique, Question du
 * praticien. The labels and keys come from `shared/questionnaire.ts`, so the
 * console and the patient's pages offer the same choices (story 1: « exactement
 * comme si le patient s'était inscrit lui-même »).
 *
 * Nothing here is `required`: the file saves with missing fields, and the file
 * page lists them.
 */
export const QuestionnaireFields = ({
  answers,
  allergens = [],
  heightCm,
  weightKg,
  genotypeOpen,
}: Props) => (
  <div className="flex flex-col gap-6">
    <Section title="Profil">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="sexForCalculation"
          label="Sexe utilisé pour le calcul"
          hint={MANDATORY}
        >
          <ChoiceSelect
            id="sexForCalculation"
            value={answers?.sexForCalculation}
            options={sexesForCalculation.map((sex) => ({
              value: sex,
              label: sexForCalculationLabels[sex].fr,
            }))}
          />
        </Field>

        <Field
          id="activityLevel"
          label="Niveau d'activité physique"
          hint={MANDATORY}
        >
          <ChoiceSelect
            id="activityLevel"
            value={answers?.activityLevel}
            options={activityLevels.map((level) => ({
              value: level,
              label: activityLevelDetails[level].label.fr,
            }))}
          />
        </Field>

        <Field id="heightCm" label="Taille (cm)" hint={MANDATORY}>
          <Input
            id="heightCm"
            name="heightCm"
            type="number"
            inputMode="numeric"
            min={1}
            max={280}
            defaultValue={heightCm ?? ""}
          />
        </Field>

        <Field id="weightKg" label="Poids actuel (kg)" hint={MANDATORY}>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={1}
            max={500}
            defaultValue={weightKg ?? ""}
          />
        </Field>

        <Field id="desiredWeightKg" label="Poids souhaité (kg)" optional>
          <Input
            id="desiredWeightKg"
            name="desiredWeightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={1}
            max={500}
            defaultValue={answers?.desiredWeightKg ?? ""}
          />
        </Field>
      </div>
    </Section>

    <Section title="Consultation">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="consultationReason"
          label="Motif de consultation"
          hint={MANDATORY}
          className="sm:col-span-2"
        >
          <Textarea
            id="consultationReason"
            name="consultationReason"
            rows={3}
            defaultValue={answers?.consultationReason ?? ""}
          />
        </Field>

        <Field id="consultationDate" label="Date de consultation" optional>
          <Input
            id="consultationDate"
            name="consultationDate"
            type="date"
            defaultValue={answers?.consultationDate ?? ""}
          />
        </Field>
      </div>
    </Section>

    <Section title="Alimentation">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="diet" label="Régime alimentaire" optional>
          <ChoiceSelect
            id="diet"
            value={answers?.diet}
            options={diets.map((diet) => ({
              value: diet,
              label: dietLabels[diet].fr,
            }))}
          />
        </Field>

        <Field
          id="dietNote"
          label="Précision sur le régime"
          optional
          hint="Pour « Autre », ou une nuance du régime choisi."
        >
          <Input
            id="dietNote"
            name="dietNote"
            defaultValue={answers?.dietNote ?? ""}
          />
        </Field>
      </div>

      <AllergenField
        kind="allergy"
        noneKnown={answers?.noKnownAllergies ?? null}
        rows={allergens.filter((row) => row.kind === "allergy")}
      />
      <AllergenField
        kind="intolerance"
        noneKnown={answers?.noKnownIntolerances ?? null}
        rows={allergens.filter((row) => row.kind === "intolerance")}
      />
      <Typography size="sm" tone="muted">
        {MANDATORY} Une réponse explicite par liste : « Aucune … connue » ou au
        moins une case.
      </Typography>
    </Section>

    <Section title="Santé">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pathologies"
          label="Pathologies"
          optional
          className="sm:col-span-2"
        >
          <Textarea
            id="pathologies"
            name="pathologies"
            rows={3}
            defaultValue={answers?.pathologies ?? ""}
          />
        </Field>

        <Field id="celiacDisease" label="Maladie cœliaque" optional>
          <ChoiceSelect
            id="celiacDisease"
            value={
              answers?.celiacDisease === true
                ? "yes"
                : answers?.celiacDisease === false
                  ? "no"
                  : null
            }
            options={[
              { value: "yes", label: "Oui" },
              { value: "no", label: "Non" },
            ]}
          />
        </Field>
      </div>
    </Section>

    <Section title="Génétique">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="geneticTest"
          label="Test génétique APOE, DIO2 et AMY1A réalisé"
          optional
          className="sm:col-span-2"
        >
          <ChoiceSelect
            id="geneticTest"
            value={answers?.geneticTest}
            options={geneticTestAnswers.map((answer) => ({
              value: answer,
              label: geneticTestAnswerLabels[answer].fr,
            }))}
          />
        </Field>

        {genotypeOpen ? (
          <>
            <Field id="apoe" label="APOE" optional>
              <ChoiceSelect
                id="apoe"
                value={answers?.apoe}
                options={plain(apoeGenotypes)}
              />
            </Field>
            <Field id="dio2" label="DIO2" optional>
              <ChoiceSelect
                id="dio2"
                value={answers?.dio2}
                options={plain(dio2Categories)}
              />
            </Field>
            <Field id="amy1a" label="AMY1A" optional>
              <ChoiceSelect
                id="amy1a"
                value={answers?.amy1a}
                options={plain(amy1aCategories)}
              />
            </Field>
          </>
        ) : (
          // Not rendered at all: a disabled select still posts, and the
          // action refuses a genotype without the consent.
          <Typography size="sm" tone="muted" className="sm:col-span-2">
            APOE, DIO2 et AMY1A restent verrouillés jusqu&apos;au consentement
            génétique du patient.
          </Typography>
        )}
      </div>
    </Section>

    <Section title="Question du praticien">
      <Field
        id="practitionerQuestionAnswer"
        label="Réponse du patient"
        optional
      >
        <Textarea
          id="practitionerQuestionAnswer"
          name="practitionerQuestionAnswer"
          rows={3}
          defaultValue={answers?.practitionerQuestionAnswer ?? ""}
        />
      </Field>
    </Section>
  </div>
);
