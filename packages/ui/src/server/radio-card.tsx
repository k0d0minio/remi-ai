import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";
import { Typography } from "./typography";

const card = cva(
  "border-border bg-card has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-ring flex min-h-11 cursor-pointer gap-3 rounded-lg border has-[:focus-visible]:ring-[3px] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
  {
    variants: {
      /**
       * `md` is the patient's questionnaire. `compact` is the practitioner's
       * density: less padding, the same 44 px touch target.
       */
      size: {
        md: "items-start px-4 py-3",
        compact: "items-center px-3 py-2",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type Props = Omit<ComponentProps<"input">, "type" | "size" | "children"> &
  VariantProps<typeof card> & {
    label: ReactNode;
    /** A second line under the label. */
    description?: ReactNode;
  };

/**
 * One option of a radio group, as a card: the whole card is the click target
 * and the selected card is tinted. The control underneath is a plain radio, so
 * the group works with the keyboard and a screen reader.
 *
 * It holds no state. The caller passes `checked` and `onChange`, or
 * `defaultChecked` for an uncontrolled group. The group needs a `fieldset`
 * with a `legend` around its cards (charter, section 8: « groupe titré »).
 */
export const RadioCard = ({
  label,
  description,
  size,
  className,
  ...props
}: Props) => (
  <label data-slot="radio-card" className={cn(card({ size }), className)}>
    <input
      type="radio"
      className={cn(
        "accent-primary size-4 shrink-0",
        size === "compact" ? "" : "mt-0.5",
      )}
      {...props}
    />
    <span className="flex min-w-0 flex-col gap-0.5">
      <Typography as="span" size="sm" weight="medium">
        {label}
      </Typography>
      {description ? (
        <Typography as="span" size="sm" tone="muted">
          {description}
        </Typography>
      ) : null}
    </span>
  </label>
);
