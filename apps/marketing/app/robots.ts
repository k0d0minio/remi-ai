import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/" },
  sitemap: `${siteUrl}/sitemap.xml`,
});

export default robots;
