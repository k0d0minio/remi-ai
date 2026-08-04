import type { Metadata } from "next";
import { appOrigin, localePath, type Locale } from "@remi/services/shared";
import { BRAND_NAME } from "@remi/ui/server";

/**
 * The site's own origin. Needed as a real URL rather than a path because
 * `metadataBase` resolves every relative OG and canonical URL against it.
 *
 * It comes from the same catalogue as every cross-app link
 * (`@remi/services/shared` → `links.ts`) rather than from a local literal: this
 * site's canonical URL and the URL the marketing footer links it by are the same
 * fact, and two copies of one fact eventually disagree.
 */
export const siteUrl = appOrigin("support");

/**
 * The product name, not the company — a search result and a browser tab are
 * copy, and copy says REMI. `BRAND_LEGAL_NAME` appears in exactly one place on
 * this site: the footer's © line.
 */
export const siteName = BRAND_NAME;

const ogLocale: Record<Locale, string> = { en: "en_GB", fr: "fr_BE" };

type Options = {
  title: string;
  description: string;
  /** Route path WITHOUT the locale prefix, leading slash included. "/" for home. */
  path: string;
  locale: Locale;
};

/**
 * Per-route metadata with the canonical and hreflang URLs derived rather than
 * retyped. Every page is published twice — /en/... and /fr/... — and the
 * `languages` alternates are what tell search engines the two are the same
 * page, not duplicates. `x-default` points at English, the fallback the proxy
 * also uses.
 *
 * A help centre lives or dies in search results, so apps/support/AGENTS.md
 * treats a route with no metadata as incomplete rather than merely unpolished:
 * every page goes through this.
 */
export const buildMetadata = ({
  title,
  description,
  path,
  locale,
}: Options): Metadata => ({
  title,
  description,
  alternates: {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      fr: localePath("fr", path),
      "x-default": localePath("en", path),
    },
  },
  openGraph: {
    title: `${title} · ${siteName}`,
    description,
    url: localePath(locale, path),
    siteName,
    locale: ogLocale[locale],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteName}`,
    description,
  },
});
