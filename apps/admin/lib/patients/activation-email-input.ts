import type {
  ActivationEmailInput,
  ActivationEmailTrigger,
} from "@remi/services/server";
import {
  appHref,
  fileTakeoverPath,
  patientSignInPath,
} from "@remi/services/shared";

/**
 * The links of « Votre espace REMI est prêt », on the origin of the patient
 * app. The admin app owns no patient page, so both links come from the
 * catalogue of origins (`appHref`). The take-over link holds a one-time
 * token: do not log what this builds.
 */
export const activationEmailInput = (
  trigger: ActivationEmailTrigger,
): ActivationEmailInput => ({
  trigger,
  linkFor: (token, locale) => appHref("web", fileTakeoverPath(token), locale),
  signInUrl: (locale) => appHref("web", patientSignInPath, locale),
});
