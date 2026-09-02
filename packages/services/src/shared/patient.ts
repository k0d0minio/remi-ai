/**
 * The runtime half of the patient vocabulary. The types in `db/models/` derive
 * from these constants, so a select option, a zod enum and the model can never
 * disagree — and because models are types-only, the constants live here where
 * browser code may import them.
 */

export const patientStatuses = ["active", "paused", "ended"] as const;

/**
 * Recorded because a nutritional protocol is written against it, not as an
 * identity statement — hence `unspecified` as the default rather than a
 * required choice, and `other` as a real option rather than a fallback.
 */
export const patientSexes = ["female", "male", "other", "unspecified"] as const;

/**
 * How the patient agreed — a closed set rather than free text, so "how did
 * people consent?" stays a countable question. `consultation` is in person or
 * by video during a session; the other two are the channels Morgane already
 * uses to reach her patients between them.
 */
export const consentChannels = ["consultation", "whatsapp", "email"] as const;

export const recommendationCategories = [
  "nutrition",
  "habit",
  "supplement",
  "activity",
  "monitoring",
] as const;

/**
 * Whether the person likes cooking — § A of the v2 brainstorm asks yes/no, and
 * the answer drives how simple a recipe suggestion has to be. Kept as a closed
 * set rather than a boolean so "un peu" costs a constant rather than a
 * migration; not recorded is `null`, the same shape as the consent channel.
 */
export const cookingAffinities = ["yes", "somewhat", "no"] as const;
