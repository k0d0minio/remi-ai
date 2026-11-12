"use client";

import { useState, useTransition } from "react";
import {
  amy1aCategories,
  apoeGenotypes,
  dio2Categories,
  geneticTestAnswerLabels,
  geneticTestAnswers,
  optionalQuestionnaireFieldLabels,
  type ConsentDecision,
  type Locale,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import type { ConsentStepText } from "@/components/signup/consent-step";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { decideGeneticConsentAction } from "@/lib/questionnaire/actions";
import type { GeneticConsentDecision } from "@/lib/questionnaire/state";
import { ChoiceAnswer } from "./choice-answer";
import { OptionalLabel } from "./questionnaire-context";

/** The section's saved state, as the page read it. `""` is « Non renseigné ». */
export type GeneticValues = {
  geneticTest: string;
  /** The latest genetic consent decision, or null when there is none. */
  geneticConsent: ConsentDecision | null;
  apoe: string;
  dio2: string;
  amy1a: string;
};

type Genotype = Pick<GeneticValues, "apoe" | "dio2" | "amy1a">;

const emptyGenotype: Genotype = { apoe: "", dio2: "", amy1a: "" };

type Props = {
  locale: Locale;
  text: Content["questionnaire"];
  values: GeneticValues;
  /** The genetic consent text, rendered on the server. */
  consent: ConsentStepText;
};

/**
 * « Génétique » (story 4, `genotype-section`). The test question first. « Oui »
 * shows the genetic consent. A `given` consent shows the APOE, DIO2 and AMY1A
 * lists, one choice each, nothing pre-selected. « Non / Je ne sais pas » hides
 * the rest: the service keeps the values and leaves them out of every read
 * and every calculation. The whole section is optional.
 */
export const GeneticSection = ({ locale, text, values, consent }: Props) => {
  const [answer, setAnswer] = useState(values.geneticTest);
  const [decision, setDecision] = useState(values.geneticConsent);
  // The lists remount when they show again: they start from the last choice.
  const [genotype, setGenotype] = useState<Genotype>({
    apoe: values.apoe,
    dio2: values.dio2,
    amy1a: values.amy1a,
  });
  const decided = (next: GeneticConsentDecision) => {
    setDecision(next);
    // A refusal empties the three fields on the server.
    if (next !== "given") {
      setGenotype(emptyGenotype);
    }
  };

  return (
    <>
      <ChoiceAnswer
        field="geneticTest"
        legend={<OptionalLabel label={text.labels.geneticTest} />}
        initial={values.geneticTest}
        onSelect={setAnswer}
        options={geneticTestAnswers.map((value) => ({
          value,
          label: geneticTestAnswerLabels[value][locale],
        }))}
      />
      {answer === "yes" ? (
        decision === "given" ? (
          <GenotypeLists
            text={text}
            locale={locale}
            genotype={genotype}
            onChange={(field, value) =>
              setGenotype((current) => ({ ...current, [field]: value }))
            }
          />
        ) : (
          <GeneticConsentPanel
            text={text}
            consent={consent}
            refused={decision === "refused"}
            onDecided={decided}
          />
        )
      ) : null}
    </>
  );
};

type PanelProps = {
  text: Content["questionnaire"];
  consent: ConsentStepText;
  refused: boolean;
  onDecided: (decision: GeneticConsentDecision) => void;
};

/**
 * The genetic consent text and two buttons. Each tap records the decision with
 * the version and the language shown. After « Je refuse » the text and
 * « J'accepte » stay, so the patient can change their mind.
 */
const GeneticConsentPanel = ({
  text,
  consent,
  refused,
  onDecided,
}: PanelProps) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const decide = (decision: GeneticConsentDecision) => {
    setError(null);
    startTransition(async () => {
      const result = await decideGeneticConsentAction(
        decision,
        consent.version,
        consent.locale,
      );
      if (result.ok) {
        onDecided(result.decision);
        return;
      }
      setError(
        result.error === "signed_out"
          ? text.errors.signed_out
          : text.genetic.decisionFailed,
      );
    });
  };
  const titleId = "genetic-consent-title";

  return (
    <section
      aria-labelledby={titleId}
      className="border-border flex flex-col gap-3 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <Typography as="h3" id={titleId} size="base" weight="semibold">
          {text.genetic.consentTitle}
        </Typography>
        <Typography size="xs" tone="muted">
          {fill(text.genetic.version, {
            version: consent.version,
            date: consent.date,
          })}
        </Typography>
      </div>
      <Typography size="sm" tone="muted">
        {text.genetic.consentIntro}
      </Typography>

      {/* Focusable so a keyboard can scroll it. Wide tables scroll inside it, never the page. */}
      <div
        lang={consent.lang}
        role="region"
        aria-label={text.genetic.consentTitle}
        tabIndex={0}
        className="border-border max-h-72 overflow-y-auto overflow-x-hidden rounded-sm border p-3 [&_table]:block [&_table]:overflow-x-auto"
      >
        {consent.body}
      </div>

      {refused ? (
        <Typography size="sm" role="status">
          {text.genetic.refused}
        </Typography>
      ) : null}
      {error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {error}
        </Typography>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          className="min-h-11"
          disabled={pending}
          onClick={() => decide("given")}
        >
          {pending ? text.genetic.deciding : text.genetic.accept}
        </Button>
        {refused ? null : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11"
            disabled={pending}
            onClick={() => decide("refused")}
          >
            {text.genetic.refuse}
          </Button>
        )}
      </div>
    </section>
  );
};

const genotypeLists = [
  { field: "apoe", values: apoeGenotypes },
  { field: "dio2", values: dio2Categories },
  { field: "amy1a", values: amy1aCategories },
] as const;

type ListsProps = {
  text: Content["questionnaire"];
  locale: Locale;
  genotype: Genotype;
  onChange: (field: keyof Genotype, value: string) => void;
};

/** One radio group per gene. A tap saves it. An unanswered list stays empty. */
const GenotypeLists = ({ text, locale, genotype, onChange }: ListsProps) => (
  <div className="flex flex-col gap-6">
    <Typography as="p" size="sm" tone="muted">
      {text.genetic.listsIntro}
    </Typography>
    {genotypeLists.map(({ field, values }) => (
      <ChoiceAnswer
        key={field}
        field={field}
        legend={
          <OptionalLabel
            label={optionalQuestionnaireFieldLabels[field][locale]}
          />
        }
        initial={genotype[field]}
        onSelect={(value) => onChange(field, value)}
        options={values.map((value) => ({ value, label: value }))}
      />
    ))}
  </div>
);
