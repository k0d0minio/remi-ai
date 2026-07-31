import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const input = cva(
  "flex w-full min-w-0 rounded-md border border-input bg-background text-base transition-colors duration-[--duration-fast] ease-standard outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 py-1",
        md: "h-9 px-3 py-1",
        lg: "h-10 px-3.5 py-2",
      },
      /**
       * Drives the ring and border only. The message that says *what* is wrong
       * belongs to `Field`, because a red border on its own tells a user
       * something is broken without telling them what.
       */
      invalid: {
        true: "border-error-border focus-visible:border-error focus-visible:ring-error/30",
        false: "",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

// `size` on an <input> is a number (visible character width) and would collide
// with the variant. The variant is the one worth keeping.
type Props = Omit<ComponentProps<"input">, "size"> & VariantProps<typeof input>;

export const Input = ({ className, size, invalid, type, ...props }: Props) => (
  <input
    type={type}
    data-slot="input"
    aria-invalid={invalid || undefined}
    className={cn(input({ size, invalid }), className)}
    {...props}
  />
);

export { input as inputVariants };
