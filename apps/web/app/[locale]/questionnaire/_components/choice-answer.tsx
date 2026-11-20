"use client";

import { useState, type ReactNode } from "react";
import { RadioCard, Typography } from "@remi/ui/server";
import { saveAnswerAction } from "@/lib/questionnaire/actions";
import type { AnswerField } from "@/lib/questionnaire/state";
import {
  refusalOf,
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
  options: readonly ChoiceOption[];
  /** The saved value, `""` when « Non renseigné ». */
  initial: string;
  /** Tells the parent the choice at once: the genetic step opens on « Oui ». */
  onSelect?: (value: string) => void;
};

/**
 * One choice among a few, as a radio group. A tap saves it. Nothing is
 * selected while nothing is saved (D-30).
 */
export const ChoiceAnswer = ({
  field,
  legend,
  options,
  initial,
  onSelect,
}: Props) => {
  const { text } = useQuestionnaire();
  const [selected, setSelected] = useState(initial);
  const { state, commit, retry } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial,
  );
  const refusal = refusalOf(state, text);
  const choose = async (value: string) => {
    setSelected(value);
    onSelect?.(value);
    await commit(value);
  };
  const name = `questionnaire-${field}`;

  return (
    <fieldset id={name} tabIndex={-1} className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {legend}
      </Typography>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <RadioCard
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={selected === option.value}
            onChange={() => void choose(option.value)}
          />
        ))}
      </div>
      {refusal ? (
        <Typography as="p" size="sm" className="text-error-text">
          {refusal}
        </Typography>
      ) : null}
      <SaveStatus state={state} onRetry={() => void retry()} />
    </fieldset>
  );
};
