import { redirect } from "next/navigation";
import { completePatientSignIn } from "@remi/services/server";
import { isLocale, localePath } from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { landingPaths, SIGN_IN_PATH } from "@/lib/patient-auth/paths";

/** Reads the session on every hit. */
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ locale: string }> };

/**
 * Where the magic link lands (story 2). The auth API checked the link and set
 * the session before it redirected here. This handler takes the input of no
 * caller: it reads the session only.
 *
 * - A patient account: one `patient.signed_in` event, then the patient's
 *   current page.
 * - An identity with no patient file: the session closes, and the sign-in
 *   page says to sign up with the practitioner's link.
 * - No session: the link expired or was used. The sign-in page opens.
 *
 * A signed-in patient who opens this address again writes one more event.
 * The trail then reads one sign-in too many, never one too few.
 */
export const GET = async (_request: Request, { params }: Context) => {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "fr";
  const signIn = localePath(locale, SIGN_IN_PATH);
  ensureDatabase();
  const provider = ensureAuthProvider();
  const identity = provider ? await provider.readIdentity() : null;
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
