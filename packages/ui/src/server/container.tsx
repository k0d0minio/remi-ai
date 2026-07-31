import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const container = cva("mx-auto w-full", {
  variants: {
    /**
     * The three measures a layout is allowed to be. Backed by the
     * `--container-*` tokens, so the whole site's rhythm moves from one place.
     */
    size: {
      narrow: "max-w-narrow",
      content: "max-w-content",
      wide: "max-w-wide",
      full: "max-w-none",
    },
    /** Off for a child that supplies its own edge padding, or for full bleed. */
    gutter: {
      true: "px-6 md:px-8",
      false: "",
    },
  },
  defaultVariants: { size: "content", gutter: true },
});

type Props = ComponentProps<"div"> &
  VariantProps<typeof container> & { as?: ElementType };

export const Container = ({
  as: Tag = "div",
  className,
  size,
  gutter,
  ...props
}: Props) => (
  <Tag
    data-slot="container"
    className={cn(container({ size, gutter }), className)}
    {...props}
  />
);

export { container as containerVariants };
