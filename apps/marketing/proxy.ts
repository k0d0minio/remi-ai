import { NextResponse, type NextRequest } from "next/server";
import { defaultLocalePath } from "@remi/services/shared";
import {
  underConstruction,
  underConstructionSegment,
} from "@/lib/under-construction";

/**
 * Every page lives under /fr. The site is French only (Jamie, 2026-11-03),
 * so a bare path and an /en path both go to /fr — a 307, so a later English
 * site is not cached away.
 *
 * While the site is under construction, every page rewrites to the holding
 * page. A rewrite, not a redirect: the address a visitor typed stays, and
 * still works the day the site opens.
 */
const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const [, first, second] = pathname.split("/");

  if (first === "fr") {
    if (
      underConstruction &&
      second !== underConstructionSegment &&
      second !== "opengraph-image"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/fr/${underConstructionSegment}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // A first segment of two letters is a language that is not served (`/en`):
  // `defaultLocalePath` replaces it. A path with no language gets the prefix.
  const url = request.nextUrl.clone();
  url.pathname = defaultLocalePath(pathname);
  return NextResponse.redirect(url);
};

export default proxy;

export const config = {
  /* Everything except Next internals and files with an extension —
     sitemap.xml, robots.txt and static assets stay unprefixed. */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
