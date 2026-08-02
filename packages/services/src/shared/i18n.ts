/**
 * The locale vocabulary, shared by every app that ships in more than one
 * language. It lives here rather than in an app because the marketing site and
 * the product must agree on it — a link from the app to the public site has to
 * build the same path the site actually serves.
 */

export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

/**
 * French is the market the product is launching into (Belgium, France); English
 * is the fallback for everyone else and the x-default for search engines.
 */
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** "/", "fr" → "/fr" · "/contact", "en" → "/en/contact" */
export const localePath = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;

/**
 * The first language in an Accept-Language header that we can actually serve,
 * so a Brussels visitor lands on French and everyone else on English. Takes the
 * raw header rather than a request object, which is what keeps this isomorphic
 * and testable — the caller's proxy owns the redirect.
 */
export const pickLocaleFromHeader = (header: string | null): Locale => {
  if (!header) {
    return defaultLocale;
  }
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) {
      return code;
    }
  }
  return defaultLocale;
};
