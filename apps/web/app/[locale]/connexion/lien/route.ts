import { redirect } from "next/navigation";
import {
  completePatientSignIn,
  isSessionReadError,
} from "@remi/services/server";
import { isLocale, localePath } from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { landingPaths, SIGN_IN_PATH } from "@/lib/patient-auth/paths";

/** Reads the session on every hit. */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ locale: string }> };

/**
 * Where the magic link lands (story 2). The auth server checks the link on its
 * own host, then redirects here with a one-time proof. The first hit turns the
 * proof into the session cookies and redirects to this address again, without
 * the proof. The second hit reads the session.
 *
 * - A patient account: one `patient.signed_in` event, then the patient's
 *   current page.
 * - An identity with no patient file: the session closes, and the sign-in
 *   page says to sign up with the practitioner's link.
 * - No session: the link expired or was used. The sign-in page opens.
 * - The session read failed: the sign-in page opens too. The visitor is not
 *   signed in on this path until the read succeeds, so no session is lost.
 *
 * A signed-in patient who opens this address again writes one more event.
 * The trail then reads one sign-in too many, never one too few.
 */
export const GET = async (request: Request, { params }: Context) => {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "fr";
  const signIn = localePath(locale, SIGN_IN_PATH);
  ensureDatabase();
  const provider = ensureAuthProvider();
  const exchanged = provider
    ? await provider.completeRedirectSignIn(request)
    : null;
  if (exchanged) {
    return exchanged;
  }
  const identity = provider
    ? await provider.readIdentity().catch((cause: unknown) => {
        if (isSessionReadError(cause)) {
          return null;
        }
        throw cause;
      })
    : null;
  if (!provider || !identity) {
    redirect(signIn);
  }
  const completed = await completePatientSignIn(identity, "magic_link");
  if (!completed.ok) {
    await provider.signOut();
    redirect(`${signIn}?notice=no_account`);
  }
  redirect(localePath(locale, landingPaths[completed.data.landing]));
};
