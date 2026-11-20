"use client";

import { useState, type ReactNode } from "react";
import {
  dateEntryFromIso,
  parseDateEntry,
  todayAtPractice,
} from "@remi/services/shared";
import { Field } from "@remi/ui/server";
import { DateInput } from "@/components/date-entry/date-input";
import type { Content } from "@/lib/content/types";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { AnswerField } from "@/lib/questionnaire/state";
import {
  refusalOf,
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

type Problem = "invalid" | "notPast";

type Props = {
  field: Extract<AnswerField, "birthDate" | "consultationDate">;
  label: ReactNode;
  /** The texts of a date field, from the page. */
  dateText: Content["dateEntry"];
  /** The saved day as `YYYY-MM-DD`, `""` when the file holds none. */
  initial: string;
  /** A birth date: today and every later day are refused. */
  past?: boolean;
  autoComplete?: string;
};

/**
 * One date answer, typed as « JJ/MM/AAAA » (REM-159). The field opens with
 * the saved day or empty, never with today. It saves a complete, real day and
 * an emptied field, and nothing else: a date half typed or impossible stays on
 * screen with its error and is not sent.
 */
export const DateAnswer = ({
  field,
  label,
  dateText,
  initial,
  past,
  autoComplete,
}: Props) => {
  const { text } = useQuestionnaire();
  const [value, setValue] = useState(dateEntryFromIso(initial));
  const [problem, setProblem] = useState<Problem | null>(null);
  const { state, commit, schedule, retry } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial,
  );

  /**
   * What the text gives: a value to save, or a problem. Neither for a date
   * that is still typed.
   */
  const read = (typed: string): { save?: string; problem?: Problem } => {
    const entry = parseDateEntry(typed);
    if (entry.state === "empty") {
      return { save: "" };
    }
    if (entry.state === "valid") {
      return past && entry.iso >= todayAtPractice()
        ? { problem: "notPast" }
        : { save: entry.iso };
    }
    return entry.state === "incomplete" ? {} : { problem: "invalid" };
  };

  const onChange = (typed: string) => {
    setValue(typed);
    const result = read(typed);
    setProblem(result.problem ?? null);
    if (result.save !== undefined) {
      schedule(result.save);
    }
  };
  const onBlur = () => {
    const result = read(value);
    if (result.save === undefined) {
      // A date left half typed is an error once the patient leaves the field.
      setProblem(result.problem ?? "invalid");
      return;
    }
    setProblem(null);
    setValue(dateEntryFromIso(result.save));
    void commit(result.save);
  };

  const id = `questionnaire-${field}`;
  const error = problem ? dateText[problem] : refusalOf(state, text);

  return (
    <div className="flex flex-col gap-1">
      <Field id={id} label={label} hint={dateText.hint} error={error}>
        <DateInput
          id={id}
          size="lg"
          value={value}
          invalid={error !== undefined}
          placeholder={dateText.placeholder}
          autoComplete={autoComplete}
          onValueChange={onChange}
          onBlur={onBlur}
        />
      </Field>
      {problem ? null : <SaveStatus state={state} onRetry={() => void retry()} />}
    </div>
  );
};
