import type { ElementType } from "react";
import { cn } from "../lib/utils";

type Props = {
  /** Every locale the site serves, in the order they should read. */
  locales: readonly string[];
  /** The one the visitor is on. */
  current: string;
  /** The href for a given locale — the caller owns how a path is rewritten. */
  hrefFor: (locale: string) => string;
  /**
   * The element to render each entry as. Apps pass their router's link —
   * `as={NextLink}` — which keeps `next` out of the design system.
   */
  as?: ElementType;
  /** The nav's accessible name, in the visitor's language. */
  label: string;
  className?: string;
};

/**
 * EN | FR. Pure and server-safe: it takes the hrefs rather than reading the
 * current path, so the only client code an app needs is the one-line wrapper
 * that calls `usePathname` and hands the result down.
 *
 * The links are plain anchors on purpose — switching language keeps the visitor
 * on the page they were reading rather than sending them home.
 */
export const LocaleSwitcher = ({
  locales,
  current,
  hrefFor,
  as: Tag = "a",
  label,
  className,
}: Props) => (
  <nav aria-label={label} className={cn("flex items-center gap-1", className)}>
    {locales.map((locale) => (
      <Tag
        key={locale}
        href={hrefFor(locale)}
        hrefLang={locale}
        aria-current={locale === current ? "true" : undefined}
        className={cn(
          "focus-visible:ring-ring/40 hover:bg-accent hover:text-accent-foreground ease-standard inline-flex h-8 items-center rounded-md px-2 text-sm font-medium uppercase outline-none transition-colors duration-[--duration-fast] focus-visible:ring-[3px]",
          locale === current ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {locale}
      </Tag>
    ))}
  </nav>
);
