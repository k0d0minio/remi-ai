import { recommendationCategories } from "@remi/services/shared";
import type {
  AnamnesisCategory,
  ConsentChannel,
  CookingAffinity,
  GoalDirection,
  MealSlot,
  PatientSex,
  PatientStatus,
  RecommendationCategory,
} from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * One mapping for the patient vocabulary, read by the roster, the detail page
 * and both recommendation forms: a status must read identically everywhere an
 * operator can act on it.
 *
 * French, because the console's operators are Morgane and Arnaud. Identifiers
 * and comments stay English per `CONVENTIONS.md` — it is the rendered copy that
 * follows the reader, not the code.
 */

export const patientStatusLabels: Record<PatientStatus, string> = {
  active: "en cours",
  paused: "en pause",
  ended: "terminé",
};

export const patientStatusIntents: Record<PatientStatus, Intent> = {
  active: "success",
  paused: "warning",
  ended: "neutral",
};

export const patientSexLabels: Record<PatientSex, string> = {
  female: "femme",
  male: "homme",
  other: "autre",
  unspecified: "non précisé",
};

/** How the consent was given — read on the profile and in the select. */
export const consentChannelLabels: Record<ConsentChannel, string> = {
  consultation: "en consultation",
  whatsapp: "WhatsApp",
  email: "email",
};

export const categoryLabels: Record<RecommendationCategory, string> = {
  nutrition: "Nutrition",
  habit: "Habitudes",
  supplement: "Compléments",
  activity: "Activité",
  monitoring: "Suivi",
};

/**
 * The categories the recommendation add form offers — every one except
 * `supplement`, which the supplement protocol now owns (§ G). The full
 * `recommendationCategories` is untouched, so an existing `supplement`-category
 * recommendation still validates, groups and renders, and can still be
 * re-categorised from the edit form; only new entries are steered away from it.
 */
export const addableRecommendationCategories = recommendationCategories.filter(
  (category) => category !== "supplement",
);

/** Whether the person likes cooking — read on the profile and in the select. */
export const cookingAffinityLabels: Record<CookingAffinity, string> = {
  yes: "oui",
  somewhat: "un peu",
  no: "non",
};

/**
 * The moments of a day, as Morgane writes them.
 *
 * Pending her confirmation — both the words and whether she wants a slot at
 * all. Because the row stores the stable keys, changing either is an edit here
 * or one line in `mealSlots`, never a migration.
 */
export const mealSlotLabels: Record<MealSlot, string> = {
  petit_dejeuner: "petit-déjeuner",
  dejeuner: "déjeuner",
  diner: "dîner",
  collation: "collation",
};

/**
 * Typing aids, not a closed set: the regime field takes anything Morgane
 * writes, and these are only the ones she reaches for often enough to be worth
 * one keystroke. Adding one here changes nothing about what can be stored.
 */
export const dietaryRegimeSuggestions = [
  "végétarien",
  "végétalien",
  "sans gluten",
  "sans lactose",
  "pescétarien",
  "flexitarien",
  "halal",
  "casher",
] as const;

/**
 * § B's twelve areas of enquiry, worded as Morgane's brainstorm words them.
 * The keys are what the database stores, so retitling one — or dropping one
 * from `anamnesisCategories` — is an edit here and in that constant, never a
 * migration.
 */
export const anamnesisCategoryLabels: Record<AnamnesisCategory, string> = {
  motive: "Motif et attentes",
  health: "Santé",
  nutrition: "Alimentation",
  hydration: "Hydratation",
  digestion: "Digestion",
  elimination: "Élimination",
  sleep: "Sommeil, stress, énergie",
  immunity: "Immunité, ORL, respiration",
  cardiovascular: "Cardiovasculaire, lymphatique",
  musculoskeletal: "Ostéo-articulaire, activité",
  endocrine: "Endocrinien, gynéco",
  context: "Contexte de vie",
};

/**
 * § D's check-in words, as Morgane says them. The keys are what
 * `patient_goal_check_ins` stores, so rewording one is an edit here alone.
 */
export const goalDirectionLabels: Record<GoalDirection, string> = {
  better: "mieux",
  stable: "stable",
  worse: "moins bien",
};

/**
 * Only a worsening earns a warning colour. A trail where every row is tinted
 * reads as noise; the row that should catch her eye is the one going the wrong
 * way.
 */
export const goalDirectionIntents: Record<GoalDirection, Intent> = {
  better: "success",
  stable: "neutral",
  worse: "warning",
};
