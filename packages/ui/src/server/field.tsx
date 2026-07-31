import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";

type Props = Omit<ComponentProps<"div">, "children"> & {
  /**
   * Wires the label, hint and error to the control. Required rather than
   * generated: generating one means `useId`, and that would make every form
   * field a client component for no benefit.
   */
  id: string;
  label: ReactNode;
  /** The control itself, rendered with `id={id}` by the caller. */
  children: ReactNode;
  /** Guidance shown before anything goes wrong. */
  hint?: ReactNode;
  /** What went wrong. Its presence is what marks the field invalid. */
  error?: ReactNode;
  optional?: boolean;
};

/**
 * Label, control, hint and error as one unit, with the aria wiring done once.
 *
 * The pattern this exists to prevent is a red border and no explanation: `error`
 * is announced via `aria-describedby`, so a screen reader gets the reason at the
 * same moment a sighted user sees the colour.
 */
export const Field = ({
  id,
  label,
  children,
  hint,
  error,
  optional,
  className,
  ...props
}: Props) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium leading-none"
      >
        {label}
        {optional ? (
          <span className="text-muted-foreground font-normal">(optional)</span>
        ) : null}
      </label>

      <div aria-describedby={describedBy}>{children}</div>

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
