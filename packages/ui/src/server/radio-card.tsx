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
    {/*
     * The circle is drawn here, not by the browser (REM-205). A native radio
     * fills its box to the edge, so a phone's sub-pixel layout cut its rim.
     * Here the rim is a border inside a 20 px box, the dot an inset shadow.
     * 20 px is the line height of the label, so the circle sits on its first
     * line. In forced colours the native control comes back.
     */}
    <input
      type="radio"
      className="border-muted-foreground bg-card checked:border-primary checked:bg-primary ease-standard size-5 shrink-0 cursor-[inherit] appearance-none rounded-full border-2 outline-none transition-colors duration-[--duration-fast] checked:shadow-[inset_0_0_0_3px_var(--color-card)] forced-colors:appearance-auto"
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
