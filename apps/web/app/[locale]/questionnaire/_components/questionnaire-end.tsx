"use client";

import { useEffect, useState, type ReactNode } from "react";
import NextLink from "next/link";
import { CalendarDays, CircleCheck, UserRound } from "lucide-react";
import {
  formatDayInWords,
  localePath,
  type Locale,
  type MandatoryQuestionnaireField,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { HOME_PATH } from "@/lib/patient-auth/paths";
import { consultationDayAction } from "@/lib/questionnaire/actions";
import { QuestionnaireActions } from "./questionnaire-actions";

/**
 * Where the end screen stands. `checking`: the last saves and the read of the
 * file are in flight. `failed`: a save or the read did not reach the server.
 * `checked`: the server answered, and `missing` is its answer.
 */
export type EndState = "checking" | "failed" | "checked";

type Props = {
  locale: Locale;
  text: Content["questionnaire"];
  state: EndState;
  /** The mandatory fields the server still misses. Read only when `checked`. */
  missing: readonly MandatoryQuestionnaireField[];
  onRetry: () => void;
  /** Opens the step of a missing field, on that question. */
  onOpenField: (field: MandatoryQuestionnaireField) => void;
  /** Returns to the questions. Every saved answer stays. */
  onBack: () => void;
};

type StepProps = {
  number: number;
  title: string;
  last?: boolean;
  children: ReactNode;
};

/**
 * One step of the vertical timeline: a numbered circle, and a thin line down
 * to the next circle.
 */
const NextStep = ({ number, title, last, children }: StepProps) => (
  <li className="relative flex gap-4 pb-8 last:pb-0">
    {last ? null : (
      <span
        aria-hidden
        className="absolute top-10 bottom-2 left-4 w-px -translate-x-1/2 bg-primary-border"
      />
    )}
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
    >
      {number}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
      <Typography as="h3" size="base" weight="semibold">
        {title}
      </Typography>
      {children}
    </div>
  </li>
);

/**
 * The ready screen: what happens after the questionnaire, in three steps.
 * The consultation day is read again from the server after the last saves.
 * Finishing gives no access to the recipes: « Terminer » leads to the home,
 * which sends a patient who is not active yet to the waiting screen.
 */
const ReadyEnd = ({
  locale,
  text,
  onBack,
}: Pick<Props, "locale" | "text" | "onBack">) => {
  const end = text.end;
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    const read = async () => {
      let next: string | null = null;
      try {
        next = await consultationDayAction();
      } catch {
        // No day on screen: the rest of the page stays true without it.
      }
      if (current) {
        setDay(next);
      }
    };
    void read();
    return () => {
      current = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="questionnaire-end-title"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <CircleCheck
            aria-hidden
            className="mt-1 size-7 shrink-0 text-success"
            strokeWidth={2}
          />
          <Typography
            as="h1"
            id="questionnaire-end-title"
            size="2xl"
            weight="semibold"
          >
            {end.readyTitle}
          </Typography>
        </div>
        <Typography as="p" size="base">
          {end.readyBody}
        </Typography>
      </div>

      <div className="flex flex-col gap-6">
        <Typography as="h2" size="lg" weight="semibold">
          {end.nextTitle}
        </Typography>
        <ol className="flex flex-col">
          <NextStep number={1} title={end.steps.consultation.title}>
            <div className="flex flex-col gap-2 rounded-2xl bg-primary-subtle p-4">
              {day ? (
                <div className="flex items-center gap-3">
                  <CalendarDays
                    aria-hidden
                    className="size-5 shrink-0 text-primary"
                  />
                  <Typography as="p" size="base" weight="semibold">
                    {formatDayInWords(day)}
                  </Typography>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <UserRound aria-hidden className="size-5 shrink-0 text-primary" />
                <Typography as="p" size="base">
                  {end.withPractitioner}
                </Typography>
              </div>
            </div>
            <Typography as="p" size="base" tone="muted">
              {end.steps.consultation.body}
            </Typography>
          </NextStep>
          <NextStep number={2} title={end.steps.recommendations.title}>
            <Typography as="p" size="base" tone="muted">
              {end.steps.recommendations.body}
            </Typography>
          </NextStep>
          <NextStep number={3} title={end.steps.activation.title} last>
            <Typography as="p" size="base" tone="muted">
              {end.steps.activation.body}
            </Typography>
          </NextStep>
        </ol>
      </div>

      <Typography
        as="p"
        size="base"
        weight="semibold"
        className="text-center text-primary"
        balance
      >
        {end.closing}
      </Typography>

      <QuestionnaireActions
        primary={
          <Button asChild size="lg">
            <NextLink href={localePath(locale, HOME_PATH)}>
              {end.finish}
            </NextLink>
          </Button>
        }
        links={
          <Button type="button" variant="link" size="sm" onClick={onBack}>
            {end.edit}
          </Button>
        }
      />
    </section>
  );
};

/**
 * The end of the questionnaire (REM-168). « Tout est prêt pour ta
 * consultation ! » shows only after the server confirmed the saves and found
 * nothing mandatory missing. With a missing field, the screen lists each one with a link to its
 * question. Before the server answered, it shows the save state and neither
 * conclusion.
 */
export const QuestionnaireEnd = ({
  locale,
  text,
  state,
  missing,
  onRetry,
  onOpenField,
  onBack,
}: Props) => {
  if (state !== "checked") {
    return (
      <section aria-live="polite" className="flex flex-col gap-4">
        {state === "checking" ? (
          <Typography as="p" size="sm" tone="muted">
            {text.saving}
          </Typography>
        ) : (
          <>
            <Typography as="p" size="base" className="text-error-text">
              {text.errors.unavailable}
            </Typography>
            <div className="flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={onRetry}>
                {text.retry}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onBack}
              >
                {text.end.back}
              </Button>
            </div>
          </>
        )}
      </section>
    );
  }

  if (missing.length === 0) {
    return <ReadyEnd locale={locale} text={text} onBack={onBack} />;
  }

  return (
    <section
      aria-labelledby="questionnaire-end-title"
      className="flex flex-col gap-4"
    >
      <Typography
        as="h1"
        id="questionnaire-end-title"
        size="2xl"
        weight="semibold"
      >
        {text.end.incompleteTitle}
      </Typography>
      <Typography as="p" size="base">
        {text.end.incompleteBody}
      </Typography>
      <ul className="flex flex-col">
        {missing.map((field) => (
          <li key={field}>
            <Button
              type="button"
              variant="link"
              className="h-auto min-h-12 px-0 text-base"
              onClick={() => onOpenField(field)}
            >
              {text.labels.mandatory[field]}
            </Button>
          </li>
        ))}
      </ul>
      <div>
        <Button type="button" size="lg" onClick={onBack}>
          {text.end.back}
        </Button>
      </div>
    </section>
  );
};
