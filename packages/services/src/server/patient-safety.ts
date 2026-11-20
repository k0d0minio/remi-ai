import type { PatientSafetyData } from "../ai/compatibility";
import type { Actor } from "../db/models/actor";
import { listPatientEvictions } from "../db/services/patient-food-directives";
import { getPatientQuestionnaire } from "../db/services/patient-questionnaire";
import { ok, type Result } from "../shared/result";
import type { Id } from "../types";

export type LoadedPatientSafety = {
  safety: PatientSafetyData;
  /** The patient's note on the diet « Autre ». */
  dietNote: string | null;
};

/**
 * The safety data of a patient, as the compatibility gate reads it (REM-57).
 * Each read checks the actor (D-26, D-27). A failed read is a failure: the
 * caller shows nothing, and never an item that was checked with no exclusion.
 *
 * The allergies, the intolerances, the coeliac flag and the diet are the
 * patient's own declaration and apply at once (D-30). The evictions are the
 * ones in force on the file.
 */
export const loadPatientSafety = async (
  actor: Actor,
  patientId: Id,
): Promise<Result<LoadedPatientSafety>> => {
  const questionnaire = await getPatientQuestionnaire(actor, patientId);
  if (!questionnaire.ok) {
    return questionnaire;
  }
  const evictions = await listPatientEvictions(actor, patientId);
  if (!evictions.ok) {
    return evictions;
  }
  const { answers, allergens } = questionnaire.data;
  return ok({
    safety: {
      allergens: allergens.map((row) => ({
        kind: row.kind,
        key: row.key,
        subKey: row.subKey,
        otherText: row.otherText,
      })),
      noKnownAllergies: answers.noKnownAllergies,
      noKnownIntolerances: answers.noKnownIntolerances,
      celiacDisease: answers.celiacDisease,
      diet: answers.diet,
      evictions: evictions.data,
    },
    dietNote: answers.dietNote,
  });
};
