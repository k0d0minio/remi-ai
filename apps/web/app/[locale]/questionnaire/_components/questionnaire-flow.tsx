"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  intoleranceLabels,
  intolerances,
  mandatoryQuestionnaireFieldLabels,
  noneKnownLabels,
  sexesForCalculation,
  sexForCalculationLabels,
  type Locale,
  type MandatoryQuestionnaireField,
  type PatientAllergen,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Progress, Typography } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { checkCompletionAction } from "@/lib/questionnaire/actions";
import {
  anchorOfField,
  END_STEP,
  hasMandatoryField,
  isQuestionnaireStep,
  questionnaireSections,
  resumeSection,
  sectionOfField,
  STEP_COOKIE,
  type QuestionnaireSection,
  type QuestionnaireStep,
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
  type Saver,
} from "./questionnaire-context";
import { QuestionnaireEnd, type EndState } from "./questionnaire-end";
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
  initialMissing: readonly MandatoryQuestionnaireField[];
  /** Where the page opens when the URL names no step. */
  initialStep: QuestionnaireStep;
};

/** One year. The cookie holds a step key only, never an answer. */
const STEP_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

/**
 * The preparatory questionnaire (story 4), as a guided journey (REM-156): a
 * progress bar, « Étape X sur 6 », one step at a time, and « Précédent » and
 * « Continuer » under each step. The URL names the step, but every step stays
 * mounted: what the patient typed stays on screen when they move. No step
 * blocks the next one. The mandatory fields count only on the end screen
 * (REM-168), which the last « Continuer » opens.
 */
export const QuestionnaireFlow = ({
  locale,
  text,
  values,
  geneticConsent,
  initialMissing,
  initialStep,
}: Props) => {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("section");
  const step = isQuestionnaireStep(fromUrl) ? fromUrl : initialStep;
  const [missing, setMissing] = useState(initialMissing);
  // The page read `initialMissing` on the server, so a first render on the end
  // screen is already checked.
  const [end, setEnd] = useState<EndState>("checked");
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

  const savers = useRef(new Map<string, Saver>());
  const register = (id: string, saver: Saver) => {
    savers.current.set(id, saver);
    return () => {
      savers.current.delete(id);
    };
  };
  const onSettled = (result: SaveResult) => {
    if (result.ok) {
      setMissing(result.missing);
      return;
    }
    // A save that did not reach the server ends any earlier confirmation.
    if (result.error === "unavailable" || result.error === "signed_out") {
      setEnd("failed");
    }
  };

  // The question to show after the step changes, or null for the page's top.
  const target = useRef<string | null>(null);
  const shown = useRef(step);
  useEffect(() => {
    if (shown.current === step) {
      return;
    }
    shown.current = step;
    const element = target.current
      ? document.getElementById(target.current)
      : null;
    target.current = null;
    if (element) {
      element.scrollIntoView({ block: "start" });
      element.focus({ preventScroll: true });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [step]);

  // The App Router follows `pushState`: the back button returns to the
  // previous step, and `useSearchParams` reads the new one. The cookie keeps
  // the step for the next visit.
  const open = (next: QuestionnaireStep, anchor: string | null = null) => {
    target.current = anchor;
    document.cookie = `${STEP_COOKIE}=${next}; path=/; max-age=${STEP_COOKIE_MAX_AGE}; samesite=lax`;
    window.history.pushState(null, "", `?section=${next}`);
  };

  /**
   * Sends each failed save again, waits for every save, then reads the file
   * again on the server. The end screen shows a conclusion only when no save
   * failed and the read answered.
   */
  const check = async () => {
    setEnd("checking");
    await Promise.all(
      [...savers.current.values()].map(async (saver) => {
        await saver.retry();
        await saver.flush();
      }),
    );
    if ([...savers.current.values()].some((saver) => saver.failed())) {
      setEnd("failed");
      return;
    }
    let result: SaveResult;
    try {
      result = await checkCompletionAction();
    } catch {
      result = { ok: false, error: "unavailable" };
    }
    if (!result.ok) {
      setEnd("failed");
      return;
    }
    setMissing(result.missing);
    setEnd("checked");
  };
  const finish = () => {
    open(END_STEP);
    void check();
  };

  const label = (field: MandatoryQuestionnaireField) =>
    mandatoryQuestionnaireFieldLabels[field][locale];

  // Null on the end screen. The six steps stay mounted there, hidden: a
  // patient who returns to a step finds what they typed.
  const section = step === END_STEP ? null : step;
  const index = section ? questionnaireSections.indexOf(section) : -1;
  const total = questionnaireSections.length;
  const previous = questionnaireSections[index - 1];
  const next = questionnaireSections[index + 1];
  const stepLabel = fill(text.step, { current: index + 1, total });

  return (
    <QuestionnaireProvider value={{ locale, text, onSettled, register }}>
      <div className="flex flex-col gap-6">
        {section ? (
          <header className="flex flex-col gap-4">
            <Typography as="h1" size="2xl" weight="semibold">
              {text.title}
            </Typography>
            {index === 0 ? (
              <Typography as="p" size="base" tone="muted">
                {text.intro}
              </Typography>
            ) : null}
            <div className="flex flex-col gap-2">
              <Progress
                value={((index + 1) / total) * 100}
                label={text.progressLabel}
                aria-valuetext={stepLabel}
              />
              <Typography as="p" size="sm" tone="muted">
                {stepLabel}
              </Typography>
            </div>
          </header>
        ) : (
          <QuestionnaireEnd
            locale={locale}
            text={text}
            state={end}
            missing={missing}
            onRetry={() => void check()}
            onOpenField={(field) =>
              open(sectionOfField[field], anchorOfField[field])
            }
            onBack={() => open(resumeSection(missing))}
          />
        )}

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

        {section && hasMandatoryField(section) ? (
          <Typography as="p" size="xs" tone="muted">
            {text.mandatoryLegend}
          </Typography>
        ) : null}

        {section ? (
          <div className="flex justify-between gap-3">
            {previous ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => open(previous)}
              >
                {text.previous}
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              size="lg"
              onClick={next ? () => open(next) : finish}
            >
              {text.next}
            </Button>
          </div>
        ) : null}
      </div>
    </QuestionnaireProvider>
  );
};

type SectionProps = {
  /** Null on the end screen: every step is hidden. */
  current: QuestionnaireSection | null;
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
