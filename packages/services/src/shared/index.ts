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
  formatWeekday,
  initials,
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
export type { AppKey } from "./links";
export { canManageOperators, isAtLeast, operatorRoles } from "./operator";
export type { OperatorRoleName } from "./operator";
export {
  patientSexes,
  patientStatuses,
  recommendationCategories,
} from "./patient";
export { err, ok, unwrap } from "./result";
export type { Result, ServiceErrorCode } from "./result";
export type { Actor, Entity, Id, Page, PageQuery, Timestamped } from "../types";

/**
 * The domain vocabulary. Types only, so re-exporting it from `/db` — which is
 * otherwise server-only — costs the browser bundle nothing.
 */
export type {
  AuditAction,
  AuditEvent,
  Consultation,
  FramePrinciple,
  GenotypeMarker,
  HabitsProfile,
  Ingredient,
  Meal,
  MealSlot,
  MealStatus,
  OperatorRole,
  PatientNote,
  PatientProfile,
  PatientRecommendation,
  PatientSex,
  PatientStatus,
  PersonalisationDimension,
  PersonalisationProfile,
  Person,
  PersonStatus,
  Plan,
  PlanStatus,
  Practitioner,
  ProgressSignal,
  PsychologyProfile,
  Recipe,
  Recommendation,
  RecommendationCategory,
  RhythmProfile,
  SignalKind,
  SignalSeverity,
  Step,
  StepStatus,
  TherapeuticFrame,
} from "../db/models";
