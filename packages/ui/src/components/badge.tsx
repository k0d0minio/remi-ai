import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const badge = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3",
  {
    variants: {
      // The shared intent vocabulary. A caller never passes a colour class —
      // it picks an intent, and the token decides how that intent looks.
      variant: {
        neutral: "border-transparent bg-neutral text-neutral-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        error: "border-transparent bg-error text-error-foreground",
        info: "border-transparent bg-info text-info-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type Props = ComponentProps<"span"> &
  VariantProps<typeof badge> & { asChild?: boolean };

export const Badge = ({ className, variant, asChild, ...props }: Props) => {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badge({ variant }), className)}
      {...props}
    />
  );
};

export { badge as badgeVariants };
