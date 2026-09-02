import type { anamnesisCategories } from "../../shared/patient";
import type { Entity, Id } from "../../types";

export type AnamnesisCategory = (typeof anamnesisCategories)[number];

/**
 * One category of a patient's anamnesis — § B of the v2 brainstorm, one row per
 * area of enquiry rather than one paragraph covering all twelve.
 *
 * A category with nothing recorded has no row at all: emptiness is the absence
 * of a row, not a stored empty string, so a patient Morgane has barely started
 * costs two rows rather than twelve. Never reaches the patient link — this is
 * her working record, under the same rule as the consultation notes.
 */
export type PatientAnamnesis = Entity & {
  patientId: Id;
  category: AnamnesisCategory;
  body: string;
};
