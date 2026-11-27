"use client";

import { useState, type ReactNode } from "react";
import {
  dateEntryFromIso,
  isAdultOn,
  isTodayOrLater,
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

type Problem = "invalid" | "notPast" | "minor" | "beforeToday";

/**
 * The rule of the day, after the calendar check (REM-159). A birth date is
 * before today and of a person of 18 or older. A consultation date is today or
 * a later day.
 */
type Rule = "birth" | "consultation";

/** The problem of a real day under the rule, null when the day is valid. */
const problemOf = (rule: Rule, iso: string, today: string): Problem | null => {
  if (rule === "consultation") {
    return isTodayOrLater(iso, today) ? null : "beforeToday";
  }
  if (iso >= today) {
    return "notPast";
  }
  return isAdultOn(iso, today) ? null : "minor";
};

type Props = {
  field: Extract<AnswerField, "birthDate" | "consultationDate">;
  label: ReactNode;
  /** The texts of a date field, from the page. */
  dateText: Content["dateEntry"];
  /** The saved day as `YYYY-MM-DD`, `""` when the file holds none. */
  initial: string;
  rule: Rule;
  autoComplete?: string;
};

/**
 * One date answer, typed as « JJ/MM/AAAA » (REM-159). The field opens with
 * the saved day or empty, never with today. It saves a complete, real day
 * that its rule accepts, and an emptied field. A date half typed, impossible
 * or refused by the rule stays on screen with its error. The questionnaire
 * does not stop on it: its end counts a missing consultation date (Jamie,
 * 2026-11-27). So a refused consultation date clears the saved one.
 */
export const DateAnswer = ({
  field,
  label,
  dateText,
  initial,
  rule,
  autoComplete,
}: Props) => {
  const { text } = useQuestionnaire();
  const [value, setValue] = useState(dateEntryFromIso(initial));
  // A saved consultation date that is now past shows its error at once.
  const [problem, setProblem] = useState<Problem | null>(() =>
    initial === "" ? null : problemOf(rule, initial, todayAtPractice()),
  );
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
      const refused = problemOf(rule, entry.iso, todayAtPractice());
      return refused ? { problem: refused } : { save: entry.iso };
    }
    return entry.state === "incomplete" ? {} : { problem: "invalid" };
  };

  /** A consultation date with a problem is no date: the saved one goes. */
  const clears = rule === "consultation";

  const onChange = (typed: string) => {
    setValue(typed);
    const result = read(typed);
    setProblem(result.problem ?? null);
    if (result.save !== undefined) {
      schedule(result.save);
    } else if (result.problem && clears) {
      schedule("");
    }
  };
  const onBlur = () => {
    const result = read(value);
    if (result.save === undefined) {
      // A date left half typed is an error once the patient leaves the field.
      setProblem(result.problem ?? "invalid");
      if (clears) {
        void commit("");
      }
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
