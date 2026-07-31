import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const typography = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    muted: {
      true: "text-muted-foreground",
      false: "",
    },
  },
  defaultVariants: { size: "base", weight: "normal", muted: false },
});

type Props = ComponentProps<"p"> &
  VariantProps<typeof typography> & {
    /** The semantic element to render — `h1`…`h6`, `p`, `span`, `label`. */
    as?: ElementType;
    asChild?: boolean;
  };

/**
 * The single text primitive. Apps never reach for a raw `h1`/`p`/`span` with
 * utility classes — semantics come from `as`, scale from the variants, so a
 * change to the type scale lands everywhere at once. See CONVENTIONS.md.
 */
export const Typography = ({
  as: Tag = "p",
  asChild,
  size,
  weight,
  muted,
  className,
  ...props
}: Props) => {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      className={cn(typography({ size, weight, muted }), className)}
      {...props}
    />
  );
};
