import { missingMandatoryFields } from "../../../shared/questionnaire";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Actor } from "../../models/actor";
import type { PatientProfile } from "../../models/patient-profile";
import type {
  AllergenKind,
  PatientAllergen,
  PatientQuestionnaire,
} from "../../models/patient-questionnaire";
import { listablePatientIds } from "../access";

type CompletenessRow = PatientProfile & PatientQuestionnaire;

/**
 * Each file's count of missing mandatory fields in one pass, for the patient
 * list's « Informations manquantes » (story 5). Two paged reads, never one
 * read for each row. The rule is `missingMandatoryFields`, the same one as
 * `missingQuestionnaireFields` of the file. A complete file is absent. The
 * actor's own files only (story 3).
 */
export const countMissingMandatoryFields = async (
  actor: Actor,
): Promise<ReadonlyMap<Id, number>> => {
  const listable = await listablePatientIds(actor);
  const db = getDatabase();

  const declared = new Map<Id, Record<AllergenKind, number>>();
  const allergens = db.collection<PatientAllergen>("patient_allergens");
  let cursor: string | undefined;
  do {
    const page = await allergens.findMany({}, { limit: 500, cursor });
    for (const row of page.items) {
      const counts = declared.get(row.patientId) ?? {
        allergy: 0,
        intolerance: 0,
      };
      counts[row.kind] += 1;
      declared.set(row.patientId, counts);
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  const missing = new Map<Id, number>();
  const files = db.collection<CompletenessRow>("patient_profiles");
  cursor = undefined;
  do {
    const page = await files.findMany({}, { limit: 500, cursor });
    for (const row of page.items) {
      if (listable && !listable.has(row.id)) {
        continue;
      }
      const count = missingMandatoryFields({
        sexForCalculation: row.sexForCalculation ?? null,
        heightCm: row.heightCm ?? null,
        weightKg: row.weightKg ?? null,
        activityLevel: row.activityLevel ?? null,
        consultationReason: row.consultationReason ?? null,
        noKnownAllergies: row.noKnownAllergies ?? null,
        noKnownIntolerances: row.noKnownIntolerances ?? null,
        allergyCount: declared.get(row.id)?.allergy ?? 0,
        intoleranceCount: declared.get(row.id)?.intolerance ?? 0,
      }).length;
      if (count > 0) {
        missing.set(row.id, count);
      }
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return missing;
};
