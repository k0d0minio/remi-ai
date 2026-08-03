import { NextResponse, type NextRequest } from "next/server";
import { isLocale, pickLocaleFromHeader } from "@remi/services/shared";

/**
 * Every page lives under /en or /fr; this redirects the bare paths there.
 *
 * A 307, not a 308, because the answer depends on a request header and must not
 * be cached as permanent. Route handlers are excluded by the matcher — /api is
 * a machine surface and has no language.
 */
const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return NextResponse.next();
  }

  const locale = pickLocaleFromHeader(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
};

export default proxy;

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
