import type { Entity } from "../../types";
import type { Locale } from "../../shared/i18n";
import type {
  consentChannels,
  cookingAffinities,
  cookingTimes,
  foodBudgets,
  patientSexes,
  patientStatuses,
} from "../../shared/patient";

export type PatientStatus = (typeof patientStatuses)[number];
export type PatientSex = (typeof patientSexes)[number];
export type ConsentChannel = (typeof consentChannels)[number];
export type CookingAffinity = (typeof cookingAffinities)[number];
export type CookingTime = (typeof cookingTimes)[number];
export type FoodBudget = (typeof foodBudgets)[number];

/**
 * The profile Morgane creates and maintains for each of her patients — the
 * phase-1 unit the new direction is built around (patient experience first,
 * practitioner space parked). Distinct from `Person`, which belongs to the
 * parked practitioner-led model and keeps its `practitionerId`.
 *
 * Identity is split so the open AI-visibility question stays cheap either way:
 * `pseudonym` is the working name and the only one an AI provider may ever be
 * shown; `fullName` is the real identity, optional, and stays on the operator
 * and patient surfaces.
 */
export type PatientProfile = Entity & {
  pseudonym: string;
  fullName: string | null;
  email: string | null;
  locale: Locale;
  status: PatientStatus;
  /** `YYYY-MM-DD`. A birthday has no timezone, so it is not an instant. */
  birthDate: string | null;
  sex: PatientSex;
  heightCm: number | null;
  weightKg: number | null;
  objective: string;
  /** végétarien, sans gluten — a permanent filter, free text by design. */
  dietaryRegime: string;
  /** Mandatory exclusions. Never merged with the two below. */
  allergies: string;
  intolerances: string;
  /** The medical constraints that are neither allergy nor intolerance. */
  constraints: string;
  preferences: string;
  /** `null` until Morgane has asked — not the same answer as `"no"`. */
  likesCooking: CookingAffinity | null;
  /** How much time there is to cook. `null` until asked. */
  cookingTime: CookingTime | null;
  /** `null` until asked — and for every row the free-text migration blanked. */
  foodBudget: FoodBudget | null;
  medications: string;
  supplements: string;
  referral: string;
  anamnesis: string;
  /**
   * What to remember to cover at the next consultation. Set from the working
   * view; `null` = not set, the empty string is never stored.
   */
  nextConsultationPrep: string | null;
  /** When an operator last worked on the profile. Not `updatedAt`. */
  lastEditedAt: Date;
  /**
   * When the patient last changed the seven fields they own — regime,
   * allergies, intolerances, preferences, likes-cooking, cooking time and
   * budget. `null` while only Morgane has ever written them.
   *
   * One timestamp for the whole set rather than one per field: the console
   * shows a single « Profil modifié par la patiente le … » line, and which
   * field moved is a question the audit trail already answers. Seven columns
   * to render one line would be seven columns to keep in step.
   */
  preferencesUpdatedByPatientAt: Date | null;
  /**
   * When and how the patient agreed to REMI holding their record and to the
   * share link existing. Recorded fact, never a gate: both are null until
   * Morgane records them, and nothing here refuses to render without them.
   *
   * `YYYY-MM-DD` for the same reason as `birthDate` — the day someone agreed
   * has no timezone, and storing an instant makes it drift across a border.
   */
  consentDate: string | null;
  consentChannel: ConsentChannel | null;
  /** The unguessable capability in the shareable patient link. */
  shareToken: string;
  linkLastOpenedAt: Date | null;
  /**
   * When the patient last wrote through the link. Null means they have read it
   * or never opened it — "they looked" and "they answered" are different facts,
   * and only the second one is waiting for Morgane.
   */
  linkLastWroteAt: Date | null;
};
