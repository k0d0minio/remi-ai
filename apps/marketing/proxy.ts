import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

/**
 * Every page lives under /en or /fr; this redirects the bare paths there.
 *
 * The locale comes from the first language in Accept-Language that we can
 * serve, so a Brussels visitor lands on French and everyone else on English —
 * a 307, not a 308, because the answer depends on a request header and must
 * not be cached as permanent.
 */
const pickLocale = (request: NextRequest): Locale => {
  const header = request.headers.get("accept-language");
  if (!header) {
    return defaultLocale;
  }
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) {
      return code;
    }
  }
  return defaultLocale;
};

const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
};

export default proxy;

export const config = {
  /* Everything except Next internals and files with an extension —
     sitemap.xml, robots.txt and static assets stay unprefixed. */
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
