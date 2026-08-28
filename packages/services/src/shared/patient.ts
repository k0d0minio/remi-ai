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

export const recommendationCategories = [
  "nutrition",
  "habit",
  "supplement",
  "activity",
  "monitoring",
] as const;
