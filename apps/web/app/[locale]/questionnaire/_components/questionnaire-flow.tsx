"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  activityLevelDetails,
  activityLevels,
  dietLabels,
  diets,
  sexesForCalculation,
  sexForCalculationLabels,
  type Locale,
  type MandatoryQuestionnaireField,
  type PatientAllergen,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Progress, Typography } from "@remi/ui/server";
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
import { DateAnswer } from "./date-answer";
import { DietAnswer } from "./diet-answer";
import { GeneticSection, type GeneticValues } from "./genetic-section";
import { IdentitySection, type IdentityValues } from "./identity-section";
import {
  MandatoryLabel,
  OptionalLabel,
  QuestionnaireProvider,
  type Saver,
} from "./questionnaire-context";
import { QuestionnaireEnd, type EndState } from "./questionnaire-end";
import { TextAnswer } from "./text-answer";

/** The saved answers as the form shows them. `""` is « Non renseigné ». */
export type QuestionnaireValues = GeneticValues &
  IdentityValues & {
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
  medications: string;
  supplements: string;
  noKnownAllergies: boolean | null;
  noKnownIntolerances: boolean | null;
  allergens: readonly PatientAllergen[];
};

type Props = {
  locale: Locale;
  text: Content["questionnaire"];
  /** The texts of a date field (REM-159). */
  dateText: Content["dateEntry"];
  values: QuestionnaireValues;
  /** The genetic consent text, rendered on the server. */
  geneticConsent: ConsentStepText;
  initialMissing: readonly MandatoryQuestionnaireField[];
  /** Where the page opens when the URL names no step. */
  initialStep: QuestionnaireStep;
};

/** One year. The cookie holds a step key only, never an answer. */
const STEP_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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
  dateText,
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

  // The patient's own labels (REM-160). The console keeps its labels.
  const label = (field: MandatoryQuestionnaireField) =>
    text.labels.mandatory[field];

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
          <IdentitySection values={values} dateText={dateText} />
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
            numeric="integer"
            label={<MandatoryLabel label={label("heightCm")} />}
            hint={text.hints.height}
            initial={values.heightCm}
          />
          <TextAnswer
            field="weightKg"
            numeric="decimal"
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
            numeric="decimal"
            label={<OptionalLabel label={text.labels.desiredWeight} />}
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
          {/* The practitioner's date when the file holds one, empty if not. */}
          <DateAnswer
            field="consultationDate"
            label={text.labels.consultationDate}
            dateText={dateText}
            initial={values.consultationDate}
          />
        </Section>

        <Section
          current={section}
          name="alimentation"
          title={text.sections.alimentation}
        >
          <DietAnswer
            legend={text.labels.diet}
            initialDiet={values.diet}
            initialNote={values.dietNote}
            options={diets.map((value) => ({
              value,
              label: dietLabels[value][locale],
            }))}
          />
          <AllergenAnswer
            kind="allergy"
            legend={<MandatoryLabel label={text.food.allergiesQuestion} />}
            hint={text.food.allergiesHint}
            initialNoneKnown={values.noKnownAllergies}
            initialRows={values.allergens.filter(
              (row) => row.kind === "allergy",
            )}
          />
          <AllergenAnswer
            kind="intolerance"
            legend={<MandatoryLabel label={label("intolerances")} />}
            hint={text.hints.intolerances}
            initialNoneKnown={values.noKnownIntolerances}
            initialRows={values.allergens.filter(
              (row) => row.kind === "intolerance",
            )}
          />
        </Section>

        <Section current={section} name="sante" title={text.sections.sante}>
          {/* Three questions (REM-165). Coeliac disease goes in the first
              one, and the practitioner confirms it in the console. */}
          <TextAnswer
            field="pathologies"
            multiline
            label={text.health.pathologies}
            placeholder={text.health.pathologiesPlaceholder}
            initial={values.pathologies}
          />
          <TextAnswer
            field="medications"
            multiline
            label={<OptionalLabel label={text.health.medications} />}
            placeholder={text.health.medicationsPlaceholder}
            initial={values.medications}
          />
          <TextAnswer
            field="supplements"
            multiline
            label={<OptionalLabel label={text.health.supplements} />}
            placeholder={text.health.supplementsPlaceholder}
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
