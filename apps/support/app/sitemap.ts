import type { MetadataRoute } from "next";
import { localePath, locales } from "@remi/services/shared";
import { siteUrl } from "@/lib/metadata";

/**
 * One entry per locale, for the one route that exists. Article routes are added
 * here as they land — a help centre earns its traffic in search results, so a
 * page missing from this list is a page nobody finds.
 */
const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
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
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`]),
        ),
      },
    })),
  );

export default sitemap;
