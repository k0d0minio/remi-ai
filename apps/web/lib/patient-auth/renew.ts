import { NextResponse, type NextRequest } from "next/server";
import { ensureAuthProvider } from "@/lib/auth/provider";

/**
 * Lets a page request continue, with the patient's cached session renewed
 * when it ran out.
 *
 * The auth adapter keeps a signed copy of the session in a cookie for 5
 * minutes. While the copy is fresh, a session read does not call the auth
 * server. A page render cannot write a cookie, so nothing renewed the copy
 * after the first 5 minutes of a session: each read of each page then called
 * the auth server, and the auth server limits the calls of one address. When
 * it refused a read, a signed-in patient saw the sign-in page (2026-11-20).
 *
 * The proxy can write a cookie. It renews the copy here, once in 5 minutes
 * for each patient, and gives it to this request too, so the render that
 * follows reads the copy.
 *
 * This is not the check. The pages and the server actions check the session
 * themselves (`session.ts`). A request with no token, or with a token that
 * the auth server refuses, gets no copy and continues to that check. A
 * failed renewal changes nothing: no cookie is cleared here.
 */
export const continueWithSession = async (
  request: NextRequest,
): Promise<NextResponse> => {
  // No cookie at all: a visitor. The auth adapter is not loaded for them.
  if (!request.headers.get("cookie")) {
    return NextResponse.next();
  }
  try {
    const renewal = await ensureAuthProvider()?.renewSessionCache(request);
    if (!renewal) {
      return NextResponse.next();
    }
    const headers = new Headers(request.headers);
    headers.set("cookie", renewal.cookieHeader);
    const response = NextResponse.next({ request: { headers } });
    for (const cookie of renewal.setCookies) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch (cause) {
    // The name only: a message can quote a request.
    console.error("[auth] the proxy did not renew the session cache", {
      name: cause instanceof Error ? cause.name : "unknown error",
    });
    return NextResponse.next();
  }
};
