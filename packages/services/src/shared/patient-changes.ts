/**
 * The patient's changes after activation — story 21, `patient-change-signals`.
 *
 * This module is the one home of the fields that raise a change signal. A
 * patient write that changes one of them, on a file whose care is active,
 * leaves one `patient_changes` row: the field, the old value, the new value
 * and the time. The practitioner acknowledges it on the file.
 *
 * The list is the health fields (breakdown question 1, the default, accepted
 * by Jamie on 2026-11-11). Name, e-mail, phone, birth date, the consultation
 * fields and the food preferences raise no signal. Morgane's answer, when it
 * differs, changes this list and the `check()` on `patient_changes.field_key`.
 *
 * Isomorphic: no I/O, so the console imports it as is.
 */

/** Each key is the questionnaire's own field key, in the questionnaire's order. */
export const watchedPatientFields = [
  "heightCm",
  "weightKg",
  "desiredWeightKg",
  "activityLevel",
  "diet",
  "dietNote",
  "medications",
  "supplements",
  "geneticTest",
  "apoe",
  "dio2",
  "amy1a",
  "allergies",
  "intolerances",
] as const;

export type WatchedPatientField = (typeof watchedPatientFields)[number];

export const isWatchedPatientField = (
  field: string,
): field is WatchedPatientField =>
  (watchedPatientFields as readonly string[]).includes(field);

/**
 * A field's value as `patient_changes` stores it: the stored value, never a
 * label. A list (allergies, intolerances) is its sorted entries. `null` is an
 * empty answer.
 */
export type PatientChangeValue =
  string | number | boolean | readonly string[] | null;
