import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const textarea = cva(
  "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base transition-colors duration-[--duration-fast] ease-standard outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      invalid: {
        true: "border-error-border focus-visible:border-error focus-visible:ring-error/30",
        false: "",
      },
    },
    defaultVariants: { invalid: false },
  },
);

type Props = ComponentProps<"textarea"> & VariantProps<typeof textarea>;

export const Textarea = ({ className, invalid, ...props }: Props) => (
  <textarea
    data-slot="textarea"
    aria-invalid={invalid || undefined}
    className={cn(textarea({ invalid }), className)}
    {...props}
  />
);

export { textarea as textareaVariants };
