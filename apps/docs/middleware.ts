import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@remi/services/shared";
import { PATHNAME_HEADER, SIGN_IN_PATH } from "@/lib/auth/constants";

/**
 * The cheap half of the gate, and the only place that knows the request path.
 *
 * It does two jobs. First: no cookie, no page render — the same filter the
 * console uses, carrying no authority, because the edge runtime cannot reach the
 * auth store to find out who holds the cookie. Second: it stamps the pathname on
 * the request so `app/layout.tsx` — which is the authoritative check, and which
 * Next gives no other way to know where it is — can exempt the sign-in page from
 * the gate without exempting anything else.
 *
 * The matcher deliberately covers `_pagefind`: the search index is built from
 * the pages themselves, so leaving it open would publish their contents through
 * the back door.
 */
export const middleware = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  const allowed =
    request.nextUrl.pathname === SIGN_IN_PATH ||
    request.cookies.has(SESSION_COOKIE);

  if (allowed) {
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
