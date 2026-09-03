/**
 * @remi/services/server — the Node-only surface.
 *
 * This is the entrypoint apps import for anything that touches storage, secrets,
 * or an outbound provider. It is a barrel over /db, /email and /ai plus the
 * environment reader — importing it from a client component is a build error,
 * which is the point: the import path itself states where the code runs.
 *
 * ESLint blocks apps from importing the root "@remi/services" barrel so this
 * choice is always explicit at the call site.
 */

export {
  getDatabase,
  isDatabaseRegistered,
  registerDatabase,
} from "../db/client";
export type { Collection, DatabaseClient } from "../db/client";

export { createNeonDatabase } from "../db/adapters/neon";

export {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  listPatients,
  recordPatientLinkOpened,
  regenerateShareToken,
  updatePatient,
} from "../db/services/patients";
export type {
  PatientInput,
  PatientQuery,
  PatientSort,
} from "../db/services/patients";

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
} from "../db/services/patient-goals";
export type {
  GoalCheckInInput,
  PatientGoalInput,
} from "../db/services/patient-goals";

export {
  deletePatientInstruction,
  getPatientInstruction,
  listArchivedPatientInstructions,
  setPatientInstruction,
} from "../db/services/patient-instructions";

export {
  addPatientRecommendation,
  archivePatientRecommendation,
  deletePatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  movePatientRecommendation,
  updatePatientRecommendation,
} from "../db/services/patient-recommendations";
export type { RecommendationInput } from "../db/services/patient-recommendations";

export {
  addPatientSupplement,
  archivePatientSupplement,
  deletePatientSupplement,
  listArchivedPatientSupplements,
  listPatientSupplements,
  movePatientSupplement,
  updatePatientSupplement,
} from "../db/services/patient-supplements";
export type { SupplementInput } from "../db/services/patient-supplements";

export {
  addPantryEssential,
  archivePantryEssential,
  deletePantryEssential,
  listArchivedPantryEssentials,
  listPantryEssentials,
  movePantryEssential,
  updatePantryEssential,
} from "../db/services/pantry-essentials";
export type { PantryEssentialInput } from "../db/services/pantry-essentials";

export {
  archiveRecipe,
  countRecipeAssignments,
  createRecipe,
  getRecipe,
  listArchivedRecipes,
  listRecipeTags,
  listRecipes,
  updateRecipe,
} from "../db/services/recipes";
export type { RecipeInput } from "../db/services/recipes";

export {
  archiveRecipeAssignment,
  assignRecipe,
  listArchivedPatientRecipes,
  listPatientRecipes,
  removeRecipeAssignment,
  updateRecipeAssignment,
} from "../db/services/recipe-assignments";
export type { AssignmentInput } from "../db/services/recipe-assignments";
export type {
  AssignedRecipe,
  RecipeAssignment,
} from "../db/models/recipe-assignment";
export type { Recipe } from "../db/models/recipe";

export {
  addMealEntry,
  archiveMealEntry,
  countMealEntriesAwaitingFeedback,
  deleteMealEntry,
  getMealEntry,
  listArchivedMealEntries,
  listMealEntries,
  updateMealEntry,
} from "../db/services/meal-entries";
export type { MealEntryInput } from "../db/services/meal-entries";
export type { MealEntry, MealSlot } from "../db/models/meal-entry";

export {
  addPatientObservation,
  archivePatientObservation,
  deletePatientObservation,
  listArchivedPatientObservations,
  listPatientLearnings,
  listPatientObservations,
  updatePatientObservation,
} from "../db/services/patient-observations";
export type { PatientObservationInput } from "../db/services/patient-observations";
export type {
  PatientLearning,
  PatientObservation,
} from "../db/models/patient-observation";

export {
  addPatientNote,
  deletePatientNote,
  listPatientNotes,
  updatePatientNote,
} from "../db/services/patient-notes";
export type { NoteInput } from "../db/services/patient-notes";

export {
  listPatientAnamnesis,
  setPatientAnamnesis,
} from "../db/services/patient-anamnesis";

export {
  changeOperatorPassword,
  createOperator,
  deleteOperator,
  findOperatorByEmail,
  getOperator,
  hasOperator,
  listOperators,
  setOperatorRole,
  updateOperatorName,
  verifyOperator,
} from "../db/services/operators";
export type { OperatorInput } from "../db/services/operators";
export type { Operator, OperatorRole } from "../db/models/operator";

export {
  acceptInvitation,
  createInvitation,
  getInvitationByToken,
  listInvitations,
  listPendingInvitations,
  revokeInvitation,
} from "../db/services/operator-invitations";
export type {
  AcceptInput,
  InvitationInput,
  IssuedInvitation,
} from "../db/services/operator-invitations";
export type { OperatorInvitation } from "../db/models/operator-invitation";

export { listAuditEvents, recordAuditEvent } from "../db/services/audit";
export type { AuditActor, AuditQuery, AuditRecord } from "../db/services/audit";
export type { AuditAction, AuditEvent } from "../db/models/audit-event";

export { hashPassword, verifyPassword } from "../auth/password";
export {
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "../auth/session-token";

export {
  consoleMailer,
  createResendMailer,
  getMailer,
  isMailerRegistered,
  operatorInvitationEmail,
  patientLinkEmail,
  registerMailer,
  sendEmail,
} from "../email";
export type { EmailMessage, Mailer, SendResult } from "../email";

export {
  DEFAULTS as AI_DEFAULTS,
  MODELS,
  getTextProvider,
  registerTextProvider,
  resolveModel,
} from "../ai";
export type { GenerateOptions, ModelRole, TextProvider } from "../ai";

export { env, requireEnv } from "./env";
export type { ServerEnv } from "./env";
