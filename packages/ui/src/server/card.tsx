import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const card = cva(
  "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground",
  {
    variants: {
      // The shared intent vocabulary — same five names as Badge and Alert.
      // Intent tints the border only; the surface stays --card so a grid of
      // cards reads as one plane with differently-flagged edges.
      variant: {
        neutral: "border-border",
        success: "border-success-border",
        warning: "border-warning-border",
        error: "border-error-border",
        info: "border-info-border",
      },
      elevation: {
        flat: "shadow-none",
        raised: "shadow-sm",
        floating: "shadow-md",
      },
      /**
       * For a card that is itself a link or button target. Only the affordance —
       * the caller still supplies the anchor.
       */
      interactive: {
        true: "transition-shadow duration-[--duration-fast] ease-standard hover:shadow-lg",
        false: "",
      },
    },
    // `raised` matches the shadow-sm the previous Card hard-coded, so existing
    // callers see only the shadow's retint, not a change of depth.
    defaultVariants: {
      variant: "neutral",
      elevation: "raised",
      interactive: false,
    },
  },
);

type Props = ComponentProps<"div"> & VariantProps<typeof card>;

export const Card = ({
  className,
  variant,
  elevation,
  interactive,
  ...props
}: Props) => (
  <div
    data-slot="card"
    className={cn(card({ variant, elevation, interactive }), className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-header"
    className={cn("flex flex-col gap-1.5 px-6", className)}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-title"
    className={cn("font-semibold leading-none", className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="card-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div data-slot="card-content" className={cn("px-6", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="card-footer"
    className={cn("flex items-center px-6", className)}
    {...props}
  />
);

export { card as cardVariants };
