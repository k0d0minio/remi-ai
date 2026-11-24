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
  addDays,
  formatDate,
  formatDateTime,
  formatNumber,
  initials,
  todayAtPractice,
} from "./format";
export {
  defaultLocale,
  defaultLocalePath,
  isLocale,
  localePath,
  locales,
} from "./i18n";
export type { Locale } from "./i18n";
export { userMessage } from "./user-message";
export type { ServiceFailure } from "./user-message";
export { auditActions } from "./audit";
export { dishRoleLabels, dishRoles } from "./food-record";
export type { FoodRecordStatus } from "./food-record";
export { FOOD_UNITS_MAX, kitchenQuantityText } from "./kitchen-units";
export type { FoodUnit } from "./kitchen-units";
export { mealIntentLabels } from "./meal-intent";
export {
  checkPlannedMealText,
  PLANNED_MEAL_MAX_LENGTH,
  PLANNED_MEALS_PER_DAY,
} from "./planned-meal";
export type { PlannedMealTextError } from "./planned-meal";
export {
  clearConsultationDrafts,
  consultationDraftKey,
} from "./consultation-draft";
export type {
  MealAlert,
  MealAnswer,
  MealImprovement,
  MealImprovementKind,
  MealSuggestion,
} from "./meal-suggestion";
export { isWatchedPatientField, watchedPatientFields } from "./patient-changes";
export {
  comparePatientChangesForReview,
  isSafetyPatientField,
  patientChangeValueLabel,
  watchedPatientFieldLabels,
} from "./patient-change-labels";
export {
  PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  isEmptyProtocolSnapshot,
  protocolSnapshotSchema,
} from "./protocol-snapshot";
export type { ProtocolSnapshot } from "./protocol-snapshot";
export {
  hasFoodRecommendations,
  validatedRecommendationsView,
} from "./validated-recommendations";
export type {
  LifestyleAdviceCategory,
  ValidatedAdvice,
  ValidatedEviction,
  ValidatedFoodLimit,
  ValidatedRecommendationsView,
  ValidatedSupplement,
} from "./validated-recommendations";
export {
  evictionsOfDirectives,
  foodDirectiveFaults,
  foodDirectiveKinds,
  foodDirectiveTermKey,
  foodLimitLevels,
  joinFoodDirectiveTerms,
  splitFoodDirectiveTerms,
} from "./food-directives";
export {
  LIFESTYLE_ADVICE_DETAILS_MAX,
  LIFESTYLE_ADVICE_TEXT_MAX,
  isLifestyleAdviceKey,
  lifestyleAdviceFaults,
  lifestyleAdviceKeys,
  lifestyleKeyOf,
} from "./lifestyle-advice";
export type {
  LifestyleAdvice,
  LifestyleAdviceDraft,
  LifestyleAdviceEdit,
  LifestyleAdviceFault,
  LifestyleAdviceFaultCode,
  LifestyleAdviceKey,
} from "./lifestyle-advice";
export type {
  FoodDirectiveDraft,
  FoodDirectiveFault,
  FoodDirectiveFaultCode,
  FoodDirectiveKind,
  FoodLimitLevel,
} from "./food-directives";
export {
  activeMealSlots,
  defaultMealConfiguration,
  emptyMealConfiguration,
  mealFastingOptions,
  mealOrientations,
  mealRemovedByFasting,
  mealSlotState,
  // The meal journal already exports `mealSlots` and `MealSlot` (`patient.ts`).
  mealSlots as mealConfigurationSlots,
} from "./meal-configuration";
export type {
  MealConfiguration,
  MealConfigurationChange,
  MealFasting,
  MealOrientation,
  MealSlot as MealConfigurationSlot,
  MealSlotState,
} from "./meal-configuration";
export {
  defaultMealShareTable,
  MEAL_SHARE_MAX,
  MEAL_SHARE_MIN,
  mealShareNutrients,
  mealTargets,
  parseMealShareTable,
  referenceDayOrientations,
  referenceDayTotal,
} from "./meal-shares";
export type {
  DayTargets,
  MealShareNutrient,
  MealShareTable,
  MealTarget,
  MealTargets,
  MealTargetStatus,
} from "./meal-shares";
export { canActivate } from "./care-activation";
export {
  activationEmailDecision,
  activationEmailFailures,
  activationEmailState,
  patientSignInPath,
} from "./activation-email";
export type {
  ActivationEmailDecision,
  ActivationEmailEvent,
  ActivationEmailFailure,
  ActivationEmailState,
  ActivationEmailTrigger,
} from "./activation-email";
export type { ActivationBlocker, ActivationRecap } from "./care-activation";
export type {
  PatientChangeValue,
  WatchedPatientField,
} from "./patient-changes";
export {
  bmiClass,
  bmiIndicator,
  bmiInputRanges,
  bmiNeedsReview,
  calculationInputLabels,
  calculationKindLabels,
  calculationKinds,
  missingCalculationInputs,
  specialSituationLabels,
  specialSituations,
} from "./calculations";
export type {
  BmiIndicator,
  CalculationInput,
  CalculationKind,
  SpecialSituation,
} from "./calculations";
export {
  energyEstimateParameters,
  energyGoalLabels,
  energyGoals,
  energyTarget,
  energyTargetBounds,
  energyTargetDefaults,
  energyTargetEntries,
  energyTargetParameters,
  restingMetabolismSexConstants,
} from "./energy";
export type {
  EnergyGoal,
  EnergyTargetDefaults,
  EnergyTargetEntry,
} from "./energy";
export {
  defaultProteinCoefficient,
  proteinAdaptationLabels,
  proteinEstimateParameters,
  proteinTarget,
  proteinTargetBounds,
  proteinTargetDefaults,
} from "./protein";
export type { ProteinTargetDefaults, ProteinTargetField } from "./protein";
export {
  defaultMacroSplit,
  genotypeMappingValidated,
  macroProfile,
  macroProfileReasons,
} from "./macro-profile";
export type {
  MacroProfile,
  MacroProfileInput,
  MacroProfileReason,
} from "./macro-profile";
export { fileClaimPurposes, fileTakeoverPath } from "./file-claim";
export type { FileClaimPurpose } from "./file-claim";
export { minPasswordLength, signupFields } from "./signup";
export type {
  PatientLanding,
  SignupField,
  SignupFieldError,
  SignupFieldErrors,
} from "./signup";
export type { AuditActionName } from "./audit";
export {
  careConsentGiven,
  consentDecisions,
  consentKeys,
  consentRecordChannels,
  consentSummaries,
  consentTextLocaleFor,
  consentTextLocales,
  legacyConsentVersion,
  mandatoryConsentKeys,
  parseShownConsent,
  shownConsentValue,
} from "./consent";
export type {
  ConsentDecision,
  ConsentKey,
  ConsentRecordChannel,
  ConsentState,
  ConsentSummary,
  ConsentTextLocale,
  LatestConsent,
  ShownConsent,
} from "./consent";
export {
  isLeadType,
  isOfferInterest,
  leadTypes,
  offerInterests,
} from "./leads";
export type { LeadType, OfferInterest } from "./leads";
export { appHref, appOrigin } from "./links";
export {
  documentFileTypes,
  documentTags,
  isPatientFileKey,
  MAX_DOCUMENT_FILE_BYTES,
} from "./files";
export type { AiModelRole, ModelCheck, ModelTestOutcome } from "./ai-models";
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
export {
  appearsInPatientList,
  canMoveFileStatus,
  fileOrigins,
  fileStatuses,
  fileStatusLabels,
  fileStatusTransitions,
  initialFileStatus,
  isFileStatus,
} from "./file-status";
export type { FileOrigin, FileStatus } from "./file-status";
export { shownAfterSave, singleFlight } from "./inline-save";
export type { ConfirmedSave, SingleFlight } from "./inline-save";
export { patientFileLayout } from "./patient-file-layout";
export type {
  PatientFileAction,
  PatientFileGroup,
  PatientFileLayout,
  PatientFileSectionId,
} from "./patient-file-layout";
export {
  canManageOperators,
  defaultPatientListSort,
  isAtLeast,
  isPatientListSort,
  operatorRoles,
  patientListSorts,
  QUESTIONNAIRE_QUESTION_MAX,
} from "./operator";
export type { OperatorRoleName, PatientListSort } from "./operator";
export {
  anamnesisCategories,
  challengeOutcomes,
  consentChannels,
  cookingAffinities,
  cookingTimes,
  firstRecommendationPerCategory,
  foodBudgets,
  goalDirections,
  goalScores,
  mealIntents,
  mealSlots,
  patientEditableProfileFields,
  patientLinkPreviewParam,
  patientSexes,
  patientStatuses,
  recommendationCategories,
} from "./patient";
export type { WeeklyCheckInState } from "./patient";
export {
  activityLevelDetails,
  activityLevels,
  ALL_SUB_KEY,
  allergenKinds,
  allergenLabels,
  allergens,
  allergenSubLabels,
  allergenSubLists,
  allSubKeyLabel,
  amy1aCategories,
  apoeGenotypes,
  dietLabels,
  diets,
  dio2Categories,
  geneticTestAnswerLabels,
  geneticTestAnswers,
  intoleranceDescriptions,
  intoleranceLabels,
  intolerances,
  mandatoryQuestionnaireFieldLabels,
  mandatoryQuestionnaireFields,
  missingBySection,
  missingMandatoryFields,
  heightCmRange,
  missingOptionalFields,
  noneKnownLabels,
  optionalQuestionnaireFieldLabels,
  questionnaireSections,
  sectionOfMandatoryField,
  sexesForCalculation,
  sexForCalculationLabels,
  weightKgRange,
} from "./questionnaire";
export type {
  MandatoryQuestionnaireField,
  OptionalQuestionnaireAnswers,
  OptionalQuestionnaireField,
  QuestionnaireCompleteness,
  QuestionnaireLabel,
  QuestionnaireSection,
} from "./questionnaire";
export { safetyList, strictGlutenLabel } from "./safety-highlights";
export {
  allergenOptionOfRow,
  allergenOptions,
  allergenRowLabel,
  uncategorisedAllergenRows,
} from "./allergen-options";
export type { AllergenOption } from "./allergen-options";
export {
  celiacToConfirm,
  mentionsCeliacDisease,
  strictGlutenApplies,
} from "./celiac-mention";
export {
  dateEntryFromIso,
  isCalendarDay,
  maskDateEntry,
  maskNumberEntry,
  parseDateEntry,
} from "./typed-entry";
export type { SafetyBox, SafetyList } from "./safety-highlights";
export {
  componentsForRecommendation,
  normaliseNutritionText,
  nutrientComponentByKey,
  nutrientComponents,
} from "./nutrition";
export type { NutrientComponent, NutrientDirection } from "./nutrition";
export { variantTitle, VARIANT_SUFFIX } from "./recipe";
export {
  carryRecipeData,
  formatIngredientLine,
  formatRecipeMinutes,
  formatRecipeQuantity,
  linkIngredientFoods,
  parseIngredientLinks,
  parseIngredientLines,
  parseStepLines,
  recipeEquipment,
  recipeEquipmentLabels,
  recipeGateItem,
  recipeLevelLabels,
  recipeLevels,
  recipeSeasonLabels,
  recipeSeasons,
  recipeTotalMinutes,
  recipeUnitLabels,
  structuredRecipeOf,
  structuredRecipeSchema,
  structuredRecipeText,
} from "./structured-recipe";
export type {
  RecipeEquipment,
  RecipeIngredient,
  RecipeSeason,
  RecipeStep,
  RecipeUnit,
  StructuredRecipe,
} from "./structured-recipe";
export { recipeStepDetails, recipeSummaryOf } from "./recipe-card";
export type {
  PatientRecipeCard,
  PatientRecipeSource,
  PatientRecipeSummary,
} from "./recipe-card";
export {
  formatRecipeNutrient,
  recipeNutrientKeys,
  recipeNutrientSources,
} from "./recipe-nutrients";
export type { RecipeNutrientKey, RecipeNutrients } from "./recipe-nutrients";
export {
  defaultIngredientEntry,
  ingredientLinkOf,
  ingredientUnitOptions,
} from "./recipe-quantities";
export type { IngredientEntry, IngredientFood } from "./recipe-quantities";
export { err, ok, unwrap } from "./result";
export type { Result, ServiceErrorCode } from "./result";
export type { Actor, Entity, Id, Page, PageQuery, Timestamped } from "../types";

/**
 * The domain vocabulary. Types only, so re-exporting it from `/db` — which is
 * otherwise server-only — costs the browser bundle nothing.
 */
export type {
  ActivityLevel,
  AllergenKey,
  AllergenKind,
  Amy1aCategory,
  AnamnesisCategory,
  ApoeGenotype,
  AssignedRecipe,
  AuditAction,
  AuditEvent,
  ChallengeOutcome,
  CiqualImport,
  ConfidenceCode,
  ConsentChannel,
  Consultation,
  CookingAffinity,
  CookingTime,
  Diet,
  Dio2Category,
  DocumentKind,
  DocumentTag,
  Food,
  FoodNutrient,
  FoodBudget,
  FramePrinciple,
  GeneticTestAnswer,
  GenotypeMarker,
  GoalDirection,
  HabitsProfile,
  IntoleranceKey,
  Lead,
  MealEntry,
  MealIntent,
  MealSlot,
  NutrientMarker,
  NutritionRule,
  OperatorRole,
  PantryEssential,
  PatientAllergen,
  PatientAnamnesis,
  PatientChallenge,
  PatientDocument,
  PatientEditableProfileField,
  PatientGoal,
  PatientGoalCheckIn,
  PatientInstruction,
  PatientLearning,
  PatientMessage,
  PatientMessageEntry,
  PatientNote,
  PatientObservation,
  PatientProfile,
  PatientQuestionnaire,
  PatientRecommendation,
  PatientSupplement,
  PatientFoodDirective,
  PatientSex,
  PatientStatus,
  PatientSummary,
  PatientCalculation,
  ComputedEstimates,
  PatientChange,
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
  ProtocolVersion,
  PsychologyProfile,
  GeneratedRecipe,
  Recipe,
  RecipeAssignment,
  Recommendation,
  RecommendationCategory,
  RhythmProfile,
  SexForCalculation,
  SignalKind,
  SignalSeverity,
  Step,
  StepStatus,
  TherapeuticFrame,
  ValidatedProtocol,
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
