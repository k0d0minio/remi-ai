import type { Metadata } from "next";

/**
 * The site's own origin. Needed as a real URL rather than a path because
 * `metadataBase` resolves every relative OG and canonical URL against it, and a
 * social card with a relative image URL silently renders blank.
 *
 * Registered in turbo.json's globalEnv and docs/ENV.md. The localhost fallback
 * is for `pnpm marketing:dev`, where the variable is not set.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3001";

export const siteName = "Remi AI";

type Options = {
  title: string;
  description: string;
  /** Route path, leading slash included. "/" for the landing page. */
  path: string;
};

/**
 * Per-route metadata with the canonical URL derived rather than retyped.
 *
 * apps/marketing/AGENTS.md treats a route with no metadata as incomplete, so
 * every page goes through this. The OG image is supplied by the
 * app/opengraph-image.tsx file convention and inherited automatically — it does
 * not need naming here.
 */
export const buildMetadata = ({
  title,
  description,
  path,
}: Options): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title: `${title} · ${siteName}`,
    description,
    url: path,
    siteName,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${siteName}`,
    description,
  },
});
