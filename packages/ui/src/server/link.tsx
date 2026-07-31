import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const link = cva(
  "rounded-sm underline-offset-4 transition-colors duration-[--duration-fast] ease-standard outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default: "text-foreground hover:text-primary",
        muted: "text-muted-foreground hover:text-foreground",
        primary: "text-primary hover:text-primary-hover hover:underline",
        underline:
          "text-foreground underline decoration-border hover:decoration-current",
        /** A link that stands alone as a call to action, next to an arrow. */
        standalone:
          "text-primary inline-flex items-center gap-1 font-medium hover:gap-1.5 [&>svg]:size-4",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type Props = ComponentProps<"a"> &
  VariantProps<typeof link> & {
    /**
     * The element to render. Apps pass their router's link —
     * `<Link as={NextLink} href="/pricing">` — which keeps `next` out of the
     * design system while still producing a client-side navigation.
     */
    as?: ElementType;
  };

export const Link = ({
  as: Tag = "a",
  className,
  variant,
  ...props
}: Props) => (
  <Tag
    data-slot="link"
    className={cn(link({ variant }), className)}
    {...props}
  />
);

export { link as linkVariants };
