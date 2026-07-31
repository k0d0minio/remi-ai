import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

/**
 * Hidden routes: unlinked, absent from the sitemap, `noindex` in their own
 * metadata, and disallowed here. The bare path is listed alongside the locale
 * prefixes because the proxy only redirects a request it actually receives —
 * a crawler that reads robots.txt should be told about the path it would be
 * redirected from as well as the two it would land on.
 */
const hidden = ["/cto-proposal", "/en/cto-proposal", "/fr/cto-proposal"];

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/", disallow: hidden },
  sitemap: `${siteUrl}/sitemap.xml`,
});

export default robots;
