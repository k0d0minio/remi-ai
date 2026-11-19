"use client";

import { useState, type ReactNode } from "react";
import { Typography } from "@remi/ui/server";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { AnswerField } from "@/lib/questionnaire/state";
import {
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  field: AnswerField;
  legend: ReactNode;
  hint?: ReactNode;
  options: readonly ChoiceOption[];
  /** The saved value, `""` when « Non renseigné ». */
  initial: string;
  /**
   * The option shown selected while nothing is saved. Display only: it saves
   * when the patient taps it, never on its own (D-30).
   */
  shownByDefault?: string;
  onSelect?: (value: string) => void;
};

/**
 * One choice among a few, as a radio group. A tap saves it. A tap on the
 * option shown by default saves it too, although it already looks selected:
 * that is why the save listens to the click, not only to the change.
 */
export const ChoiceAnswer = ({
  field,
  legend,
  hint,
  options,
  initial,
  shownByDefault,
  onSelect,
}: Props) => {
  const { text } = useQuestionnaire();
  const [selected, setSelected] = useState(initial || shownByDefault || "");
  const { state, commit } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial,
  );
  const choose = async (value: string) => {
    setSelected(value);
    onSelect?.(value);
    await commit(value);
  };
  // The hint explains the default while nothing is saved.
  const showHint = hint && initial === "" && state.kind === "idle";
  const name = `questionnaire-${field}`;

  return (
    <fieldset className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {legend}
      </Typography>
      {showHint ? (
        <Typography as="p" size="sm" tone="muted">
          {hint}
        </Typography>
      ) : null}
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="border-border bg-card has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-ring flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 has-[:focus-visible]:ring-[3px]"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => void choose(option.value)}
              onClick={() => void choose(option.value)}
              className="accent-primary mt-0.5 size-4 shrink-0"
            />
            <span className="flex flex-col gap-0.5">
              <Typography as="span" size="sm" weight="medium">
                {option.label}
              </Typography>
              {option.description ? (
                <Typography as="span" size="sm" tone="muted">
                  {option.description}
                </Typography>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {state.kind === "error" ? (
        <Typography as="p" size="sm" className="text-error-text">
          {text.errors[state.error]}
        </Typography>
      ) : null}
      <SaveStatus state={state} />
    </fieldset>
  );
};
