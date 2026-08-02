/**
 * The REMI domain, one file per entity.
 *
 * Types only — no runtime value crosses this barrel, which is what lets
 * `@remi/services/shared` re-export the vocabulary for browser code while the
 * rest of `/db` stays server-only.
 */

export type { Consultation } from "./consultation";
export type { Meal, MealSlot, MealStatus } from "./meal";
export type {
  GenotypeMarker,
  HabitsProfile,
  PersonalisationDimension,
  PersonalisationProfile,
  Person,
  PersonStatus,
  PsychologyProfile,
  RhythmProfile,
} from "./person";
export type { Plan, PlanStatus } from "./plan";
export type { Practitioner } from "./practitioner";
export type {
  ProgressSignal,
  SignalKind,
  SignalSeverity,
} from "./progress-signal";
export type { Ingredient, Recipe } from "./recipe";
export type { Recommendation, RecommendationCategory } from "./recommendation";
export type { Step, StepStatus } from "./step";
export type { FramePrinciple, TherapeuticFrame } from "./therapeutic-frame";
