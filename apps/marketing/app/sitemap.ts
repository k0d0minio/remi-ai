import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: siteUrl,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${siteUrl}/contact`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

export default sitemap;
