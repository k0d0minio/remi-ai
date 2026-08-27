import { randomBytes } from "node:crypto";
import { z } from "zod";
import { locales } from "../../../shared/i18n";
import { patientStatuses } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";

/**
 * The patient-profile service — the callable surface behind Morgane's admin
 * console and the shareable patient link (REMI-035). Every read and write of a
 * patient profile in the monorepo goes through here; nothing above this file
 * names the driver.
 */

const patients = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

/** 24 random bytes, base64url — an unguessable capability, not a session. */
const newShareToken = () => randomBytes(24).toString("base64url");

const uuidSchema = z.uuid();

/** A malformed id is "no such patient", never a database error surfaced to a page. */
const isValidId = (id: Id) => uuidSchema.safeParse(id).success;

const text = z.string().trim().max(10_000);

/**
 * No `.default()`s here: the same shape validates creates and partial updates,
 * and a default applied during an update would silently blank the fields the
 * form did not send.
 */
const patientFields = z.object({
  pseudonym: z.string().trim().min(1, "a pseudonym is required").max(120),
  fullName: z.string().trim().max(200),
  email: z.union([z.literal(""), z.email("that email address is not valid")]),
  locale: z.enum(locales),
  status: z.enum(patientStatuses),
  objective: text,
  constraints: text,
  preferences: text,
  anamnesis: text,
});

export type PatientInput = Partial<z.infer<typeof patientFields>>;

const invalid = (issue: { message: string }) =>
  err("invalid_input", issue.message);

export const listPatients = async (): Promise<readonly PatientProfile[]> => {
  const page = await patients().findMany({}, { limit: 200 });
  return page.items;
};

export const getPatient = async (id: Id): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const patient = await patients().findById(id);
  return patient ? ok(patient) : err("not_found", "no such patient");
};

export const getPatientByShareToken = async (
  token: string,
): Promise<Result<PatientProfile>> => {
  // The token is a capability: an exact-match lookup, never a prefix or a scan.
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) {
    return err("not_found", "no such patient link");
  }
  const page = await patients().findMany({ shareToken: token }, { limit: 1 });
  const patient = page.items[0];
  return patient ? ok(patient) : err("not_found", "no such patient link");
};

export const createPatient = async (
  input: PatientInput,
): Promise<Result<PatientProfile>> => {
  const parsed = patientFields
    .partial()
    .required({ pseudonym: true })
    .safeParse(input);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]);
  }
  const data = parsed.data;
  const patient = await patients().insert({
    pseudonym: data.pseudonym,
    fullName: data.fullName ? data.fullName : null,
    email: data.email ? data.email : null,
    locale: data.locale ?? "fr",
    status: data.status ?? "active",
    objective: data.objective ?? "",
    constraints: data.constraints ?? "",
    preferences: data.preferences ?? "",
    anamnesis: data.anamnesis ?? "",
    shareToken: newShareToken(),
  });
  return ok(patient);
};

export const updatePatient = async (
  id: Id,
  input: PatientInput,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const parsed = patientFields.partial().safeParse(input);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]);
  }
  const { fullName, email, ...rest } = parsed.data;
  const patch: Partial<PatientProfile> = { ...rest };
  if (fullName !== undefined) {
    patch.fullName = fullName ? fullName : null;
  }
  if (email !== undefined) {
    patch.email = email ? email : null;
  }
  const patient = await patients().update(id, patch);
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/** Cuts off the old link — the recovery move when a share URL leaks. */
export const regenerateShareToken = async (
  id: Id,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const patient = await patients().update(id, { shareToken: newShareToken() });
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/** Removes the profile and, by cascade, its recommendations. */
export const deletePatient = async (id: Id): Promise<Result<true>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const removed = await patients().remove(id);
  return removed ? ok(true) : err("not_found", "no such patient");
};
