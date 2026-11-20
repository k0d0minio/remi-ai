"use client";

import { cn } from "@remi/ui/utils";

type Props = {
  /** The field that the form posts when the choice is on. */
  name: string;
  value: string;
  label: string;
  on: boolean;
  onToggle: () => void;
};

/**
 * One choice of a small set where several can be on: the meals and the
 * seasons of a recipe. Each choice is in view and takes one tap. The look is
 * the one of `ChoiceChip` of `@remi/ui`, which is a radio and takes one answer
 * only.
 */
export const ChoiceToggle = ({ name, value, label, on, onToggle }: Props) => (
  <>
    {on ? <input type="hidden" name={name} value={value} /> : null}
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        "focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
        on
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {label}
    </button>
  </>
);
