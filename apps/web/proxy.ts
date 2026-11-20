import { NextResponse, type NextRequest } from "next/server";
import { defaultLocalePath, isLocale } from "@remi/services/shared";
import { continueWithSession } from "@/lib/patient-auth/renew";

/**
 * Every page lives under /fr. The app is French only (Jamie, 2026-11-20), so
 * a bare path and an /en path both go to the same page under /fr, whatever the
 * browser's language. It also renews the cached session of a signed-in patient
 * (`lib/patient-auth/renew.ts`): a page render cannot write a cookie, and the
 * proxy can.
 *
 * A 307, not a 308, because the answer depends on a request header and must not
 * be cached as permanent. Route handlers are excluded by the matcher — /api is
 * a machine surface and has no language.
 */
const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    return continueWithSession(request);
  }

  const url = request.nextUrl.clone();
  url.pathname = defaultLocalePath(pathname);
  return NextResponse.redirect(url);
};

export default proxy;

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
