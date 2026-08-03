import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@remi/services/shared";

/**
 * The shape Next generates for a `[locale]` route's params. It is `string`, not
 * `Locale`, and it is not negotiable: typegen checks every route file against
 * `LayoutProps` / `PageProps`, and a route that declares the narrower type fails
 * the build rather than the other way round.
 */
export type LocaleParams = { locale: string };

/**
 * Awaits the params and narrows the locale in one step, so a route can go
 * straight from the generated shape to a `Locale` without restating either.
 *
 * `[locale]/layout.tsx` has already rejected an unknown locale before any of
 * these routes render. The `notFound()` here is what keeps that a guarantee
 * rather than an assumption — and it is what lets the return type be `Locale`.
 */
export const resolveLocale = async (
  params: Promise<LocaleParams>,
): Promise<Locale> => {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
};
