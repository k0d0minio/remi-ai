import type { MetadataRoute } from "next";
import { localePath, locales } from "@remi/services/shared";
import { siteUrl } from "@/lib/metadata";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/practitioners", priority: 0.9 },
  { path: "/individuals", priority: 0.9 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
];

/**
 * Every page exists once per locale; the `alternates.languages` entries mirror
 * the hreflang tags in each page's metadata so crawlers see the same story in
 * both places.
 */
const sitemap = (): MetadataRoute.Sitemap =>
  pages.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localePath(locale, path)}`,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`]),
        ),
      },
    })),
  );

export default sitemap;
