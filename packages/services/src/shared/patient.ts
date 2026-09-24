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

/**
 * Who put a row there, on the tables the console and the patient link both
 * write — the meal journal and the goal check-ins today, and whatever
 * `patient-loop` adds next.
 *
 * `practitioner` is the default because it is what every row predating the
 * patient link's write path actually was: Morgane transcribing from WhatsApp.
 * The distinction is not decoration — the console shows « écrit par la
 * patiente » from it, and the later AI round has to tell a patient's own words
 * from her transcription of them.
 */
export const writtenByKinds = ["practitioner", "patient"] as const;

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

/**
 * Why a meal was written down: « Je vais manger » before it, « J'ai mangé »
 * after (§ 8).
 *
 * `eaten` is the default because it is what every row predating the patient's
 * own entry control was: Morgane transcribing a meal that had already
 * happened. A planned entry becomes an eaten one on the same row — one meal is
 * one record — so the pair is a state the row moves through, never two rows to
 * reconcile, and it moves one way only.
 */
export const mealIntents = ["planned", "eaten"] as const;

/**
 * § D's check-in vocabulary — how a goal moved since the last one.
 *
 * English keys because they are what `patient_goal_check_ins` stores; the
 * French Morgane reads (mieux / stable / moins bien) lives in the console's
 * `vocabulary.ts`. A check-in may carry no direction at all: § D offers the
 * direction *or* a simple measure, and one of the two is enough.
 */
export const goalDirections = ["better", "stable", "worse"] as const;

/**
 * How a challenge ended, picked by Morgane when she closes it (decision D-27).
 *
 * English keys because they are what `patient_challenges.outcome` stores; the
 * French she reads (Acquis / Non acquis / Abandonné) lives in the console's
 * `vocabulary.ts`. An open challenge has no outcome at all — null is the
 * state, not a fourth key.
 */
export const challengeOutcomes = [
  "acquired",
  "not_acquired",
  "abandoned",
] as const;

/**
 * The "principales" rule: the first active recommendation of each category, in
 * the category order above.
 *
 * It lives here rather than in either app because the console's at-a-glance
 * and the patient link's home are one decision — what "prioritised" means is
 * Morgane's, and two copies of the rule are two things to disagree. Callers
 * pass the active list already ordered by category then position, which is
 * what `listPatientRecommendations` returns; this picks the head of each run
 * and never re-sorts, so reordering in the console reorders both surfaces.
 */
export const firstRecommendationPerCategory = <
  T extends { category: (typeof recommendationCategories)[number] },
>(
  recommendations: readonly T[],
): readonly T[] =>
  recommendationCategories.flatMap((category) => {
    const first = recommendations.find(
      (recommendation) => recommendation.category === category,
    );
    return first ? [first] : [];
  });

/**
 * The query parameter the console adds to a patient's link when Morgane opens
 * it « comme la patiente » (her 14 Sept § 7). The link sees it once, clears it
 * from the address bar and remembers the preview for an hour, so her looking
 * is never recorded as the patient opening their link. Shared because two apps
 * speak it: the console writes it, the link reads it.
 */
export const patientLinkPreviewParam = "apercu";
