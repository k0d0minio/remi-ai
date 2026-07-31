import { Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const starRating = cva("inline-flex items-center gap-0.5", {
  variants: {
    size: {
      sm: "[&>svg]:size-3.5",
      md: "[&>svg]:size-4",
    },
  },
  defaultVariants: { size: "md" },
});

const TOTAL = 5;

type Props = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof starRating> & {
    /** Whole stars out of five. Clamped, so a bad value degrades rather than throws. */
    value: number;
  };

/**
 * Display only — this is a testimonial's rating, not an input. The stars are
 * `aria-hidden` and the real value goes to assistive technology as text, because
 * five separate star glyphs announce as noise.
 */
export const StarRating = ({ value, size, className, ...props }: Props) => {
  const filled = Math.max(0, Math.min(TOTAL, Math.round(value)));
  return (
    <span
      data-slot="star-rating"
      role="img"
      aria-label={`${filled} out of ${TOTAL}`}
      className={cn(starRating({ size }), className)}
      {...props}
    >
      {Array.from({ length: TOTAL }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            index < filled
              ? "fill-warning text-warning"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
};
