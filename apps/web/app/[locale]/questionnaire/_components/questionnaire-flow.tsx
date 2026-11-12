"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
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
  fileStatusLabels,
  intoleranceLabels,
  intolerances,
  mandatoryQuestionnaireFieldLabels,
  noneKnownLabels,
  sexesForCalculation,
  sexForCalculationLabels,
  type FileStatus,
  type Locale,
  type MandatoryQuestionnaireField,
  type PatientAllergen,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, Field, Input, Typography } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";
import type { Content } from "@/lib/content/types";
import {
  isQuestionnaireSection,
  questionnaireSections,
  sectionOfField,
  type QuestionnaireSection,
} from "@/lib/questionnaire/sections";
import type { SaveResult } from "@/lib/questionnaire/state";
import { AllergenAnswer } from "./allergen-answer";
import { ChoiceAnswer } from "./choice-answer";
import { FlagAnswer } from "./flag-answer";
import { GeneticSection, type GeneticValues } from "./genetic-section";
import {
  MandatoryLabel,
  OptionalLabel,
  QuestionnaireProvider,
} from "./questionnaire-context";
import { TextAnswer } from "./text-answer";

/** The saved answers as the form shows them. `""` is « Non renseigné ». */
export type QuestionnaireValues = GeneticValues & {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  sexForCalculation: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
  desiredWeightKg: string;
  consultationReason: string;
  consultationDate: string;
  diet: string;
  dietNote: string;
  pathologies: string;
  celiacDisease: boolean | null;
  medications: string;
  supplements: string;
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
  allergens: readonly PatientAllergen[];
};

type Props = {
  locale: Locale;
  text: Content["questionnaire"];
  values: QuestionnaireValues;
  /** The genetic consent text, rendered on the server. */
  geneticConsent: ConsentStepText;
  initialStatus: FileStatus;
  initialMissing: readonly MandatoryQuestionnaireField[];
  /** Where the page opens when the URL names no section. */
  initialSection: QuestionnaireSection;
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

const statusIntent = {
  to_complete: "warning",
  ready: "success",
  to_validate: "info",
  active: "info",
} as const satisfies Record<FileStatus, "warning" | "success" | "info">;

/**
 * The preparatory questionnaire (story 4). One section shows at a time and the
 * URL names it, but every section stays mounted: what the patient typed stays
 * on screen when they move between sections. Each answer saves on its own, and
 * the header follows the file's status after each save.
 */
export const QuestionnaireFlow = ({
  locale,
  text,
  values,
  geneticConsent,
  initialStatus,
  initialMissing,
  initialSection,
}: Props) => {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("section");
  const section = isQuestionnaireSection(fromUrl) ? fromUrl : initialSection;
  const [status, setStatus] = useState(initialStatus);
  const [missing, setMissing] = useState(initialMissing);
  const [diet, setDiet] = useState(values.diet || "none");
  // A diet other than « Autre » clears the saved note: a note shown again
  // starts empty.
  const [dietNote, setDietNote] = useState(values.dietNote);
  const selectDiet = (value: string) => {
    setDiet(value);
    if (value !== "other") {
      setDietNote("");
    }
  };

  const onSettled = (result: SaveResult) => {
    if (result.ok) {
      setStatus(result.status);
      setMissing(result.missing);
    }
  };
  // The App Router follows `pushState`: the back button returns to the
  // previous section, and `useSearchParams` reads the new one.
  const open = (next: QuestionnaireSection) => {
    window.history.pushState(null, "", `?section=${next}`);
    window.scrollTo({ top: 0 });
  };
  const index = questionnaireSections.indexOf(section);
  const previous = questionnaireSections[index - 1];
  const next = questionnaireSections[index + 1];
  const label = (field: MandatoryQuestionnaireField) =>
    mandatoryQuestionnaireFieldLabels[field][locale];

  return (
    <QuestionnaireProvider value={{ locale, text, onSettled }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Typography as="h1" size="2xl" weight="semibold">
            {text.title}
          </Typography>
          <Typography as="p" size="sm" tone="muted">
            {text.intro}
          </Typography>
          <div className="flex flex-wrap items-center gap-2">
            <Typography as="span" size="sm" weight="medium">
              {text.statusLabel}
            </Typography>
            <Badge variant={statusIntent[status]} tone="subtle">
              {fileStatusLabels[status][locale]}
            </Badge>
          </div>
          <div aria-live="polite" className="flex flex-col gap-1">
            {missing.length === 0 ? (
              <Typography as="p" size="sm">
                {text.complete}
              </Typography>
            ) : (
              <>
                <Typography as="p" size="sm" weight="medium">
                  {text.missingTitle}
                </Typography>
                <ul className="flex flex-wrap gap-x-3 gap-y-1">
                  {missing.map((field) => (
                    <li key={field}>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto min-h-11 px-0"
                        onClick={() => open(sectionOfField[field])}
                      >
                        {label(field)}
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <Typography as="p" size="xs" tone="muted">
            {text.mandatoryLegend}
          </Typography>
        </header>

        <nav aria-label={text.sectionsLabel}>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {questionnaireSections.map((key) => (
              <li key={key} className="shrink-0">
                <Button
                  type="button"
                  variant={key === section ? "primary" : "outline"}
                  className="min-h-11"
                  aria-current={key === section ? "step" : undefined}
                  onClick={() => open(key)}
                >
                  {text.sections[key]}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <Section
          current={section}
          name="identite"
          title={text.sections.identite}
        >
          <TextAnswer
            field="firstName"
            label={text.labels.firstName}
            initial={values.firstName}
            autoComplete="given-name"
          />
          <TextAnswer
            field="lastName"
            label={text.labels.lastName}
            initial={values.lastName}
            autoComplete="family-name"
          />
          <TextAnswer
            field="birthDate"
            type="date"
            label={text.labels.birthDate}
            initial={values.birthDate}
            autoComplete="bday"
          />
          <Field
            id="questionnaire-email"
            label={text.labels.email}
            hint={text.hints.email}
          >
            <Input
              id="questionnaire-email"
              type="email"
              size="lg"
              value={values.email}
              readOnly
            />
          </Field>
          <TextAnswer
            field="phone"
            type="tel"
            inputMode="tel"
            label={text.labels.phone}
            initial={values.phone}
            autoComplete="tel"
          />
        </Section>

        <Section current={section} name="profil" title={text.sections.profil}>
          <ChoiceAnswer
            field="sexForCalculation"
            legend={<MandatoryLabel label={label("sexForCalculation")} />}
            initial={values.sexForCalculation}
            options={sexesForCalculation.map((value) => ({
              value,
              label: sexForCalculationLabels[value][locale],
            }))}
          />
          <TextAnswer
            field="heightCm"
            inputMode="numeric"
            label={<MandatoryLabel label={label("heightCm")} />}
            hint={text.hints.height}
            initial={values.heightCm}
          />
          <TextAnswer
            field="weightKg"
            inputMode="decimal"
            label={<MandatoryLabel label={label("weightKg")} />}
            hint={text.hints.weight}
            initial={values.weightKg}
          />
          <ChoiceAnswer
            field="activityLevel"
            legend={<MandatoryLabel label={label("activityLevel")} />}
            initial={values.activityLevel}
            options={activityLevels.map((value) => ({
              value,
              label: activityLevelDetails[value].label[locale],
              description: activityLevelDetails[value].description[locale],
            }))}
          />
          <TextAnswer
            field="desiredWeightKg"
            inputMode="decimal"
            label={text.labels.desiredWeight}
            hint={text.hints.desiredWeight}
            initial={values.desiredWeightKg}
          />
        </Section>

        <Section
          current={section}
          name="consultation"
          title={text.sections.consultation}
        >
          <TextAnswer
            field="consultationReason"
            multiline
            label={<MandatoryLabel label={label("consultationReason")} />}
            initial={values.consultationReason}
          />
          <TextAnswer
            field="consultationDate"
            type="date"
            label={text.labels.consultationDate}
            initial={values.consultationDate}
          />
        </Section>

        <Section
          current={section}
          name="alimentation"
          title={text.sections.alimentation}
        >
          <ChoiceAnswer
            field="diet"
            legend={text.labels.diet}
            hint={text.hints.dietDefault}
            initial={values.diet}
            shownByDefault="none"
            onSelect={selectDiet}
            options={diets.map((value) => ({
              value,
              label: dietLabels[value][locale],
            }))}
          />
          {diet === "other" ? (
            <TextAnswer
              field="dietNote"
              label={text.labels.dietNote}
              initial={dietNote}
            />
          ) : null}
          <AllergenAnswer
            kind="allergy"
            legend={<MandatoryLabel label={label("allergies")} />}
            hint={text.hints.allergies}
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
            legend={<MandatoryLabel label={label("intolerances")} />}
            hint={text.hints.intolerances}
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
        </Section>

        <Section current={section} name="sante" title={text.sections.sante}>
          <FlagAnswer
            field="celiacDisease"
            label={text.labels.celiacDisease}
            hint={text.hints.celiacDisease}
            initial={values.celiacDisease}
          />
          <TextAnswer
            field="pathologies"
            multiline
            label={text.labels.pathologies}
            initial={values.pathologies}
          />
          <TextAnswer
            field="medications"
            multiline
            label={<OptionalLabel label={text.labels.medications} />}
            hint={text.hints.medications}
            initial={values.medications}
          />
          <TextAnswer
            field="supplements"
            multiline
            label={<OptionalLabel label={text.labels.supplements} />}
            hint={text.hints.supplements}
            initial={values.supplements}
          />
        </Section>

        <Section
          current={section}
          name="genetique"
          title={text.sections.genetique}
        >
          <GeneticSection
            locale={locale}
            text={text}
            values={values}
            consent={geneticConsent}
          />
        </Section>

        <div className="flex justify-between gap-3">
          {previous ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11"
              onClick={() => open(previous)}
            >
              {text.previous}
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button
              type="button"
              size="lg"
              className="min-h-11"
              onClick={() => open(next)}
            >
              {text.next}
            </Button>
          ) : null}
        </div>
      </div>
    </QuestionnaireProvider>
  );
};

type SectionProps = {
  current: QuestionnaireSection;
  name: QuestionnaireSection;
  title: string;
  children: ReactNode;
};

/** Hidden, not unmounted, so a field keeps what the patient typed. */
const Section = ({ current, name, title, children }: SectionProps) => (
  <section
    hidden={current !== name}
    aria-labelledby={`questionnaire-section-${name}`}
    className={current === name ? "flex flex-col gap-6" : "hidden"}
  >
    <Typography
      as="h2"
      id={`questionnaire-section-${name}`}
      size="lg"
      weight="semibold"
    >
      {title}
    </Typography>
    {children}
  </section>
);
