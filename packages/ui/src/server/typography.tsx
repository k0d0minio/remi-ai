import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const typography = cva("", {
  variants: {
    /**
     * The role the text plays, which is a different question from how big it is.
     * `display` is the only variant that switches typeface — the serif is for
     * headlines and nothing else, because it stops reading as authoritative the
     * moment it appears in body copy.
     */
    variant: {
      display: "font-display font-normal",
      lead: "text-muted-foreground",
      body: "",
      eyebrow: "text-xs font-medium tracking-[0.12em] uppercase",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      inverted: "text-primary-foreground",
    },
    /**
     * Prevents the ragged last line that makes a two-line headline look broken.
     * Worth it on headlines, wasted everywhere else — the browser re-runs line
     * breaking, so it is not free on long copy.
     */
    balance: {
      true: "text-balance",
      false: "",
    },
    /**
     * Superseded by `tone="muted"`, kept because every app's page.tsx passes it.
     * Listed after `tone` so it wins when both are set.
     */
    muted: {
      true: "text-muted-foreground",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body",
    size: "base",
    weight: "normal",
    tone: "default",
    balance: false,
    muted: false,
  },
});

type Props = ComponentProps<"p"> &
  VariantProps<typeof typography> & {
    /** The semantic element to render — `h1`…`h6`, `p`, `span`, `label`. */
    as?: ElementType;
  };

/**
 * The single text primitive. Apps never reach for a raw `h1`/`p`/`span` with
 * utility classes — semantics come from `as`, scale from the variants, so a
 * change to the type scale lands everywhere at once. See CONVENTIONS.md.
 *
 * There is no `asChild` here. This component is built into the unbannered server
 * entry, and Radix's Slot reaches for a hook — see packages/ui/AGENTS.md. Use
 * `as` instead; it is pure and does the same job.
 */
export const Typography = ({
  as: Tag = "p",
  variant,
  size,
  weight,
  tone,
  balance,
  muted,
  className,
  ...props
}: Props) => (
  <Tag
    data-slot="typography"
    className={cn(
      typography({ variant, size, weight, tone, balance, muted }),
      className,
    )}
    {...props}
  />
);

export { typography as typographyVariants };
