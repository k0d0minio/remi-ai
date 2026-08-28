import { randomBytes } from "node:crypto";
import { z } from "zod";
import { locales } from "../../../shared/i18n";
import { patientSexes, patientStatuses } from "../../../shared/patient";
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
 * An empty string clears an optional number; anything non-numeric is rejected.
 * Spelled out rather than `z.coerce.number()` so the *input* type stays
 * `string | number` — a coercing schema's input is `unknown`, which would leak
 * all the way out to `PatientInput` and stop the form's field being checked.
 */
const optionalNumber = (max: number) =>
  z.union([
    z.literal(""),
    z
      .union([z.string(), z.number()])
      .transform((value) =>
        typeof value === "number" ? value : Number(value.trim()),
      )
      .refine(
        (value) => Number.isFinite(value) && value > 0 && value <= max,
        "that value is out of range",
      ),
  ]);

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
  birthDate: z.union([
    z.literal(""),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "that date is not valid")
      .refine(
        (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
        "that date is not valid",
      ),
  ]),
  sex: z.enum(patientSexes),
  heightCm: optionalNumber(280),
  weightKg: optionalNumber(500),
  objective: text,
  constraints: text,
  preferences: text,
  medications: text,
  supplements: text,
  referral: text,
  anamnesis: text,
});

export type PatientInput = Partial<z.input<typeof patientFields>>;

export type PatientSort = "recent" | "name" | "created";

export type PatientQuery = {
  /** Matched case-insensitively against the pseudonym and the full name. */
  search?: string;
  status?: PatientProfile["status"] | "all";
  sort?: PatientSort;
};

const invalid = (issue: { message: string }) =>
  err("invalid_input", issue.message);

/** `""` clears the column; `undefined` means the form did not send the field. */
const nullableText = (value: string | undefined) =>
  value === undefined ? undefined : value === "" ? null : value;

const nullableNumber = (value: number | "" | undefined) =>
  value === undefined ? undefined : value === "" ? null : value;

const assign = <T extends object, K extends keyof T>(
  patch: T,
  key: K,
  value: T[K] | undefined,
) => {
  if (value !== undefined) {
    patch[key] = value;
  }
};

const matchesSearch = (patient: PatientProfile, search: string) => {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [patient.pseudonym, patient.fullName ?? "", patient.email ?? ""].some(
    (field) => field.toLowerCase().includes(needle),
  );
};

const sorters: Record<
  PatientSort,
  (a: PatientProfile, b: PatientProfile) => number
> = {
  recent: (a, b) => b.lastEditedAt.getTime() - a.lastEditedAt.getTime(),
  name: (a, b) => a.pseudonym.localeCompare(b.pseudonym, "fr"),
  created: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
};

/**
 * Search, filter and sort happen here rather than in the driver: the storage
 * seam speaks in exact-match filters only, and a roster that fits in one page
 * of rows does not earn a query language. If this ever stops fitting in 200
 * rows, the fix is a richer seam, not a filter in the page.
 */
export const listPatients = async (
  query: PatientQuery = {},
): Promise<readonly PatientProfile[]> => {
  const page = await patients().findMany({}, { limit: 200 });
  const status = query.status && query.status !== "all" ? query.status : null;
  return page.items
    .filter((patient) => (status ? patient.status === status : true))
    .filter((patient) => matchesSearch(patient, query.search ?? ""))
    .sort(sorters[query.sort ?? "recent"]);
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
    birthDate: data.birthDate ? data.birthDate : null,
    sex: data.sex ?? "unspecified",
    heightCm: data.heightCm ? data.heightCm : null,
    weightKg: data.weightKg ? data.weightKg : null,
    objective: data.objective ?? "",
    constraints: data.constraints ?? "",
    preferences: data.preferences ?? "",
    medications: data.medications ?? "",
    supplements: data.supplements ?? "",
    referral: data.referral ?? "",
    anamnesis: data.anamnesis ?? "",
    lastEditedAt: new Date(),
    shareToken: newShareToken(),
    linkLastOpenedAt: null,
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
  const { fullName, email, birthDate, heightCm, weightKg, ...rest } =
    parsed.data;
  const patch: Partial<PatientProfile> = { ...rest, lastEditedAt: new Date() };
  assign(patch, "fullName", nullableText(fullName));
  assign(patch, "email", nullableText(email));
  assign(patch, "birthDate", nullableText(birthDate));
  assign(patch, "heightCm", nullableNumber(heightCm));
  assign(patch, "weightKg", nullableNumber(weightKg));

  const patient = await patients().update(id, patch);
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/**
 * Marks the profile as worked on without going through `updatePatient`. Called
 * by the recommendation and note services, because encoding a protocol entry
 * IS working on that patient — and the roster's ordering is only useful if it
 * says so.
 */
export const touchPatient = async (id: Id): Promise<void> => {
  if (!isValidId(id)) {
    return;
  }
  await patients().update(id, { lastEditedAt: new Date() });
};

/** How stale the recorded value has to be before opening the link rewrites it. */
const LINK_OPEN_WRITE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Records that the share link was opened. Deliberately not a view counter and
 * deliberately rate-limited: this runs on an unauthenticated route, so without
 * the interval anyone holding the link could drive a write per request.
 *
 * It never touches `lastEditedAt` — a patient reading their page is not an
 * operator editing it, and the roster sorts on the latter.
 */
export const recordPatientLinkOpened = async (id: Id): Promise<void> => {
  if (!isValidId(id)) {
    return;
  }
  const patient = await patients().findById(id);
  if (!patient) {
    return;
  }
  const last = patient.linkLastOpenedAt?.getTime() ?? 0;
  if (Date.now() - last < LINK_OPEN_WRITE_INTERVAL_MS) {
    return;
  }
  await patients().update(id, { linkLastOpenedAt: new Date() });
};

/** Cuts off the old link — the recovery move when a share URL leaks. */
export const regenerateShareToken = async (
  id: Id,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const patient = await patients().update(id, {
    shareToken: newShareToken(),
    linkLastOpenedAt: null,
    lastEditedAt: new Date(),
  });
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/** Removes the profile and, by cascade, its recommendations and notes. */
export const deletePatient = async (id: Id): Promise<Result<true>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const removed = await patients().remove(id);
  return removed ? ok(true) : err("not_found", "no such patient");
};
