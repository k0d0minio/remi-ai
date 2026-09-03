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

/**
 * § B of the v2 brainstorm: the twelve areas an anamnesis is taken across, in
 * the order Morgane works through them.
 *
 * The keys are English and stable because they are what `patient_anamnesis`
 * stores per row; the French wording she reads lives in the console's
 * `vocabulary.ts`. That split is what makes trimming or renaming a category a
 * two-line edit rather than a migration — and what lets the later AI round
 * write into the same slots without reshaping anything.
 */
export const anamnesisCategories = [
  "motive",
  "health",
  "nutrition",
  "hydration",
  "digestion",
  "elimination",
  "sleep",
  "immunity",
  "cardiovascular",
  "musculoskeletal",
  "endocrine",
  "context",
] as const;

/**
 * § 5's meal slots, in the order of a day.
 *
 * A closed set so the journal can group and filter on it, but the column is
 * nullable and null is a first-class value: an entry with no slot is normal,
 * not incomplete. The keys are stable ASCII because they are what the row
 * stores; the accented French Morgane reads lives in the console's
 * `vocabulary.ts`, so her words can change without a migration — and whether
 * she wants a slot at all is still hers to confirm.
 */
export const mealSlots = [
  "petit_dejeuner",
  "dejeuner",
  "diner",
  "collation",
] as const;
