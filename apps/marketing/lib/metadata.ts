import type { Metadata } from "next";
import { appOrigin, localePath } from "@remi/services/shared";
import { BRAND_NAME } from "@remi/ui/server";

/**
 * The site's own origin. Needed as a real URL rather than a path because
 * `metadataBase` resolves every relative OG and canonical URL against it, and a
 * social card with a relative image URL silently renders blank.
 *
 * It comes from the same catalogue as every cross-app link
 * (`@remi/services/shared` → `links.ts`) rather than from a local literal: this
 * site's canonical URL and the URL another app links it by are the same fact.
 */
export const siteUrl = appOrigin("marketing");

/**
 * Only the production deployment may be indexed. `uat` and every preview build
 * the same code, and an indexed copy competes with production in search.
 * `VERCEL_TARGET_ENV` names the Vercel environment, custom ones included
 * (`uat`), at build and at runtime. `VERCEL_ENV` cannot tell them apart: it
 * reads `preview` on a custom environment. Unset, as in local development,
 * means not production.
 */
export const isProduction = process.env.VERCEL_TARGET_ENV === "production";

/**
 * The product name, not the company — a search result and a browser tab are
 * copy, and copy says REMI. The company name appears in the footer's © line
 * and the legal pages only.
 */
export const siteName = BRAND_NAME;

type Options = {
  title: string;
  description: string;
  /** Route path WITHOUT the locale prefix, leading slash included. "/" for home. */
  path: string;
  /** True when `title` is the whole tab title and must not take the template. */
  absoluteTitle?: boolean;
};

/**
 * Per-route metadata with the canonical URL derived rather than retyped. The
 * site is French only, so the one alternate is `fr`, and `x-default` points
 * at it too. The OG image comes from `app/[locale]/opengraph-image.tsx` and
 * every route inherits it.
 */
export const buildMetadata = ({
  title,
  description,
  path,
  absoluteTitle,
}: Options): Metadata => ({
  title: absoluteTitle ? { absolute: title } : title,
  description,
  alternates: {
    canonical: localePath("fr", path),
    languages: {
      fr: localePath("fr", path),
      "x-default": localePath("fr", path),
    },
  },
  openGraph: {
    title: absoluteTitle ? title : `${title} · ${siteName}`,
    description,
    url: localePath("fr", path),
    siteName,
    locale: "fr_BE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: absoluteTitle ? title : `${title} · ${siteName}`,
    description,
  },
});
