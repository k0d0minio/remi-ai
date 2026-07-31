/**
 * The two locales this site ships in. French is the market the product is
 * launching into (Belgium, France); English is the default for everyone else
 * and the x-default for search engines.
 */
export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** "/", "fr" → "/fr" · "/contact", "en" → "/en/contact" */
export const localePath = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;
