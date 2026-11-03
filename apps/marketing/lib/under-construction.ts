/**
 * Production shows a holding page until the site opens; uat builds the same
 * `main` and shows the full site. One flag, set on the production target only,
 * decides which — so opening the site is an env change and a redeploy, not a
 * code change.
 *
 * Read by the proxy (every page rewrites to the holding page), the layout
 * (no header or footer to lead anywhere) and robots.txt (nothing to index).
 */
export const underConstruction = process.env.UNDER_CONSTRUCTION === "1";

/** The holding page's segment, under each locale. */
export const underConstructionSegment = "under-construction";
