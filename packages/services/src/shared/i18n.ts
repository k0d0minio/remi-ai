/**
 * The locale vocabulary. REMI is French only (Jamie, 2026-11-20): Morgane's
 * patients and practitioners are French-speaking, and no page ships in a
 * second language.
 *
 * The list and the `[locale]` segment stay so that every address keeps its
 * `/fr` prefix. The links in the e-mails and in the console carry it. A second
 * language is one more entry here, and one more dictionary in each app.
 */

export const locales = ["fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** "/", "fr" → "/fr" · "/contact", "fr" → "/fr/contact" */
export const localePath = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;

/**
 * The same address under the one locale the apps serve. A first segment of two
 * letters is a language that is not served (`/en/accueil`): it is replaced. A
 * path with no language gets the prefix. The proxy of each localised app
 * redirects with this, whatever the browser's language.
 *
 * "/" → "/fr" · "/accueil" → "/fr/accueil" · "/en/accueil" → "/fr/accueil"
 */
export const defaultLocalePath = (pathname: string) => {
  const [, first = "", ...rest] = pathname.split("/");
  const withoutLanguage = /^[a-z]{2}$/i.test(first)
    ? `/${rest.join("/")}`
    : pathname;
  return localePath(defaultLocale, withoutLanguage);
};
