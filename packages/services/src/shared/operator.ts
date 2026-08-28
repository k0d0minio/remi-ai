/**
 * The runtime half of the operator vocabulary, in the shared surface for the
 * same reason as the patient constants: `db/models/` is types-only, and a role
 * select in a client component needs the list at runtime.
 */

/**
 * `owner` manages accounts as well as patients; `operator` manages patients
 * only. Two roles, not three — a third would need a screen it can actually be
 * granted from, and there is no such need yet.
 *
 * Order matters: the array reads most-privileged first, and
 * `isAtLeast()` compares by index.
 */
export const operatorRoles = ["owner", "operator"] as const;

export type OperatorRoleName = (typeof operatorRoles)[number];

/** Whether `role` carries at least the privilege of `required`. */
export const isAtLeast = (role: OperatorRoleName, required: OperatorRoleName) =>
  operatorRoles.indexOf(role) <= operatorRoles.indexOf(required);

/** The single answer to "may this account touch other accounts". */
export const canManageOperators = (role: OperatorRoleName) =>
  isAtLeast(role, "owner");
