import type { MetadataRoute } from "next";
import { localePath, locales } from "@remi/services/shared";
import { en } from "@/lib/content/en";
import { siteUrl } from "@/lib/metadata";

/**
 * Every route, once per locale. The category and article entries are derived
 * from the dictionary rather than listed again here: a help centre earns its
 * traffic in search results, and an article missing from this file is an
 * article nobody finds. Deriving them is what stops the two from drifting the
 * day someone adds an answer and forgets this file exists.
 *
 * English is read for the paths because slugs are identical across locales.
 */
const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  ...en.categories.map((category) => ({
    path: `/${category.slug}`,
    priority: 0.8,
  })),
  ...en.articles.map((article) => ({
    path: `/${article.category}/${article.slug}`,
    priority: 0.7,
  })),
  { path: "/status", priority: 0.4 },
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
