/**
 * The patient sign-up form (story 2), in the order the page shows its fields.
 * Isomorphic and import-free: the form reads the names, the service reads the
 * rules.
 */
export const signupFields = [
  "lastName",
  "firstName",
  "birthDate",
  "email",
  "phone",
  "password",
] as const;

export type SignupField = (typeof signupFields)[number];

/** Why a field was refused. The page turns each code into a sentence. */
export type SignupFieldError = "required" | "invalid" | "too_short";

export type SignupFieldErrors = Partial<Record<SignupField, SignupFieldError>>;

/** The one password rule (Jamie, 2026-11-01). */
export const minPasswordLength = 8;

/**
 * Where a signed-in patient lands: the questionnaire before activation, the
 * home after it (story 2). The app maps each value to its route.
 */
export type PatientLanding = "questionnaire" | "home";
