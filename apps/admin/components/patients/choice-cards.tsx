"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { RadioCard, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";

/**
 * How a control of the patient form tells the form that what it posts has
 * changed. The form reads itself again and updates the index. A control calls
 * it from an effect, after the DOM holds the new value.
 */
export const FormChangeContext = createContext<() => void>(() => {});

export const useFormChange = () => useContext(FormChangeContext);

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  /** The form field name the server action reads. Also the fieldset's `id`. */
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  options: readonly ChoiceOption[];
  /** The stored answer. Null, undefined or `emptyValue` is « Non renseigné ». */
  initial: string | null | undefined;
  /**
   * What the form posts while no option is selected. The action reads it as a
   * cleared answer. `""` unless the field has its own word for it.
   */
  emptyValue?: string;
  /** False for a field that always has a value, such as the language. */
  clearable?: boolean;
  /** `two` for options that carry a description. */
  layout?: "auto" | "two";
  onSelect?: (value: string) => void;
};

/**
 * One question with a few fixed answers, as visible cards: one click selects.
 * It is the practitioner's density of the patient's radio group, on the same
 * `RadioCard`.
 *
 * No card is selected until an answer exists (D-30), and the question then
 * reads « Non renseigné ». An unanswered question still posts its name, with
 * `emptyValue`, so the action clears the column as the old select did.
 */
export const ChoiceCards = ({
  name,
  legend,
  hint,
  options,
  initial,
  emptyValue = "",
  clearable = true,
  layout = "auto",
  onSelect,
}: Props) => {
  const known = options.some((option) => option.value === initial);
  const [selected, setSelected] = useState(known ? (initial ?? "") : "");
  const notify = useFormChange();
  useEffect(() => {
    notify();
  }, [selected, notify]);

  const choose = (value: string) => {
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <fieldset id={name} className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <Typography as="span" size="sm" weight="medium">
          {legend}
        </Typography>
        {selected === "" ? (
          <Typography as="span" size="xs" tone="muted">
            Non renseigné
          </Typography>
        ) : null}
      </legend>
      {hint ? (
        <Typography size="sm" tone="muted">
          {hint}
        </Typography>
      ) : null}
      <div
        className={cn(
          "grid gap-2",
          layout === "two"
            ? "@xl:grid-cols-2"
            : "grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]",
        )}
      >
        {options.map((option) => (
          <RadioCard
            key={option.value}
            size="compact"
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={selected === option.value}
            onChange={() => choose(option.value)}
          />
        ))}
      </div>
      {selected === "" ? (
        <input type="hidden" name={name} value={emptyValue} />
      ) : clearable ? (
        <button
          type="button"
          onClick={() => choose("")}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 w-fit items-center rounded-sm text-sm underline underline-offset-2 focus-visible:outline-none focus-visible:ring-[3px]"
        >
          Effacer la réponse
        </button>
      ) : null}
    </fieldset>
  );
};
