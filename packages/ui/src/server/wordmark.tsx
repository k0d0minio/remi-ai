import type { ElementType } from "react";
import { BRAND_LEGAL_NAME, BRAND_NAME } from "../lib/brand";
import { cn } from "../lib/utils";
import { Typography } from "./typography";
import { VisuallyHidden } from "./visually-hidden";

/**
 * A scale, not a free size — the wordmark appears at three sizes across the
 * apps and nowhere else, so the prop lists them rather than taking a class.
 */
const sizes = {
  sm: "lg",
  md: "xl",
  lg: "3xl",
} as const;

type Props = {
  /** The semantic element. `span` inside a link, `h1` when it *is* the heading. */
  as?: ElementType;
  size?: keyof typeof sizes;
  className?: string;
};

/**
 * The brand, rendered. Every app's header, footer and title block goes through
 * this, so the typeface, the casing and the name itself have one home.
 *
 * The visible letters are `aria-hidden` and the accessible name comes from the
 * hidden label instead. Reading order is what forces it: leaving both exposed
 * announces "REMI, Remi AI", and a set-caps product name is not reliably read
 * as a word by every screen reader anyway.
 */
export const Wordmark = ({ as = "span", size = "md", className }: Props) => (
  <Typography
    as={as}
    variant="display"
    size={sizes[size]}
    // Set caps in a display serif close up without it; the tracking is what
    // keeps the four letters reading as a mark rather than an acronym.
    className={cn("tracking-[0.06em]", className)}
  >
    <VisuallyHidden>{BRAND_LEGAL_NAME}</VisuallyHidden>
    <span aria-hidden="true">{BRAND_NAME}</span>
  </Typography>
);
