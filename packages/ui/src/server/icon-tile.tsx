import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const iconTile = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border",
  {
    variants: {
      // The shared intent vocabulary, always in its subtle treatment — a tile is
      // a surface the icon sits on, so it takes `-subtle` and `-text`.
      intent: {
        neutral: "border-neutral-border bg-neutral-subtle text-neutral-text",
        success: "border-success-border bg-success-subtle text-success-text",
        warning: "border-warning-border bg-warning-subtle text-warning-text",
        error: "border-error-border bg-error-subtle text-error-text",
        info: "border-info-border bg-info-subtle text-info-text",
        primary: "border-primary-border bg-primary-subtle text-primary",
      },
      size: {
        sm: "size-8 [&>svg]:size-4",
        md: "size-10 [&>svg]:size-5",
        lg: "size-12 [&>svg]:size-6",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  },
);

type Props = ComponentProps<"span"> & VariantProps<typeof iconTile>;

/**
 * A framed icon — the repeating unit at the top of a feature card or a step in a
 * how-it-works list. Exists so the frame is defined once instead of being
 * respelled as `rounded-lg bg-… p-2` at every call site.
 */
export const IconTile = ({ className, intent, size, ...props }: Props) => (
  <span
    data-slot="icon-tile"
    aria-hidden="true"
    className={cn(iconTile({ intent, size }), className)}
    {...props}
  />
);

export { iconTile as iconTileVariants };
