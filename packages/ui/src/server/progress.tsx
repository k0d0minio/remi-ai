import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const track = cva("bg-muted w-full overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    },
  },
  defaultVariants: { size: "md" },
});

const bar = cva("h-full rounded-full transition-[width] ease-standard", {
  variants: {
    // The shared intent vocabulary, plus `primary` for a neutral "how far along"
    // reading that carries no judgement about whether the number is good.
    intent: {
      primary: "bg-primary",
      neutral: "bg-neutral",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-info",
    },
  },
  defaultVariants: { intent: "primary" },
});

type Props = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof track> &
  VariantProps<typeof bar> & {
    /** 0–100. Values outside the range are clamped rather than overflowing. */
    value: number;
    /**
     * What the number is about, for assistive technology. Required — a bare
     * progressbar announces a percentage with nothing to attach it to.
     */
    label: string;
  };

/**
 * Hand-written rather than Radix's Progress, which needs a hook and would drag
 * this onto the client. A width and an ARIA role is the whole primitive.
 */
export const Progress = ({
  value,
  label,
  intent,
  size,
  className,
  ...props
}: Props) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(track({ size }), className)}
      {...props}
    >
      <div className={bar({ intent })} style={{ width: `${clamped}%` }} />
    </div>
  );
};

export { bar as progressBarVariants };
