"use client";

import { useState } from "react";
import { Checkbox } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { AnswerField } from "@/lib/questionnaire/state";
import {
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

type Props = {
  field: AnswerField;
  label: string;
  hint: string;
  /** The saved flag. Null is « Non renseigné »: the box shows unticked and saves nothing. */
  initial: boolean | null;
};

/**
 * One yes-or-no answer as a checkbox. A tick saves `true` and an untick saves
 * `false`. An untouched box stays unanswered (D-30).
 */
export const FlagAnswer = ({ field, label, hint, initial }: Props) => {
  const { text } = useQuestionnaire();
  const [checked, setChecked] = useState(initial === true);
  const { state, commit } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial === null ? "" : String(initial),
  );
  const id = `questionnaire-${field}`;
  const toggle = (on: boolean) => {
    setChecked(on);
    void commit(String(on));
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2"
      >
        <Checkbox
          id={id}
          checked={checked}
          aria-describedby={`${id}-hint`}
          onCheckedChange={(value) => toggle(value === true)}
        />
        <Typography as="span" size="sm" weight="medium">
          {label}
        </Typography>
      </label>
      <Typography id={`${id}-hint`} as="p" size="sm" tone="muted">
        {hint}
      </Typography>
      {state.kind === "error" ? (
        <Typography as="p" size="sm" className="text-error-text">
          {text.errors[state.error]}
        </Typography>
      ) : null}
      <SaveStatus state={state} />
    </div>
  );
};
