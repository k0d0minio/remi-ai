import { NextResponse, type NextRequest } from "next/server";
import { isLocale, pickLocaleFromHeader } from "@remi/services/shared";
import {
  underConstruction,
  underConstructionSegment,
} from "@/lib/under-construction";

/**
 * Every page lives under /en or /fr; this redirects the bare paths there.
 *
 * The locale comes from the first language in Accept-Language that we can
 * serve, so a Brussels visitor lands on French and everyone else on English —
 * a 307, not a 308, because the answer depends on a request header and must
 * not be cached as permanent.
 *
 * While the site is under construction, every page under a locale rewrites to
 * that locale's holding page. A rewrite, not a redirect: the address a visitor
 * typed stays, and still works the day the site opens.
 */
const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const [, first, second] = pathname.split("/");

  if (isLocale(first)) {
    if (
      underConstruction &&
      second !== underConstructionSegment &&
      second !== "opengraph-image"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}/${underConstructionSegment}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const locale = pickLocaleFromHeader(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
};

export default proxy;

export const config = {
  /* Everything except Next internals and files with an extension —
     sitemap.xml, robots.txt and static assets stay unprefixed. */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
