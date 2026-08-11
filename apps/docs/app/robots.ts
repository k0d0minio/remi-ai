import type { MetadataRoute } from "next";

/**
 * The docs site holds the pilot's exact pricing and the reasoning behind it —
 * the figures the public site withholds on purpose. The operator gate is what
 * actually protects them; this is defence in depth, and it closes the state the
 * audit called the only wrong one: crawlable with no guidance at all.
 *
 * Modelled on `apps/admin/app/robots.ts`, and for the same reason: `noindex` in
 * the root layout is only read after a crawler has already fetched the page.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", disallow: "/" },
});

export default robots;
