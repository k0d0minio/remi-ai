import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";
import { underConstruction } from "@/lib/under-construction";

const robots = (): MetadataRoute.Robots =>
  underConstruction
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${siteUrl}/sitemap.xml`,
      };

export default robots;
