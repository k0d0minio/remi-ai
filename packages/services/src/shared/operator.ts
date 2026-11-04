/**
 * The runtime half of the operator vocabulary, in the shared surface for the
 * same reason as the patient constants: `db/models/` is types-only, and a role
 * select in a client component needs the list at runtime.
 */

/**
 * The two roles of D-27. `admin` is the REMI team: it manages the accounts, and
 * it may open any patient file with a reason, read-only (story 3). The open is
 * logged. `practitioner` reads and writes only the files it holds. The roles
 * replace `owner` and `operator`. Migration 0036 renamed the stored values.
 *
 * Order matters: the array reads most-privileged first, and
 * `isAtLeast()` compares by index.
 */
export const operatorRoles = ["admin", "practitioner"] as const;

export type OperatorRoleName = (typeof operatorRoles)[number];

/**
 * Whether `role` carries at least the privilege of `required`. A value outside
 * the list carries no privilege: an unknown role is never read as the first one.
 */
export const isAtLeast = (
  role: OperatorRoleName,
  required: OperatorRoleName,
) => {
  const held = operatorRoles.indexOf(role);
  return held !== -1 && held <= operatorRoles.indexOf(required);
};

/** The single answer to "may this account touch other accounts". */
export const canManageOperators = (role: OperatorRoleName) =>
  isAtLeast(role, "admin");

/**
 * The two orders of the practitioner's patient list (story 5). The list keeps
 * one per practitioner, in `operators.patient_list_sort`.
 */
export const patientListSorts = ["appointment", "name"] as const;

export type PatientListSort = (typeof patientListSorts)[number];

/** Morgane's default for the first sort (story 5, question 3). */
export const defaultPatientListSort: PatientListSort = "appointment";

export const isPatientListSort = (value: unknown): value is PatientListSort =>
  (patientListSorts as readonly unknown[]).includes(value);
