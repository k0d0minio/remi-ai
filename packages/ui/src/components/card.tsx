import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const card = cva(
  "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
  {
    variants: {
      // The shared intent vocabulary — same five names as Badge and Progress.
      variant: {
        neutral: "",
        success: "border-success/40",
        warning: "border-warning/40",
        error: "border-error/40",
        info: "border-info/40",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type Props = ComponentProps<"div"> & VariantProps<typeof card>;

export const Card = ({ className, variant, ...props }: Props) => (
  <div data-slot="card" className={cn(card({ variant }), className)} {...props} />
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
    className={cn("text-sm text-muted-foreground", className)}
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
