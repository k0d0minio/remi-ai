"use client";

import { useState, type ReactNode } from "react";
import { maskNumberEntry } from "@remi/services/shared";
import { Field, Input, Textarea } from "@remi/ui/server";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { AnswerField } from "@/lib/questionnaire/state";
import {
  refusalOf,
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

type Props = {
  field: AnswerField;
  label: ReactNode;
  hint?: ReactNode;
  /** The saved value, `""` when « Non renseigné ». */
  initial: string;
  multiline?: boolean;
  type?: "text" | "tel";
  inputMode?: "text" | "tel";
  /**
   * A number field (REM-160): the numeric keyboard of a phone, and no
   * character that is not part of the number. `integer` is a height in cm,
   * `decimal` a weight in kg. The server checks the plausible range.
   */
  numeric?: "integer" | "decimal";
  autoComplete?: string;
};

/**
 * One typed answer. It saves once typing pauses and on blur. An empty field
 * saves as « Non renseigné », never as a default value.
 */
export const TextAnswer = ({
  field,
  label,
  hint,
  initial,
  multiline,
  type = "text",
  inputMode,
  numeric,
  autoComplete,
}: Props) => {
  const { text } = useQuestionnaire();
  const [value, setValue] = useState(initial);
  const { state, commit, schedule, retry } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial,
  );
  const id = `questionnaire-${field}`;
  const refusal = refusalOf(state, text);
  const invalid = refusal !== undefined;
  const onChange = (typed: string) => {
    const next = numeric ? maskNumberEntry(typed, numeric) : typed;
    setValue(next);
    schedule(next);
  };
  const onBlur = () => {
    void commit(value);
  };

  return (
    <div className="flex flex-col gap-1">
      <Field
        id={id}
        label={label}
        hint={hint}
        error={refusal}
      >
        {multiline ? (
          <Textarea
            id={id}
            value={value}
            invalid={invalid}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
          />
        ) : (
          <Input
            id={id}
            type={type}
            size="lg"
            value={value}
            invalid={invalid}
            inputMode={
              numeric === "integer"
                ? "numeric"
                : numeric === "decimal"
                  ? "decimal"
                  : inputMode
            }
            autoComplete={autoComplete}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
          />
        )}
      </Field>
      <SaveStatus state={state} onRetry={() => void retry()} />
    </div>
  );
};
