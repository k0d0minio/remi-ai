import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const alert = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[--spacing(4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      /**
       * The shared intent vocabulary. Alerts always use the `subtle` treatment —
       * a filled block of `--error` at full chroma is a shout, and an inline
       * message on a form should not shout. The heading reads in `-text`, which
       * is the token that actually passes contrast on `--background`.
       */
      variant: {
        neutral:
          "border-neutral-border bg-neutral-subtle text-foreground [&>svg]:text-neutral-text",
        success:
          "border-success-border bg-success-subtle text-foreground [&>svg]:text-success-text",
        warning:
          "border-warning-border bg-warning-subtle text-foreground [&>svg]:text-warning-text",
        error:
          "border-error-border bg-error-subtle text-foreground [&>svg]:text-error-text",
        info: "border-info-border bg-info-subtle text-foreground [&>svg]:text-info-text",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type Props = ComponentProps<"div"> & VariantProps<typeof alert>;

export const Alert = ({ className, variant, ...props }: Props) => (
  <div
    data-slot="alert"
    role="alert"
    className={cn(alert({ variant }), className)}
    {...props}
  />
);

export const AlertTitle = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="alert-title"
    className={cn("col-start-2 min-h-4 font-medium tracking-tight", className)}
    {...props}
  />
);

export const AlertDescription = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="alert-description"
    className={cn(
      "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
);

export { alert as alertVariants };
