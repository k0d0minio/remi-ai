import type { PatientLanding } from "@remi/services/shared";

/**
 * The patient's routes, as paths under the locale. One home for them: the
 * sign-up, the sign-in and the pages behind the patient session all link here.
 * The same French paths serve both locales, as `/inscription` does.
 */
export const SIGN_IN_PATH = "/connexion";
export const FORGOT_PASSWORD_PATH = "/connexion/mot-de-passe-oublie";
export const NEW_PASSWORD_PATH = "/connexion/nouveau-mot-de-passe";
/** Where the magic link lands. A route handler: it completes the sign-in. */
export const MAGIC_LINK_PATH = "/connexion/lien";
export const QUESTIONNAIRE_PATH = "/questionnaire";
/** The waiting screen: the questionnaire is complete, the care is not active. */
export const WAITING_PATH = "/attente";
export const HOME_PATH = "/accueil";
export const RECIPES_PATH = "/recettes";
export const PROFILE_PATH = "/profil";

/** The page a signed-in patient reaches first. */
export const landingPaths: Record<PatientLanding, string> = {
  questionnaire: QUESTIONNAIRE_PATH,
  waiting: WAITING_PATH,
  home: HOME_PATH,
};

/** Why the sign-in page opens with a notice. A query value, not copy. */
const signInNotices = ["no_account", "password_changed"] as const;

export type SignInNotice = (typeof signInNotices)[number];

export const isSignInNotice = (value: unknown): value is SignInNotice =>
  signInNotices.includes(value as SignInNotice);
