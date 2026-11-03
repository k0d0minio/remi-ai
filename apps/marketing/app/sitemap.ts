import type { MetadataRoute } from "next";
import { localePath } from "@remi/services/shared";
import { legalSlugs } from "@/lib/content/legal";
import { siteUrl } from "@/lib/metadata";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  ...legalSlugs.map((slug) => ({ path: `/${slug}`, priority: 0.3 })),
];

/** One page and its four legal pages, in French. */
const sitemap = (): MetadataRoute.Sitemap =>
  pages.map(({ path, priority }) => ({
    url: `${siteUrl}${localePath("fr", path)}`,
    changeFrequency: "monthly" as const,
    priority,
  }));

export default sitemap;
