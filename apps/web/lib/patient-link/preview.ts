import { NextResponse, type NextRequest } from "next/server";
import { isLocale, patientLinkPreviewParam } from "@remi/services/shared";

/**
 * « Voir comme la patiente » (her 14 Sept § 7): the console opens the
 * patient's own link with `?apercu=1`. The proxy answers that once — it
 * remembers the preview for this token in a cookie for an hour and redirects
 * to the clean address — and `loadPatientLink` records no open while the
 * cookie names the token being read.
 *
 * It is a marker, not a session: it grants nothing, reads nothing and names
 * no one. Anyone could set it, and all it would do is keep their own visit
 * from being counted as the patient's — which is the one thing it is for. The
 * address bar never keeps the parameter, so a link copied from the preview
 * tab and sent on is the plain link.
 */
export const LINK_PREVIEW_COOKIE = "remi-link-preview";

const PREVIEW_SECONDS = 60 * 60;

/** The redirect that starts a preview, or `null` when this is not one. */
export const previewRedirect = (request: NextRequest): NextResponse | null => {
  const { nextUrl } = request;
  if (nextUrl.searchParams.get(patientLinkPreviewParam) !== "1") {
    return null;
  }
  const [, locale, segment, token] = nextUrl.pathname.split("/");
  if (!isLocale(locale) || segment !== "p" || !token) {
    return null;
  }
  const url = nextUrl.clone();
  url.searchParams.delete(patientLinkPreviewParam);
  const response = NextResponse.redirect(url);
  response.cookies.set(LINK_PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: nextUrl.protocol === "https:",
    maxAge: PREVIEW_SECONDS,
    path: "/",
  });
  return response;
};
