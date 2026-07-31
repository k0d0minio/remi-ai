import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

const badge = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border font-medium whitespace-nowrap",
  {
    variants: {
      // The shared intent vocabulary. A caller never passes a colour class —
      // it picks an intent, and the token decides how that intent looks.
      variant: {
        neutral: "",
        success: "",
        warning: "",
        error: "",
        info: "",
        outline: "border-border text-foreground",
      },
      /**
       * `solid` fills with the intent; `subtle` tints a surface and renders the
       * intent as text, which needs the `-text` token rather than the bare one —
       * the fill colours are chosen to be sat on, not read.
       */
      tone: {
        solid: "border-transparent",
        subtle: "",
      },
      size: {
        sm: "px-1.5 py-0 text-[0.6875rem] [&>svg]:size-2.5",
        md: "px-2 py-0.5 text-xs [&>svg]:size-3",
      },
    },
    compoundVariants: [
      {
        variant: "neutral",
        tone: "solid",
        class: "bg-neutral text-neutral-foreground",
      },
      {
        variant: "success",
        tone: "solid",
        class: "bg-success text-success-foreground",
      },
      {
        variant: "warning",
        tone: "solid",
        class: "bg-warning text-warning-foreground",
      },
      {
        variant: "error",
        tone: "solid",
        class: "bg-error text-error-foreground",
      },
      { variant: "info", tone: "solid", class: "bg-info text-info-foreground" },
      {
        variant: "neutral",
        tone: "subtle",
        class: "border-neutral-border bg-neutral-subtle text-neutral-text",
      },
      {
        variant: "success",
        tone: "subtle",
        class: "border-success-border bg-success-subtle text-success-text",
      },
      {
        variant: "warning",
        tone: "subtle",
        class: "border-warning-border bg-warning-subtle text-warning-text",
      },
      {
        variant: "error",
        tone: "subtle",
        class: "border-error-border bg-error-subtle text-error-text",
      },
      {
        variant: "info",
        tone: "subtle",
        class: "border-info-border bg-info-subtle text-info-text",
      },
    ],
    // `solid` stays the default so existing callers are unaffected by the tone split.
    defaultVariants: { variant: "neutral", tone: "solid", size: "md" },
  },
);

type Props = ComponentProps<"span"> &
  VariantProps<typeof badge> & {
    /** The element to render — `span` by default, `div` inside a `p`. */
    as?: ElementType;
  };

export const Badge = ({
  as: Tag = "span",
  className,
  variant,
  tone,
  size,
  ...props
}: Props) => (
  <Tag
    data-slot="badge"
    className={cn(badge({ variant, tone, size }), className)}
    {...props}
  />
);

export { badge as badgeVariants };
