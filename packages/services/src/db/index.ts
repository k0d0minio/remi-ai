/**
 * @remi/services/db — storage.
 *
 * Server-only. Apps do not import this directly; they import `/server`, which
 * re-exports the service layer. This entrypoint exists so the seam is testable
 * and so an adapter package can depend on the interfaces without the rest.
 *
 * Layout as this grows:
 *   db/client.ts     the seam (below)
 *   db/models/       one file per entity — shape + validation
 *   db/services/     one folder per entity — the callable surface
 *   db/migrations/   forward + backward, one file per change
 */

export { getDatabase, isDatabaseRegistered, registerDatabase } from "./client";
export type { Collection, DatabaseClient } from "./client";

/**
 * The one adapter — Neon over Drizzle. This line and the registration call in
 * each app's `instrumentation.ts` are the only places the vendor is named.
 */
export { createNeonDatabase } from "./adapters/neon";

export {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  listPatients,
  regenerateShareToken,
  updatePatient,
} from "./services/patients";
export type { PatientInput } from "./services/patients";

export {
  listPatientAnamnesis,
  setPatientAnamnesis,
} from "./services/patient-anamnesis";

export {
  addGoalCheckIn,
  addPatientGoal,
  archivePatientGoal,
  deleteGoalCheckIn,
  deletePatientGoal,
  listArchivedPatientGoals,
  listGoalCheckIns,
  listPatientGoals,
  movePatientGoal,
  updateGoalCheckIn,
  updatePatientGoal,
  MAX_ACTIVE_GOALS,
} from "./services/patient-goals";
export type {
  GoalCheckInInput,
  PatientGoalInput,
} from "./services/patient-goals";

export {
  deletePatientInstruction,
  getPatientInstruction,
  listArchivedPatientInstructions,
  setPatientInstruction,
} from "./services/patient-instructions";

export {
  addPatientRecommendation,
  deletePatientRecommendation,
  listPatientRecommendations,
  updatePatientRecommendation,
} from "./services/patient-recommendations";
export type { RecommendationInput } from "./services/patient-recommendations";

export {
  addPatientSupplement,
  deletePatientSupplement,
  listPatientSupplements,
  updatePatientSupplement,
} from "./services/patient-supplements";
export type { SupplementInput } from "./services/patient-supplements";

export {
  createOperator,
  findOperatorByEmail,
  getOperator,
  hasOperator,
  verifyOperator,
} from "./services/operators";
export type { OperatorInput } from "./services/operators";
