import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "../lib/utils";
import { VisuallyHidden } from "./visually-hidden";

type Step<Key extends string> = {
  key: Key;
  label: string;
};

type Props<Key extends string> = {
  /** In the order the path is walked. */
  steps: readonly Step<Key>[];
  /** The step the subject is at now. */
  current: Key;
  /** What the path is about, for assistive technology. */
  label: string;
  /**
   * The state of a step in words, for assistive technology. The design system
   * has no language of its own, so the app gives the three words.
   */
  stateLabels: { done: string; current: string; upcoming: string };
  /**
   * Below `sm`, show the label of the current step only. The icons of the
   * other steps stay, so the position in the path stays readable.
   */
  compact?: boolean;
  className?: string;
};

/**
 * A short path of ordered steps with the present one marked: a file status, a
 * stage of an order. Each step carries an icon and its label, and its state is
 * also said in words to a screen reader. The state never depends on colour
 * alone (charter, section 8: « jamais couleur seule »).
 */
export const StepPath = <Key extends string>({
  steps,
  current,
  label,
  stateLabels,
  compact = false,
  className,
}: Props<Key>) => {
  const currentIndex = steps.findIndex((step) => step.key === current);
  return (
    <ol
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm",
        className,
      )}
    >
      {steps.map((step, index) => {
        const state =
          index < currentIndex
            ? "done"
            : index === currentIndex
              ? "current"
              : "upcoming";
        const Icon =
          state === "done" ? Check : state === "current" ? CircleDot : Circle;
        return (
          <li
            key={step.key}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "relative inline-flex items-center gap-1.5",
              state === "current"
                ? "text-foreground font-semibold"
                : "text-muted-foreground",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0",
                state === "current" ? "text-primary" : "",
              )}
            />
            <span
              className={
                compact && state !== "current" ? "sr-only sm:not-sr-only" : ""
              }
            >
              {step.label}
            </span>
            <VisuallyHidden>{` (${stateLabels[state]})`}</VisuallyHidden>
          </li>
        );
      })}
    </ol>
  );
};
