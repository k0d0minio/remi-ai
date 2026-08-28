import type { Entity } from "../../types";
import type { Locale } from "../../shared/i18n";
import type { patientSexes, patientStatuses } from "../../shared/patient";

export type PatientStatus = (typeof patientStatuses)[number];
export type PatientSex = (typeof patientSexes)[number];

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
  constraints: string;
  preferences: string;
  medications: string;
  supplements: string;
  referral: string;
  anamnesis: string;
  /** When an operator last worked on the profile. Not `updatedAt`. */
  lastEditedAt: Date;
  /** The unguessable capability in the shareable patient link. */
  shareToken: string;
  linkLastOpenedAt: Date | null;
};
