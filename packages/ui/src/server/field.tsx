import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

type Props = {
  /**
   * Wires the label, hint and error to the control. Required rather than
   * generated: generating one means `useId`, and that would make every form
   * field a client component for no benefit.
   */
  id: string;
  label: ReactNode;
  /** The control itself. A single element, rendered with `id={id}`. */
  children: ReactNode;
  /** Guidance shown before anything goes wrong. */
  hint?: ReactNode;
  /** What went wrong. Its presence is what marks the field invalid. */
  error?: ReactNode;
  optional?: boolean;
  className?: string;
};

/**
 * Label, control, hint and error as one unit, with the aria wiring done once.
 *
 * The pattern this exists to prevent is a red border and no explanation: the
 * hint and error are announced through the control's own `aria-describedby`, so
 * a screen reader gets the reason at the moment a sighted user sees the colour.
 *
 * That association is why the control is cloned rather than wrapped. A wrapper
 * carrying `aria-describedby` looks correct and does nothing — the attribute has
 * to be on the focusable element itself.
 */
export const Field = ({
  id,
  label,
  children,
  hint,
  error,
  optional,
  className,
}: Props) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control =
    describedBy && isValidElement(children)
      ? cloneElement(
          children as ReactElement<{ "aria-describedby"?: string }>,
          {
            "aria-describedby": describedBy,
          },
        )
      : children;

  return (
    <div data-slot="field" className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium leading-none"
      >
        {label}
        {optional ? (
          <span className="text-muted-foreground font-normal">(optional)</span>
        ) : null}
      </label>

      {control}

      {hint ? (
        <p id={hintId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-error-text text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
};
