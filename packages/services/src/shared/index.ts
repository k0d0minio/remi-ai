/**
 * @remi/services/shared — the isomorphic surface.
 *
 * Everything here runs unchanged in a browser bundle and on the server: types,
 * formatters, validation schemas, pure helpers. No filesystem, no database
 * driver, no secret read. If a module cannot honestly claim that, it belongs
 * under /server instead.
 */

export {
  ageInYears,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  initials,
  todayAtPractice,
} from "./format";
export {
  defaultLocale,
  isLocale,
  localePath,
  locales,
  pickLocaleFromHeader,
} from "./i18n";
export type { Locale } from "./i18n";
export { auditActions } from "./audit";
export type { AuditActionName } from "./audit";
export { appHref, appOrigin } from "./links";
export { nutritionRuleKinds, nutritionRuleStatuses } from "./nutrition-rules";
export type { NutritionRuleKind, NutritionRuleStatus } from "./nutrition-rules";
export {
  blankPersonalFields,
  blankPersonalFieldsOf,
  isPersonalField,
  isProtocolCopyKind,
  isProtocolTemplateKind,
  protocolCopyKinds,
  protocolKindFields,
  protocolTemplateKinds,
  readProtocolRow,
  readProtocolRows,
} from "./protocol-reuse";
export type {
  ProtocolCopyKindName,
  ProtocolField,
  ProtocolRow,
  ProtocolTemplateKindName,
} from "./protocol-reuse";
export type { AppKey } from "./links";
export { canManageOperators, isAtLeast, operatorRoles } from "./operator";
export type { OperatorRoleName } from "./operator";
export {
  anamnesisCategories,
  consentChannels,
  cookingAffinities,
  firstRecommendationPerCategory,
  goalDirections,
  mealIntents,
  mealSlots,
  patientSexes,
  patientStatuses,
  recommendationCategories,
} from "./patient";
export {
  componentsForRecommendation,
  normaliseNutritionText,
  nutrientComponentByKey,
  nutrientComponents,
} from "./nutrition";
export type { NutrientComponent, NutrientDirection } from "./nutrition";
export { variantTitle, VARIANT_SUFFIX } from "./recipe";
export { err, ok, unwrap } from "./result";
export type { Result, ServiceErrorCode } from "./result";
export type { Actor, Entity, Id, Page, PageQuery, Timestamped } from "../types";

/**
 * The domain vocabulary. Types only, so re-exporting it from `/db` — which is
 * otherwise server-only — costs the browser bundle nothing.
 */
export type {
  AnamnesisCategory,
  AssignedRecipe,
  AuditAction,
  AuditEvent,
  CiqualImport,
  ConfidenceCode,
  ConsentChannel,
  Consultation,
  CookingAffinity,
  Food,
  FoodNutrient,
  FramePrinciple,
  GenotypeMarker,
  GoalDirection,
  HabitsProfile,
  MealEntry,
  MealIntent,
  MealSlot,
  NutrientMarker,
  NutritionRule,
  OperatorRole,
  PantryEssential,
  PatientAnamnesis,
  PatientGoal,
  PatientGoalCheckIn,
  PatientInstruction,
  PatientLearning,
  PatientNote,
  PatientObservation,
  PatientProfile,
  PatientRecommendation,
  PatientSupplement,
  PatientSex,
  PatientStatus,
  PatientSummary,
  PersonalisationDimension,
  PersonalisationProfile,
  Person,
  PersonStatus,
  Plan,
  PlanStatus,
  Practitioner,
  ProgressSignal,
  ProtocolTemplate,
  ProtocolTemplateKind,
  ProtocolTemplateView,
  PsychologyProfile,
  Recipe,
  RecipeAssignment,
  Recommendation,
  RecommendationCategory,
  RhythmProfile,
  SignalKind,
  SignalSeverity,
  Step,
  StepStatus,
  TherapeuticFrame,
} from "../db/models";

/**
 * The patient context block, from `../ai/context`.
 *
 * It lives under `ai/` because it is the block every prompt there opens with,
 * and it is re-exported here because it is genuinely isomorphic: the function
 * imports nothing, so the console can re-assemble the text in the browser as
 * the operator edits the preamble and toggles blocks. Reaching it through
 * `/ai` from a client component would instead pull the provider seam — and,
 * once an adapter exists, a vendor — into the browser bundle.
 */
export {
  DEFAULT_CONTEXT_PREAMBLE,
  contextBlocks,
  defaultContextBlocks,
  patientContextText,
} from "../ai/context";
export type {
  ContextBlock,
  ContextEssential,
  ContextGoal,
  ContextProfile,
  ContextRecommendationGroup,
  ContextSupplement,
  PatientContextInput,
  PatientContextOptions,
} from "../ai/context";
