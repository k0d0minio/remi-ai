import type { Entity } from "../../types";
import type { Locale } from "../../shared/i18n";
import type { patientStatuses } from "../../shared/patient";

export type PatientStatus = (typeof patientStatuses)[number];

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
  objective: string;
  constraints: string;
  preferences: string;
  anamnesis: string;
  /** The unguessable capability in the shareable patient link. */
  shareToken: string;
};
