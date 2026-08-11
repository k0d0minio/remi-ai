import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@remi/services/shared";

/**
 * The cheap half of the gate: no cookie, no page render.
 *
 * It carries no authority and is not allowed to — a cookie's presence proves
 * nothing about who holds it, and the edge runtime cannot reach the auth store
 * to find out. The authoritative check is `app/(admin)/layout.tsx`, which
 * resolves the token against Neon and reads the role from the row. This exists
 * so an unauthenticated request never reaches a server component that renders
 * confidential content, and so the common case costs no database round trip.
 */
export const middleware = (request: NextRequest) => {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/sign-in", request.url));
};

export const config = {
  /*
   * Everything except the sign-in page itself (it would redirect to itself),
   * Next's own asset routes, and `robots.txt` — a crawler should be told to go
   * away rather than redirected to a form it will then try to index.
   */
  matcher: [
    "/((?!sign-in|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
