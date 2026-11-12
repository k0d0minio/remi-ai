import type { MetadataRoute } from "next";
import { isProduction, siteUrl } from "@/lib/metadata";
import { underConstruction } from "@/lib/under-construction";

/** Only the open production site is crawled. Every other deployment says no. */
const robots = (): MetadataRoute.Robots =>
  isProduction && !underConstruction
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${siteUrl}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };

export default robots;
