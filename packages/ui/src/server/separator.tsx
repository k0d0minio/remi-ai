import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const separator = cva("shrink-0", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
    tone: {
      default: "bg-border",
      subtle: "bg-border/60",
      inverted: "bg-primary-foreground/20",
    },
  },
  defaultVariants: { orientation: "horizontal", tone: "default" },
});

type Props = ComponentProps<"div"> & VariantProps<typeof separator>;

/**
 * Hand-written rather than taken from Radix: a separator is a div with a role
 * and an aria attribute, and it holds no state. Pulling a package in for it
 * would also drag it into the client bundle for no behaviour.
 *
 * Decorative by default. A separator that genuinely divides two regions — as
 * opposed to one that is just a line — should be given `role="separator"` by the
 * caller.
 */
export const Separator = ({
  className,
  orientation,
  tone,
  ...props
}: Props) => (
  <div
    data-slot="separator"
    role="none"
    className={cn(separator({ orientation, tone }), className)}
    {...props}
  />
);

export { separator as separatorVariants };
