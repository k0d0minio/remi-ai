"use client";

import { useState, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field } from "@remi/ui/server";
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
  /** The values of the list. Each one shows as it is stored. */
  options: readonly string[];
  /** The saved value, `""` when « Non renseigné ». */
  initial: string;
  /** The first line of the list: it empties the answer. */
  emptyLabel: string;
  /** Tells the parent the choice at once. */
  onSelect?: (value: string) => void;
};

/** The list's own value of the empty line. A select item cannot hold `""`. */
const UNSET = "unset";

/**
 * One choice in a drop-down list (REM-166). A choice saves it. The first line
 * empties the answer, so a result stays optional and can change. Nothing is
 * selected while nothing is saved (D-30).
 */
export const SelectAnswer = ({
  field,
  label,
  options,
  initial,
  emptyLabel,
  onSelect,
}: Props) => {
  const { text } = useQuestionnaire();
  const [selected, setSelected] = useState(initial);
  const { state, commit, retry } = useAutosave(
    (next) => saveAnswerAction(field, next),
    initial,
  );
  const refusal = refusalOf(state, text);
  const id = `questionnaire-${field}`;
  const choose = (next: string) => {
    const value = next === UNSET ? "" : next;
    setSelected(value);
    onSelect?.(value);
    void commit(value);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Field id={id} label={label} error={refusal}>
        <Select
          value={selected === "" ? UNSET : selected}
          onValueChange={choose}
        >
          <SelectTrigger id={id} size="lg" invalid={refusal !== undefined}>
            <SelectValue placeholder={emptyLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>{emptyLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <SaveStatus state={state} onRetry={() => void retry()} />
    </div>
  );
};
