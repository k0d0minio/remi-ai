import {
  patientSignInPath,
  type PatientLanding,
} from "@remi/services/shared";

/**
 * The patient's routes, as paths under the locale. One home for them: the
 * sign-up, the sign-in and the pages behind the patient session all link here.
 * The paths are French, as `/inscription` is.
 */
/** From the services package: the activation e-mail links to the same page. */
export const SIGN_IN_PATH = patientSignInPath;
export const FORGOT_PASSWORD_PATH = "/connexion/mot-de-passe-oublie";
export const NEW_PASSWORD_PATH = "/connexion/nouveau-mot-de-passe";
/** Where the magic link lands. A route handler: it completes the sign-in. */
export const MAGIC_LINK_PATH = "/connexion/lien";
export const QUESTIONNAIRE_PATH = "/questionnaire";
/** The waiting screen: the questionnaire is complete, the care is not active. */
export const WAITING_PATH = "/attente";
export const HOME_PATH = "/accueil";
export const RECIPES_PATH = "/recettes";
/** The page of one recipe of the patient (REM-94). */
export const recipePath = (id: string) => `${RECIPES_PATH}/${id}`;
export const PROFILE_PATH = "/profil";
/** « Mes recommandations », below the Profil tab (story 23). */
export const RECOMMENDATIONS_PATH = "/profil/recommandations";
/** The patient's own follow-up data, below the Profil tab (REM-85). */
export const PROFILE_DATA_PATH = "/profil/mes-donnees";

/**
 * The screen of a patient whose care consent is not in force (REM-43). It is
 * outside the patient space: the space does not open without that consent.
 */
export const CARE_CONSENT_PATH = "/consentement";

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
