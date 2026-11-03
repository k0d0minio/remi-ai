import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getFileStore, isFileStoreConfigured } from "../../../files";
import { patientFilesPrefix } from "../../../shared/files";
import { locales } from "../../../shared/i18n";
import {
  cookingAffinities,
  cookingTimes,
  foodBudgets,
  patientEditableProfileFields,
  patientSexes,
  patientStatuses,
} from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientDocument } from "../../models/patient-document";
import type {
  PatientEditableProfileField,
  PatientProfile,
} from "../../models/patient-profile";
import { consentInForce } from "../patient-consents/in-force";

/**
 * The patient-profile service — the callable surface behind Morgane's admin
 * console and the shareable patient link (REMI-035). Every read and write of a
 * patient profile in the monorepo goes through here; nothing above this file
 * names the driver.
 */

/**
 * The collection, on the pooled client by default or on a transaction when one
 * is handed in. Every write below takes that client as a trailing optional
 * argument for the same reason: `recordConsultation` composes several of them
 * into one unit, and a service that can only reach `getDatabase()` cannot be
 * part of a transaction someone else opened.
 */
const patients = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientProfile>("patient_profiles");

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

/** `""` clears the column. Shared by the two calendar dates on the profile. */
const calendarDate = z.union([
  z.literal(""),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "that date is not valid")
    .refine(
      (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
      "that date is not valid",
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
  birthDate: calendarDate,
  sex: z.enum(patientSexes),
  heightCm: optionalNumber(280),
  weightKg: optionalNumber(500),
  objective: text,
  dietaryRegime: text,
  allergies: text,
  intolerances: text,
  constraints: text,
  preferences: text,
  /** `""` clears it; the enum is what a later recipe filter can branch on. */
  likesCooking: z.union([z.literal(""), z.enum(cookingAffinities)]),
  cookingTime: z.union([z.literal(""), z.enum(cookingTimes)]),
  foodBudget: z.union([z.literal(""), z.enum(foodBudgets)]),
  medications: text,
  supplements: text,
  referral: text,
  anamnesis: text,
  // No `consentDate` or `consentChannel`: the two columns are read-only since
  // `consent-texts-and-records`. A consent is a row of `patient_consents`.
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

/** The same shape again, typed so a closed set keeps its enum on the way in. */
const nullableEnum = <T extends string>(value: T | "" | undefined) =>
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
 * One practitioner's files (D-27). The console lists patients through this
 * and nothing else, so no screen can show another practitioner's file.
 *
 * Search, filter and sort happen here rather than in the driver: the storage
 * seam speaks in exact-match filters only, and a roster that fits in one page
 * of rows does not earn a query language. If this ever stops fitting in 200
 * rows, the fix is a richer seam, not a filter in the page.
 */
export const patientsOf = async (
  practitionerId: Id,
  query: PatientQuery = {},
): Promise<readonly PatientProfile[]> => {
  if (!isValidId(practitionerId)) {
    return [];
  }
  const page = await patients().findMany({ practitionerId }, { limit: 200 });
  const status = query.status && query.status !== "all" ? query.status : null;
  return page.items
    .filter((patient) => (status ? patient.status === status : true))
    .filter((patient) => matchesSearch(patient, query.search ?? ""))
    .sort(sorters[query.sort ?? "recent"]);
};

export const getPatient = async (
  id: Id,
  db?: DatabaseClient,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const patient = await patients(db).findById(id);
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/**
 * One file, only when this practitioner holds it. A file of another
 * practitioner answers `not_found`, like a missing one: « forbidden » would
 * confirm that the id exists.
 */
export const patientOf = async (
  practitionerId: Id,
  id: Id,
  db?: DatabaseClient,
): Promise<Result<PatientProfile>> => {
  const found = await getPatient(id, db);
  return found.ok && found.data.practitionerId === practitionerId
    ? found
    : err("not_found", "no such patient");
};

/**
 * The collections whose rows sit in one patient file, each by its
 * `patientId`. A console action that names a row, not a file, finds the file
 * through this map before it writes.
 */
const patientRecordCollections = {
  recommendation: "patient_recommendations",
  supplement: "patient_supplements",
  pantryEssential: "patient_pantry_essentials",
  mealEntry: "patient_meal_entries",
  observation: "patient_observations",
  goal: "patient_goals",
  challenge: "patient_challenges",
  message: "patient_messages",
  recipeAssignment: "patient_recipe_assignments",
  note: "patient_notes",
  document: "patient_documents",
} as const;

/** A check-in hangs from a goal, not from the file: one step more. */
export type PatientRecordKind =
  keyof typeof patientRecordCollections | "goalCheckIn";

type FileRow = { id: Id; patientId: Id };

const patientIdOfRecord = async (
  kind: PatientRecordKind,
  id: Id,
): Promise<Id | null> => {
  const db = getDatabase();
  if (kind === "goalCheckIn") {
    const checkIn = await db
      .collection<{ id: Id; goalId: Id }>("patient_goal_check_ins")
      .findById(id);
    return checkIn ? patientIdOfRecord("goal", checkIn.goalId) : null;
  }
  const row = await db
    .collection<FileRow>(patientRecordCollections[kind])
    .findById(id);
  return row?.patientId ?? null;
};

/** The file a row sits in, only when this practitioner holds it. */
export const patientOfRecord = async (
  practitionerId: Id,
  kind: PatientRecordKind,
  id: Id,
): Promise<Result<PatientProfile>> => {
  const patientId = isValidId(id) ? await patientIdOfRecord(kind, id) : null;
  return patientId
    ? patientOf(practitionerId, patientId)
    : err("not_found", "no such patient");
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

/**
 * A new file names its practitioner, or the service refuses it. The id is not
 * in `patientFields`: an update never moves a file to another practitioner.
 */
const newPatientFields = patientFields
  .partial()
  .required({ pseudonym: true })
  .extend({
    practitionerId: z.uuid("a practitioner is required"),
    /** Only the sign-up page sends these three. The console sends `fullName`. */
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    phone: z.string().trim().max(30).optional(),
  });

export type NewPatientInput = z.input<typeof newPatientFields>;

/**
 * Médicaments and compléments are optional data: stored only under a `given`
 * care consent (story 3, `genetic-consent-and-optional-data`). A clear needs
 * no consent.
 */
const careGatedFields = ["medications", "supplements"] as const;

const CARE_CONSENT_REQUIRED =
  "the medications and the supplements need the care consent";

export const createPatient = async (
  input: NewPatientInput,
  db?: DatabaseClient,
): Promise<Result<PatientProfile>> => {
  const parsed = newPatientFields.safeParse(input);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]);
  }
  const data = parsed.data;
  // A new file holds no consent yet: the sign-up records them after the row.
  if (careGatedFields.some((field) => data[field])) {
    return err("not_permitted", CARE_CONSENT_REQUIRED);
  }
  const patient = await patients(db).insert({
    practitionerId: data.practitionerId,
    pseudonym: data.pseudonym,
    fullName: data.fullName ? data.fullName : null,
    firstName: data.firstName ? data.firstName : null,
    lastName: data.lastName ? data.lastName : null,
    phone: data.phone ? data.phone : null,
    email: data.email ? data.email : null,
    locale: data.locale ?? "fr",
    status: data.status ?? "active",
    birthDate: data.birthDate ? data.birthDate : null,
    sex: data.sex ?? "unspecified",
    heightCm: data.heightCm ? data.heightCm : null,
    weightKg: data.weightKg ? data.weightKg : null,
    objective: data.objective ?? "",
    dietaryRegime: data.dietaryRegime ?? "",
    allergies: data.allergies ?? "",
    intolerances: data.intolerances ?? "",
    constraints: data.constraints ?? "",
    preferences: data.preferences ?? "",
    likesCooking: data.likesCooking ? data.likesCooking : null,
    cookingTime: data.cookingTime ? data.cookingTime : null,
    foodBudget: data.foodBudget ? data.foodBudget : null,
    medications: data.medications ?? "",
    supplements: data.supplements ?? "",
    referral: data.referral ?? "",
    anamnesis: data.anamnesis ?? "",
    nextConsultationPrep: null,
    consentDate: null,
    consentChannel: null,
    lastEditedAt: new Date(),
    shareToken: newShareToken(),
    linkLastOpenedAt: null,
    linkLastWroteAt: null,
    patientEditedAt: {},
  });
  return ok(patient);
};

type EditableValues = Pick<PatientProfile, PatientEditableProfileField>;

/** The fields of a patch that would actually change what the row holds. */
const changedEditableFields = (
  current: PatientProfile,
  patch: Partial<EditableValues>,
): PatientEditableProfileField[] =>
  patientEditableProfileFields.filter(
    (field) => patch[field] !== undefined && patch[field] !== current[field],
  );

/** The map without the given fields — `undefined` when nothing was dropped. */
const withoutEdits = (
  edits: PatientProfile["patientEditedAt"],
  fields: readonly PatientEditableProfileField[],
): PatientProfile["patientEditedAt"] | undefined => {
  if (!fields.some((field) => edits[field] !== undefined)) {
    return undefined;
  }
  const kept = { ...edits };
  for (const field of fields) {
    delete kept[field];
  }
  return kept;
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
  const {
    fullName,
    email,
    birthDate,
    heightCm,
    weightKg,
    likesCooking,
    cookingTime,
    foodBudget,
    ...rest
  } = parsed.data;
  const patch: Partial<PatientProfile> = { ...rest, lastEditedAt: new Date() };
  assign(patch, "fullName", nullableText(fullName));
  assign(patch, "email", nullableText(email));
  assign(patch, "birthDate", nullableText(birthDate));
  assign(patch, "heightCm", nullableNumber(heightCm));
  assign(patch, "weightKg", nullableNumber(weightKg));
  assign(patch, "likesCooking", nullableEnum(likesCooking));
  assign(patch, "cookingTime", nullableEnum(cookingTime));
  assign(patch, "foodBudget", nullableEnum(foodBudget));

  // Her change to a field the patient last changed makes the value hers again,
  // so « modifié par la patiente » comes off that field — and only that one.
  // The console form posts every field on each save, so the test is whether
  // the value moved, not whether it was sent.
  const current = await patients().findById(id);
  if (!current) {
    return err("not_found", "no such patient");
  }
  // The console form posts every field, so a value it sends back unchanged
  // passes. Only a new non-empty value needs the consent.
  const writesCareData = careGatedFields.some(
    (field) => patch[field] && patch[field] !== current[field],
  );
  if (writesCareData && !(await consentInForce(id, "care"))) {
    return err("not_permitted", CARE_CONSENT_REQUIRED);
  }
  assign(
    patch,
    "patientEditedAt",
    withoutEdits(
      current.patientEditedAt,
      changedEditableFields(current, patch),
    ),
  );

  const patient = await patients().update(id, patch);
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/**
 * The seven fields of « Mon profil », as the patient's form posts them. Every
 * field is required: the form always sends all seven, and a missing one is a
 * post nothing on the page can produce.
 */
const patientProfileEditFields = patientFields
  .pick({
    dietaryRegime: true,
    allergies: true,
    intolerances: true,
    preferences: true,
    likesCooking: true,
    cookingTime: true,
    foodBudget: true,
  })
  .required();

export type PatientProfileEdit = z.input<typeof patientProfileEditFields>;

export type PatientProfileEdited = {
  patient: PatientProfile;
  /** The fields this save changed; empty when it changed nothing. */
  changed: readonly PatientEditableProfileField[];
};

/**
 * The patient keeping their own food profile true, from « Mon profil »
 * (`patient-profile-edit`). Reached only through `writeThroughPatientLink`,
 * which resolves the token, applies the link's ceilings and records the write.
 *
 * Only the seven patient-editable fields can move — the rest of the profile is
 * the practitioner's record and this function cannot name it. A save that
 * changes nothing writes nothing, so the caller can leave it out of the trail.
 * It never moves `lastEditedAt`: that column means Morgane worked on this
 * patient and sorts her roster.
 */
export const updatePatientProfileByPatient = async (
  id: Id,
  input: PatientProfileEdit,
): Promise<Result<PatientProfileEdited>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const parsed = patientProfileEditFields.safeParse(input);
  if (!parsed.success) {
    return invalid(parsed.error.issues[0]);
  }
  const current = await patients().findById(id);
  if (!current) {
    return err("not_found", "no such patient");
  }

  const { likesCooking, cookingTime, foodBudget, ...texts } = parsed.data;
  const next: EditableValues = {
    ...texts,
    likesCooking: likesCooking === "" ? null : likesCooking,
    cookingTime: cookingTime === "" ? null : cookingTime,
    foodBudget: foodBudget === "" ? null : foodBudget,
  };
  const changed = changedEditableFields(current, next);
  if (changed.length === 0) {
    return ok({ patient: current, changed });
  }

  const at = new Date().toISOString();
  const edits = { ...current.patientEditedAt };
  const patch: Partial<PatientProfile> = {};
  for (const field of changed) {
    Object.assign(patch, { [field]: next[field] });
    edits[field] = at;
  }
  patch.patientEditedAt = edits;
  const patient = await patients().update(id, patch);
  return patient
    ? ok({ patient, changed })
    : err("not_found", "no such patient");
};

/**
 * Marks the profile as worked on without going through `updatePatient`. Called
 * by the recommendation and note services, because encoding a protocol entry
 * IS working on that patient — and the roster's ordering is only useful if it
 * says so.
 */
export const touchPatient = async (
  id: Id,
  db?: DatabaseClient,
): Promise<void> => {
  if (!isValidId(id)) {
    return;
  }
  await patients(db).update(id, { lastEditedAt: new Date() });
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

/**
 * Puts back the roster timestamp a patient's write moved.
 *
 * The console services bump `lastEditedAt` on every write, correctly: encoding
 * a protocol entry IS working on that patient. A patient writing through their
 * own link is not, and the later stubs of `patient-loop` reach those same
 * services — so the rule is enforced once, where every patient write passes,
 * rather than five times in five callers that each have to remember it.
 *
 * It compares before it writes, so a write that never touched the column costs
 * nothing. An operator edit landing inside the same few milliseconds would be
 * put back a second early; with one practitioner and a roster of fifteen that
 * is a stale sort order nobody sees, and the alternative — a patient's meal
 * jumping their record above the one she spent the morning on — is the failure
 * that would actually be noticed.
 */
export const restorePatientLastEdited = async (
  id: Id,
  previous: Date,
): Promise<void> => {
  const patient = await patients().findById(id);
  if (!patient || patient.lastEditedAt.getTime() === previous.getTime()) {
    return;
  }
  await patients().update(id, { lastEditedAt: previous });
};

/**
 * Records that the patient wrote through their link. Unlike the open above it
 * is not rate-limited and never skipped: a write is already ceilinged by
 * `writeThroughPatientLink`, and this is the timestamp Morgane reads to know
 * something is waiting for her — a stale one would be worse than none.
 *
 * It never touches `lastEditedAt` either. The roster sorts on that, and it
 * means she worked on this patient; a patient logging a meal must not push
 * their own record above the one she spent the morning encoding.
 */
export const recordPatientLinkWrote = async (id: Id): Promise<void> => {
  if (!isValidId(id)) {
    return;
  }
  await patients().update(id, { linkLastWroteAt: new Date() });
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
    linkLastWroteAt: null,
    lastEditedAt: new Date(),
  });
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/**
 * Sets the "à préparer pour la prochaine consultation" note — the one field the
 * working view edits directly, before `consultation-update` owns the clear /
 * revise flow. `""` clears it back to `null`. Writing it counts as working on
 * the patient, so `lastEditedAt` moves like any operator edit.
 */
export const setPatientNextConsultationPrep = async (
  id: Id,
  value: string,
  db?: DatabaseClient,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  const parsed = text.safeParse(value);
  if (!parsed.success) {
    return err("invalid_input", "that note is too long");
  }
  const prep = parsed.data === "" ? null : parsed.data;
  const patient = await patients(db).update(id, {
    nextConsultationPrep: prep,
    lastEditedAt: new Date(),
  });
  return patient ? ok(patient) : err("not_found", "no such patient");
};

/**
 * Removes the profile and, by cascade, everything that hangs off it — and,
 * first, the patient's files in the store, which no database cascade reaches.
 * A store that refuses stops the deletion: a patient is never deleted while
 * their files stay behind. Without a configured store, a patient who has
 * files is refused for the same reason; one who has none is deleted as ever.
 */
export const deletePatient = async (id: Id): Promise<Result<true>> => {
  if (!isValidId(id)) {
    return err("not_found", "no such patient");
  }
  if (isFileStoreConfigured()) {
    try {
      await getFileStore().removePrefix(patientFilesPrefix(id));
    } catch {
      // The sweep goes page by page, so a failure can come after some files
      // are gone. The profile and its rows stay; the sweep is safe to repeat,
      // so the answer is to try again, and the message says exactly that.
      return err(
        "upstream_failed",
        "the patient's files could not all be removed from the store — the profile was kept; try the deletion again",
      );
    }
  } else {
    const files = await getDatabase()
      .collection<PatientDocument>("patient_documents")
      .findMany({ patientId: id, kind: "file" }, { limit: 1 });
    if (files.items.length > 0) {
      return err(
        "upstream_failed",
        "no file store is configured, so the patient's files cannot be removed — nothing was deleted",
      );
    }
  }
  const removed = await patients().remove(id);
  return removed ? ok(true) : err("not_found", "no such patient");
};
