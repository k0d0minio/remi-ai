import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const button = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-[--duration-fast] ease-standard outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // A real ramp step rather than `bg-primary/90`: fading a saturated blue
        // toward the page behind it goes muddy, where the next step down is the
        // same colour, just darker.
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        error: "bg-error text-error-foreground hover:bg-error/90",
      },
      size: {
        sm: "h-8 gap-1.5 px-3",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        // Hero calls to action only — at this size the label carries the section,
        // so it takes the larger type with it.
        xl: "h-12 px-8 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ComponentProps<"button"> &
  VariantProps<typeof button> & { asChild?: boolean };

/**
 * Client-side by construction: a button takes an `onClick`, and `asChild` routes
 * through Radix's Slot, which reaches for a hook. To style a link as a button,
 * pass the link as the child — `<Button asChild><Link href="…">…</Link></Button>`
 * — which a server page can render perfectly well.
 */
export const Button = ({
  className,
  variant,
  size,
  asChild,
  ...props
}: Props) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  );
};

export { button as buttonVariants };
