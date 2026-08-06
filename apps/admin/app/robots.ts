import type { MetadataRoute } from "next";

/**
 * Nothing in the operator console is public. The root layout already sends
 * `noindex`, but that is only read after a crawler has fetched the page —
 * this stops the fetch, which matters while the console is reachable on a
 * custom domain without an access gate in front of it.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", disallow: "/" },
});

export default robots;
