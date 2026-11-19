import type { ElementType } from "react";
import { BRAND_LEGAL_NAME, BRAND_LOGO } from "../lib/brand";
import { cn } from "../lib/utils";
import { VisuallyHidden } from "./visually-hidden";

/**
 * A scale, not a free size: the logo appears at three sizes across the apps
 * and nowhere else. The charter asks for a width of 96 to 120 px on a phone,
 * so `sm` and `md` stay in that range and `lg` grows only from `lg` up.
 */
const widths = {
  sm: "w-24",
  md: "w-28",
  lg: "w-28 lg:w-44",
} as const;

type Props = {
  /** The semantic element. `span` inside a link, `h1` when it *is* the heading. */
  as?: ElementType;
  size?: keyof typeof widths;
  className?: string;
};

/**
 * The brand, rendered: Morgane's logo image, never the name typed in a font.
 * Every app's header, title block and sign-in screen goes through this.
 *
 * The image is not part of this package. Each app serves its own copy at
 * `BRAND_LOGO.src` (`public/brand/remi-logo.png`, cut from
 * `packages/ui/brand/logo/remi-logo-charte.png`).
 *
 * The image is `aria-hidden` and the accessible name comes from the hidden
 * label, so a screen reader reads the company name once.
 *
 * The charter forbids the logo on a dark background and forbids inverted
 * colours. In dark mode the logo therefore sits on a white plate, as the
 * public site's footer already does.
 */
export const Wordmark = ({ as: Tag = "span", size = "md", className }: Props) => (
  <Tag
    className={cn(
      "inline-flex shrink-0 dark:rounded-lg dark:bg-white dark:px-2.5 dark:py-1.5",
      className,
    )}
  >
    <VisuallyHidden>{BRAND_LEGAL_NAME}</VisuallyHidden>
    <img
      src={BRAND_LOGO.src}
      alt=""
      aria-hidden="true"
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      className={cn("block h-auto", widths[size])}
    />
  </Tag>
);
