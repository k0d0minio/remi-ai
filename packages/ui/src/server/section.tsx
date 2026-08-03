import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const section = cva("w-full", {
  variants: {
    /**
     * Alternating `default` and `muted` down a page is what separates sections
     * without drawing a rule between every one of them. `inverted` is the brand
     * block — used once, for the closing call to action.
     */
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-muted text-foreground",
      inverted: "bg-primary text-primary-foreground",
      subtle: "bg-primary-subtle text-foreground",
    },
    /**
     * Vertical rhythm stays as classes rather than tokens: a spacing token would
     * only ever be consumable as an arbitrary padding value wrapping a CSS
     * variable, which defeats class sorting and buys nothing over naming the
     * three sizes here.
     *
     * That example is spelled out in prose on purpose — Tailwind scans this file
     * as source text, so a class-shaped token in a comment becomes a real
     * candidate and emits `padding-block: var(…)`, which is not parseable CSS.
     */
    spacing: {
      none: "",
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-24 md:py-32",
    },
  },
  defaultVariants: { tone: "default", spacing: "md" },
});

type Props = ComponentProps<"section"> &
  VariantProps<typeof section> & { as?: ElementType };

export const Section = ({
  as: Tag = "section",
  className,
  tone,
  spacing,
  ...props
}: Props) => (
  <Tag
    data-slot="section"
    className={cn(section({ tone, spacing }), className)}
    {...props}
  />
);

export { section as sectionVariants };
