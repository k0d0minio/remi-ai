import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  defaultPatientListSort,
  operatorRoles,
  patientListSorts,
} from "../../../shared/operator";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { verifyPassword, hashPassword } from "../../../auth/password";
import { getDatabase } from "../../client";
import type { Operator, OperatorRole } from "../../models/operator";

/**
 * Operator accounts for the admin console — Morgane, Arnaud, and whoever they
 * invite. Accounts come into being two ways and only two: the guarded
 * first-run bootstrap on the sign-in page, and an accepted invitation. There
 * is no self-serve sign-up.
 *
 * One invariant runs through this file: **the console always has at least one
 * admin.** Every path that could remove the last one — deleting an account,
 * demoting it — refuses instead. A console nobody can administer is not
 * recoverable from inside the console, which is exactly when you need it.
 */

const operators = () => getDatabase().collection<Operator>("operators");

const normaliseEmail = (email: string) => email.trim().toLowerCase();

/**
 * 24 random bytes as 32 base64url characters. The column default in
 * `schema.ts` writes the same shape for the rows that predate the column.
 */
const newSignupLinkToken = () => randomBytes(24).toString("base64url");

const signupLinkTokenShape = /^[A-Za-z0-9_-]{32}$/;

export const hasOperator = async (): Promise<boolean> => {
  const page = await operators().findMany({}, { limit: 1 });
  return page.items.length > 0;
};

export const getOperator = async (id: Id): Promise<Operator | null> => {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }
  return operators().findById(id);
};

export const findOperatorByEmail = async (
  email: string,
): Promise<Operator | null> => {
  const page = await operators().findMany(
    { email: normaliseEmail(email) },
    { limit: 1 },
  );
  return page.items[0] ?? null;
};

/** Admins first, then alphabetically — the roster reads as a hierarchy. */
export const listOperators = async (): Promise<readonly Operator[]> => {
  const page = await operators().findMany({}, { limit: 200 });
  return [...page.items].sort((a, b) => {
    const roleDelta =
      operatorRoles.indexOf(a.role) - operatorRoles.indexOf(b.role);
    return roleDelta !== 0 ? roleDelta : a.name.localeCompare(b.name, "fr");
  });
};

const countAdmins = async (): Promise<number> => {
  const page = await operators().findMany({}, { limit: 200 });
  return page.items.filter((operator) => operator.role === "admin").length;
};

const passwordSchema = z
  .string()
  .min(12, "the password needs at least 12 characters")
  .max(1_000);

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("a valid email address is required")),
  name: z.string().trim().min(1, "a name is required").max(200),
  password: passwordSchema,
  role: z.enum(operatorRoles).optional(),
});

export type OperatorInput = z.input<typeof credentialsSchema>;

export const createOperator = async (
  input: OperatorInput,
): Promise<Result<Operator>> => {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const email = parsed.data.email;
  if (await findOperatorByEmail(email)) {
    return err("conflict", "an operator with that email already exists");
  }
  const operator = await operators().insert({
    email,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role ?? "practitioner",
    signupLinkToken: newSignupLinkToken(),
    patientListSort: defaultPatientListSort,
  });
  return ok(operator);
};

/** What the sign-up page may know about a practitioner: no email, no hash. */
export type SignupLinkPractitioner = { id: Id; name: string };

/**
 * Resolves a permanent sign-up link to its practitioner (story 1). It only
 * reads: an unknown link writes nothing. A value that is not 32 base64url
 * characters is refused before any query.
 */
export const getPractitionerBySignupToken = async (
  token: string,
): Promise<Result<SignupLinkPractitioner>> => {
  if (!signupLinkTokenShape.test(token)) {
    return err("not_found", "no such sign-up link");
  }
  const page = await operators().findMany(
    { signupLinkToken: token },
    { limit: 1 },
  );
  const operator = page.items[0];
  return operator
    ? ok({ id: operator.id, name: operator.name })
    : err("not_found", "no such sign-up link");
};

/**
 * One generic failure for a wrong email and a wrong password alike — the
 * sign-in form must not confirm which emails hold an account.
 */
export const verifyOperator = async (
  email: string,
  password: string,
): Promise<Result<Operator>> => {
  const operator = await findOperatorByEmail(email);
  if (!operator || !(await verifyPassword(password, operator.passwordHash))) {
    return err("not_permitted", "that email and password do not match");
  }
  return ok(operator);
};

export const updateOperatorName = async (
  id: Id,
  name: string,
): Promise<Result<Operator>> => {
  if (!z.uuid().safeParse(id).success) {
    return err("not_found", "no such operator");
  }
  const parsed = z
    .string()
    .trim()
    .min(1, "a name is required")
    .max(200)
    .safeParse(name);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await operators().update(id, { name: parsed.data });
  return updated ? ok(updated) : err("not_found", "no such operator");
};

/**
 * Remembers the order of the practitioner's patient list (story 5). The list
 * reads it back from the operator on the next visit, on any device.
 */
export const setOperatorPatientListSort = async (
  id: Id,
  sort: string,
): Promise<Result<Operator>> => {
  if (!z.uuid().safeParse(id).success) {
    return err("not_found", "no such operator");
  }
  const parsed = z.enum(patientListSorts).safeParse(sort);
  if (!parsed.success) {
    return err("invalid_input", "the sort must be appointment or name");
  }
  const updated = await operators().update(id, {
    patientListSort: parsed.data,
  });
  return updated ? ok(updated) : err("not_found", "no such operator");
};

/**
 * The current password is required even though the caller is already signed
 * in: a session left open on a shared screen should not be enough to take an
 * account over permanently.
 */
export const changeOperatorPassword = async (
  id: Id,
  currentPassword: string,
  nextPassword: string,
): Promise<Result<Operator>> => {
  if (!z.uuid().safeParse(id).success) {
    return err("not_found", "no such operator");
  }
  const parsed = passwordSchema.safeParse(nextPassword);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const operator = await getOperator(id);
  if (!operator) {
    return err("not_found", "no such operator");
  }
  if (!(await verifyPassword(currentPassword, operator.passwordHash))) {
    return err("not_permitted", "that is not the current password");
  }
  const updated = await operators().update(id, {
    passwordHash: await hashPassword(parsed.data),
  });
  return updated ? ok(updated) : err("not_found", "no such operator");
};

export const setOperatorRole = async (
  id: Id,
  role: OperatorRole,
): Promise<Result<Operator>> => {
  if (!operatorRoles.includes(role)) {
    return err("invalid_input", "that is not a role");
  }
  const operator = await getOperator(id);
  if (!operator) {
    return err("not_found", "no such operator");
  }
  if (operator.role === role) {
    return ok(operator);
  }
  if (operator.role === "admin" && (await countAdmins()) <= 1) {
    return err(
      "not_permitted",
      "this is the last admin — promote someone else before changing this account",
    );
  }
  const updated = await operators().update(id, { role });
  return updated ? ok(updated) : err("not_found", "no such operator");
};

export const deleteOperator = async (id: Id): Promise<Result<true>> => {
  const operator = await getOperator(id);
  if (!operator) {
    return err("not_found", "no such operator");
  }
  if (operator.role === "admin" && (await countAdmins()) <= 1) {
    return err(
      "not_permitted",
      "this is the last admin — the console would have nobody who can manage it",
    );
  }
  // The foreign key refuses it too. This answer says why, before the driver
  // throws: the files of an account must find a new practitioner first (D-27).
  const held = await getDatabase()
    .collection<{ id: Id; practitionerId: Id }>("patient_profiles")
    .findMany({ practitionerId: id }, { limit: 1 });
  if (held.items.length > 0) {
    return err(
      "not_permitted",
      "this account still holds patient files — they need another practitioner first",
    );
  }
  const removed = await operators().remove(id);
  return removed ? ok(true) : err("not_found", "no such operator");
};
