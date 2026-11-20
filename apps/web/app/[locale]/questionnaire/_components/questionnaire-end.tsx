"use client";

import NextLink from "next/link";
import {
  localePath,
  mandatoryQuestionnaireFieldLabels,
  type Locale,
  type MandatoryQuestionnaireField,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { HOME_PATH } from "@/lib/patient-auth/paths";

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

/**
 * The end of the questionnaire (REM-168). « Ton questionnaire est prêt ! »
 * shows only after the server confirmed the saves and found nothing mandatory
 * missing. With a missing field, the screen lists each one with a link to its
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
              <Button type="button" variant="outline" size="lg" onClick={onBack}>
                {text.end.back}
              </Button>
            </div>
          </>
        )}
      </section>
    );
  }

  if (missing.length === 0) {
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
          {text.end.readyTitle}
        </Typography>
        <Typography as="p" size="base">
          {text.end.readyBody}
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <NextLink href={localePath(locale, HOME_PATH)}>
              {text.end.finish}
            </NextLink>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            {text.end.edit}
          </Button>
        </div>
      </section>
    );
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
              {mandatoryQuestionnaireFieldLabels[field][locale]}
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
