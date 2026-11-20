import { z } from "zod";
import {
  applyMealConfigurationChange,
  emptyMealConfiguration,
  isMealConfigurationEmpty,
  mealConfigurationChanges,
  parseMealConfigurationChange,
  type MealConfiguration,
  type MealConfigurationChange,
} from "../../../shared/meal-configuration";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientMealConfiguration } from "../../models/patient-meal-configuration";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, noSuchPatient } from "../access";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { moveToValidateAfterSave } from "../first-recommendation";
import { touchPatient } from "../patients";

/**
 * The meal configuration of a patient file — REM-68 and REM-70, stories 11
 * and 12.
 *
 * The practitioner changes one value at a time: the switch of a meal, the
 * orientation of a meal, or the fasting option. Each change is saved at once
 * and writes one audit event (D-32). The file has one row, made by the first
 * change. A file with no row has no configuration: REMI enters no value.
 *
 * This is the practitioner's working copy. A reader of validated content uses
 * `getValidatedProtocol` and `snapshot.mealConfiguration`.
 */

const configurations = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientMealConfiguration>("patient_meal_configurations");

const uuidSchema = z.uuid();

type Columns = Omit<
  PatientMealConfiguration,
  "id" | "createdAt" | "updatedAt" | "patientId"
>;

/** The row as the shape that every reader uses. */
export const mealConfigurationOf = (row: Columns): MealConfiguration => ({
  meals: {
    breakfast: {
      enabled: row.breakfastEnabled,
      orientation: row.breakfastOrientation,
    },
    lunch: { enabled: row.lunchEnabled, orientation: row.lunchOrientation },
    snack: { enabled: row.snackEnabled, orientation: row.snackOrientation },
    dinner: { enabled: row.dinnerEnabled, orientation: row.dinnerOrientation },
  },
  fasting: row.fasting,
});

const columnsOf = ({ meals, fasting }: MealConfiguration): Columns => ({
  breakfastEnabled: meals.breakfast.enabled,
  breakfastOrientation: meals.breakfast.orientation,
  lunchEnabled: meals.lunch.enabled,
  lunchOrientation: meals.lunch.orientation,
  snackEnabled: meals.snack.enabled,
  snackOrientation: meals.snack.orientation,
  dinnerEnabled: meals.dinner.enabled,
  dinnerOrientation: meals.dinner.orientation,
  fasting,
});

const rowOf = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientMealConfiguration | null> =>
  (await configurations(db).findMany({ patientId }, { limit: 1 })).items[0] ??
  null;

/**
 * The configuration of the file, or null when the practitioner has entered no
 * value. Null is « Non renseigné »: it is not Morgane's table.
 */
const unscopedGetPatientMealConfiguration = async (
  patientId: Id,
): Promise<MealConfiguration | null> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return null;
  }
  const row = await rowOf(patientId);
  if (!row) {
    return null;
  }
  const configuration = mealConfigurationOf(row);
  return isMealConfigurationEmpty(configuration) ? null : configuration;
};

/**
 * Apply one change of the practitioner.
 *
 * 1. A value that is not a change is refused as `invalid_input`, and nothing
 *    is written.
 * 2. A change that moves no value writes nothing and no event.
 * 3. One `meal_configuration.updated` event has each value that moved, with
 *    its old and its new value (D-32). The values are codes: no patient text.
 * 4. A file at « Prêt pour consultation » moves to « Recommandations à
 *    valider » (D-31).
 */
const unscopedUpdatePatientMealConfiguration = async (
  patientId: Id,
  operator: OperatorActor,
  submitted: MealConfigurationChange,
): Promise<Result<MealConfiguration>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const change = parseMealConfigurationChange(submitted);
  if (!change) {
    return err("invalid_input", "this is not a change of the meal configuration");
  }

  const row = await rowOf(patientId);
  const before = row ? mealConfigurationOf(row) : emptyMealConfiguration;
  const after = applyMealConfigurationChange(before, change);
  const changes = mealConfigurationChanges(before, after);
  if (changes.length === 0) {
    return ok(after);
  }

  try {
    await getDatabase().transaction(async (tx) => {
      if (row) {
        await configurations(tx).update(row.id, columnsOf(after));
      } else {
        await configurations(tx).insert({ patientId, ...columnsOf(after) });
      }
      await touchPatient(patientId, tx);
    });
  } catch (cause) {
    // Two first changes at the same time ask for the same row. The unique
    // index refuses the second one.
    console.error("[meal-configuration] the change was not written", cause);
    return err("conflict", "another change of the meals ran at the same time");
  }

  await recordAuditEvent({
    actor: operator,
    action: "meal_configuration.updated",
    targetType: "patient",
    targetId: patientId,
    targetLabel: file.pseudonym,
    detail: JSON.stringify({ change: change.type, changes }),
  });
  await moveToValidateAfterSave(patientId);
  return ok(after);
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const getPatientMealConfiguration = byPatient(
  "read",
  unscopedGetPatientMealConfiguration,
  () => null,
);
export const updatePatientMealConfiguration = byPatient(
  "write",
  unscopedUpdatePatientMealConfiguration,
  noSuchPatient,
);
