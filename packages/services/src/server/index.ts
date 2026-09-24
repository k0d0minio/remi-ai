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
  setPatientNextConsultationPrep,
  updatePatient,
} from "../db/services/patients";
export type {
  PatientInput,
  PatientQuery,
  PatientSort,
} from "../db/services/patients";

export { writeThroughPatientLink } from "../db/services/patient-link-writes";
export type { PatientLinkWriteRequest } from "../db/services/patient-link-writes";

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
  challengeOwner,
  closeChallenge,
  getCurrentChallenge,
  listChallengeSignals,
  listPastChallenges,
  setChallengeAcquired,
  setChallengeReadyForNext,
  startChallenge,
  updateChallenge,
} from "../db/services/patient-challenges";
export type { ChallengeSignal } from "../db/services/patient-challenges";

export {
  countUnreadPatientMessages,
  listPatientMessages,
  listUnreadMessageCounts,
  markPatientMessageRead,
  replyToPatient,
  sendPatientMessage,
} from "../db/services/patient-messages";
export type { PatientMessageEntry } from "../db/services/patient-messages";

export {
  deletePatientInstruction,
  getPatientInstruction,
  listArchivedPatientInstructions,
  setPatientInstruction,
  type InstructionBodies,
} from "../db/services/patient-instructions";

export {
  getPatientSummary,
  setPatientSummary,
} from "../db/services/patient-summaries";

export {
  addPatientRecommendation,
  archivePatientRecommendation,
  deletePatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  movePatientRecommendation,
  savePatientRecommendations,
  updatePatientRecommendation,
} from "../db/services/patient-recommendations";
export type {
  RecommendationInput,
  RecommendationRow,
} from "../db/services/patient-recommendations";

export {
  addPatientSupplement,
  archivePatientSupplement,
  deletePatientSupplement,
  listArchivedPatientSupplements,
  listPatientSupplements,
  movePatientSupplement,
  savePatientSupplements,
  updatePatientSupplement,
} from "../db/services/patient-supplements";
export type {
  SupplementInput,
  SupplementRow,
} from "../db/services/patient-supplements";

export {
  addPantryEssential,
  archivePantryEssential,
  deletePantryEssential,
  listArchivedPantryEssentials,
  listPantryEssentials,
  movePantryEssential,
  savePantryEssentials,
  updatePantryEssential,
} from "../db/services/pantry-essentials";
export type {
  PantryEssentialInput,
  PantryEssentialRow,
} from "../db/services/pantry-essentials";

export type { SectionSaveCounts } from "../db/services/section-save";

export {
  deleteProtocolTemplate,
  getProtocolTemplate,
  listProtocolTemplates,
  renameProtocolTemplate,
  saveProtocolTemplate,
  setProtocolTemplateShared,
} from "../db/services/protocol-templates";
export type { SavedProtocolTemplate } from "../db/services/protocol-templates";

export {
  archiveRecipe,
  countRecipeAssignments,
  createRecipe,
  duplicateRecipe,
  getRecipe,
  listArchivedRecipes,
  listRecipeTags,
  listRecipes,
  updateRecipe,
} from "../db/services/recipes";
export type { RecipeInput } from "../db/services/recipes";

export {
  NUTRITION_RULE_RETRIEVAL_LIMIT,
  archiveNutritionRule,
  createNutritionRule,
  getNutritionRule,
  getNutritionRuleLineage,
  listNutritionRuleTags,
  listNutritionRules,
  retrieveNutritionRules,
  updateNutritionRule,
  validateNutritionRule,
} from "../db/services/nutrition-rules";
export type {
  NutritionRuleEdit,
  NutritionRuleInput,
  NutritionRuleLineage,
  NutritionRuleQuery,
  NutritionRuleRetrieval,
  NutritionRuleShelf,
} from "../db/services/nutrition-rules";
export type { NutritionRule } from "../db/models/nutrition-rule";

export {
  archiveRecipeAssignment,
  assignRecipes,
  createAndAssignRecipe,
  duplicateAndAssignRecipe,
  listArchivedPatientRecipes,
  listPatientRecipes,
  removeRecipeAssignment,
  updateRecipeAssignment,
} from "../db/services/recipe-assignments";
export type {
  AssignmentInput,
  GivenRecipe,
} from "../db/services/recipe-assignments";
export type {
  AssignedRecipe,
  RecipeAssignment,
} from "../db/models/recipe-assignment";
export type { Recipe } from "../db/models/recipe";

export {
  getCiqualImport,
  getFood,
  getFoodNutrients,
  listFoodGroups,
  rankFoodsByComponent,
  refreshFoodCatalogue,
  searchFoods,
} from "../db/services/foods";
export type { FoodSearch, RankQuery, RankedFood } from "../db/services/foods";
export type {
  CiqualImport,
  ConfidenceCode,
  Food,
  FoodNutrient,
  NutrientMarker,
} from "../db/models/food";

export {
  addMealEntry,
  archiveMealEntry,
  countMealEntriesAwaitingFeedback,
  deleteMealEntry,
  getMealEntry,
  listArchivedMealEntries,
  listMealEntries,
  markMealEntryEaten,
  mealEntryOwner,
  updateMealEntry,
} from "../db/services/meal-entries";
export type { MealEntryInput } from "../db/services/meal-entries";
export type { MealEntry, MealIntent, MealSlot } from "../db/models/meal-entry";

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
  describeConsultation,
  recordConsultation,
} from "../db/services/consultations";
export type {
  ConsultationCheckInInput,
  ConsultationInput,
  ConsultationRecord,
} from "../db/services/consultations";

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

export {
  DEFAULT_CONTEXT_PREAMBLE,
  contextBlocks,
  defaultContextBlocks,
  patientContextText,
} from "../ai";
export type {
  ContextBlock,
  ContextEssential,
  ContextGoal,
  ContextProfile,
  ContextRecommendationGroup,
  ContextSupplement,
  PatientContextInput,
  PatientContextOptions,
} from "../ai";

export { env, requireEnv } from "./env";
export type { ServerEnv } from "./env";
