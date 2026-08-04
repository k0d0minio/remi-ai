import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

/**
 * Everything here is public and meant to be found — a help centre a search
 * engine cannot read is a help centre nobody reaches. Nothing is hidden, so
 * there is no disallow list; if a route ever needs one it also needs `noindex`
 * in its own metadata and an absence from the sitemap.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/" },
  sitemap: `${siteUrl}/sitemap.xml`,
});

export default robots;
