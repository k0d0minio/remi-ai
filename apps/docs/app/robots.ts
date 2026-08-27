import type { MetadataRoute } from "next";

/**
 * The docs site carries internal business knowledge — the frozen build scope,
 * the objectives behind it, and the decision log's own account of what is and
 * is not gated. None of that is meant to be found by search, so the posture
 * here is admin's, not marketing's: disallow everything, and no sitemap, since
 * a sitemap's only job is to invite the crawl this file is refusing.
 *
 * The root layout also sends `noindex`, but that is only read after a crawler
 * has fetched the page; this stops the fetch. Neither is an access control —
 * whether the deployment is reachable at all is a Vercel deployment-protection
 * question, settled outside this repo.
 *
 * Reversible on purpose: if the site is later made public with the confidential
 * pages moved out, this file becomes marketing's `allow: "/"` plus a sitemap.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", disallow: "/" },
});

export default robots;
