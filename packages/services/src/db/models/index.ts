/**
 * The REMI domain, one file per entity.
 *
 * Types only — no runtime value crosses this barrel, which is what lets
 * `@remi/services/shared` re-export the vocabulary for browser code while the
 * rest of `/db` stays server-only.
 */

export type { AuditAction, AuditEvent } from "./audit-event";
export type { Consultation } from "./consultation";
export type { Operator, OperatorRole } from "./operator";
export type { OperatorInvitation } from "./operator-invitation";
export type { PantryEssential } from "./pantry-essential";
export type { AnamnesisCategory, PatientAnamnesis } from "./patient-anamnesis";
export type {
  GoalDirection,
  PatientGoalCheckIn,
} from "./patient-goal-check-in";
export type { PatientGoal } from "./patient-goal";
export type { PatientInstruction } from "./patient-instruction";
export type { PatientNote } from "./patient-note";
export type {
  ConsentChannel,
  CookingAffinity,
  PatientProfile,
  PatientSex,
  PatientStatus,
} from "./patient-profile";
export type { PatientRecommendation } from "./patient-recommendation";
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
export type { Recipe } from "./recipe";
export type { AssignedRecipe, RecipeAssignment } from "./recipe-assignment";
export type { Recommendation, RecommendationCategory } from "./recommendation";
export type { Step, StepStatus } from "./step";
export type { FramePrinciple, TherapeuticFrame } from "./therapeutic-frame";
