import { z } from "zod";
import {
  activityLevels,
  ALL_SUB_KEY,
  allergenKinds,
  allergens,
  allergenSubLists,
  amy1aCategories,
  apoeGenotypes,
  diets,
  dio2Categories,
  geneticTestAnswers,
  intolerances,
  missingMandatoryFields,
  sexesForCalculation,
  type MandatoryQuestionnaireField,
} from "../../../shared/questionnaire";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import type {
  AllergenKind,
  PatientAllergen,
  PatientQuestionnaire,
} from "../../models/patient-questionnaire";
import { recordAuditEvent, type AuditActor } from "../audit";
import { consentInForce } from "../patient-consents/in-force";
import { refreshBmiEstimate } from "../patient-calculations";
import { changesMeasures, setFileStatus } from "../patients";
import {
  byPatient,
  byPatientWrite,
  noSuchPatient,
  systemActor,
} from "../access";
import { recordPatientChanges, type WatchedValues } from "../patient-changes";

/**
 * The preparatory questionnaire's storage — story 4, `questionnaire-fields`.
 * Reads and writes the questionnaire's columns on `patient_profiles` and the
 * checkbox rows of `patient_allergens`. It decides no status and renders
 * nothing: `questionnaire-flow` builds the pages and the status flip on it.
 *
 * Null is « Non renseigné » everywhere (D-30). An empty string from a form
 * clears a field to null. It is never stored.
 *
 * Optional data needs its consent (story 3, `genetic-consent-and-optional-
 * data`). A genotype value is written only under a `given` genetic consent,
 * and every read returns it as null without one. The desired weight is
 * written only under a `given` care consent. A clear is always allowed.
 */

type QuestionnaireRow = { id: Id } & PatientQuestionnaire;

/** The same row, with the facts a change signal needs. */
type FileRow = QuestionnaireRow &
  Pick<PatientProfile, "pseudonym" | "fileStatus">;

const profiles = (db: DatabaseClient = getDatabase()) =>
  db.collection<QuestionnaireRow>("patient_profiles");

const allergenRows = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientAllergen>("patient_allergens");

/** The values of the named fields in a row, for `recordPatientChanges`. */
const valuesOf = (
  row: Readonly<Record<string, unknown>>,
  fields: readonly string[],
): WatchedValues =>
  Object.fromEntries(fields.map((field) => [field, row[field]]));

/** The watched field of each list: `allergy` → `allergies`. */
const watchedFieldOfKind = {
  allergy: "allergies",
  intolerance: "intolerances",
} as const satisfies Record<AllergenKind, "allergies" | "intolerances">;

/**
 * A list's rows as one value: `key`, `key/subKey`, and the « Autre » text
 * after a colon. `recordPatientChanges` sorts it.
 */
const listValue = (rows: readonly PatientAllergen[]): string[] =>
  rows.map((row) => {
    const name = row.subKey ? `${row.key}/${row.subKey}` : row.key;
    return row.otherText ? `${name}: ${row.otherText}` : name;
  });

const uuidSchema = z.uuid();

const isValidId = (id: Id) => uuidSchema.safeParse(id).success;

/** The answer columns, in the order the questionnaire asks them. */
const answerFields = [
  "sexForCalculation",
  "activityLevel",
  "desiredWeightKg",
  "consultationReason",
  "consultationDate",
  "diet",
  "dietNote",
  "pathologies",
  "celiacDisease",
  "geneticTest",
  "apoe",
  "dio2",
  "amy1a",
  "practitionerQuestionAnswer",
  "noKnownAllergies",
  "noKnownIntolerances",
] as const satisfies readonly (keyof PatientQuestionnaire)[];

/**
 * A row read before the migration, or an in-memory row that never had the
 * column, has `undefined` there. Both mean « Non renseigné ».
 */
const readAnswers = (row: QuestionnaireRow): PatientQuestionnaire => {
  const answers = {} as Record<keyof PatientQuestionnaire, unknown>;
  for (const field of answerFields) {
    answers[field] = row[field] ?? null;
  }
  return answers as PatientQuestionnaire;
};

const genotypeFields = ["apoe", "dio2", "amy1a"] as const;

/** The answers a reader may see: no genotype without the genetic consent. */
const visibleAnswers = async (
  row: QuestionnaireRow,
): Promise<PatientQuestionnaire> => {
  const answers = readAnswers(row);
  if (await consentInForce(row.id, "genetic")) {
    return answers;
  }
  return { ...answers, apoe: null, dio2: null, amy1a: null };
};

/** `""` or null clears the field. */
const clearable = <T extends z.ZodType>(schema: T) =>
  z
    .union([z.literal(""), z.null(), schema])
    .transform((value) => (value === "" ? null : (value as z.output<T>)));

const freeText = (max: number) =>
  z
    .union([z.null(), z.string().trim().max(max)])
    .transform((value) => (value === null || value === "" ? null : value));

/**
 * The service's floor, not the questionnaire's plausibility rule:
 * `questionnaire-flow` owns the range the patient sees. This one only keeps a
 * negative or absurd number out of the column.
 */
const weightKg = z.number().positive().max(500);

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "that date is not valid")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  );

/**
 * No `.default()`s: the shape validates partial saves, and a default would
 * blank the fields a save did not send. The two « none known » flags are not
 * here: `setPatientAllergens` writes them with the rows they describe.
 */
const answerSchema = z
  .object({
    sexForCalculation: clearable(z.enum(sexesForCalculation)),
    activityLevel: clearable(z.enum(activityLevels)),
    desiredWeightKg: clearable(weightKg),
    consultationReason: freeText(2_000),
    consultationDate: clearable(calendarDate),
    diet: clearable(z.enum(diets)),
    dietNote: freeText(500),
    pathologies: freeText(5_000),
    celiacDisease: z.union([z.null(), z.boolean()]),
    geneticTest: clearable(z.enum(geneticTestAnswers)),
    apoe: clearable(z.enum(apoeGenotypes)),
    dio2: clearable(z.enum(dio2Categories)),
    amy1a: clearable(z.enum(amy1aCategories)),
    practitionerQuestionAnswer: freeText(5_000),
  })
  .partial()
  .strict();

/** What a save accepts: any subset of the answers. */
export type QuestionnaireInput = z.input<typeof answerSchema>;

/** One checked box, as a page sends it. */
export type AllergenSelection = {
  key: string;
  /** A key of the category's sub-list, `all` for « Tous », or none. */
  subKey?: string | null;
  /** The « Autre » text. Only an `other` box takes one. */
  otherText?: string | null;
};

/**
 * The patient's answer to one list. Three states, as the story keeps them:
 * no answer, « Aucune … connue », or the boxes they checked.
 */
export type AllergenAnswer =
  | { state: "unanswered" }
  | { state: "none_known" }
  | { state: "declared"; items: readonly AllergenSelection[] };

export type PatientQuestionnaireView = {
  answers: PatientQuestionnaire;
  allergens: readonly PatientAllergen[];
};

const kindSchema = z.enum(allergenKinds);

const otherTextSchema = z.string().trim().min(1).max(2_000);

const subListOf = (key: string): readonly string[] | null =>
  Object.hasOwn(allergenSubLists, key)
    ? allergenSubLists[key as keyof typeof allergenSubLists]
    : null;

const keysOf = (kind: AllergenKind): readonly string[] =>
  kind === "allergy" ? allergens : intolerances;

/**
 * The read order: the story's list order, then within a category the whole
 * category first, « Tous » next, then the sub-list's order.
 */
const rankOf = (row: PatientAllergen) => {
  const keyRank = keysOf(row.kind).indexOf(row.key);
  const subList = subListOf(row.key) ?? [];
  const subRank =
    row.subKey === null
      ? -2
      : row.subKey === ALL_SUB_KEY
        ? -1
        : subList.indexOf(row.subKey);
  return [allergenKinds.indexOf(row.kind), keyRank, subRank] as const;
};

const byRank = (a: PatientAllergen, b: PatientAllergen) => {
  const left = rankOf(a);
  const right = rankOf(b);
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
};

type CleanSelection = {
  key: string;
  subKey: string | null;
  otherText: string | null;
};

/**
 * Checks each box against the kind's lists and reduces the set to the rows to
 * store:
 *
 * - « Tous » and individual boxes of the same category: « Tous » stays alone.
 * - A category sent bare and with sub-boxes: the sub-boxes are its precision,
 *   so the bare row goes.
 * - A category with a sub-list sent bare and alone: no precision excludes the
 *   whole category (story 4, criterion 14), so it is stored as « Tous ». One
 *   value for the whole category is what `eviction-safety` reads.
 * - « Autre » needs its text. No other box takes a text.
 */
const cleanSelections = (
  kind: AllergenKind,
  items: readonly AllergenSelection[],
): Result<CleanSelection[]> => {
  if (items.length === 0) {
    return err(
      "invalid_input",
      "declare at least one item, or answer « none known »",
    );
  }
  const keys = keysOf(kind);
  const seen = new Set<string>();
  const cleaned: CleanSelection[] = [];
  for (const item of items) {
    if (!keys.includes(item.key)) {
      return err("invalid_input", `"${item.key}" is not in the ${kind} list`);
    }
    const subKey = item.subKey ?? null;
    if (subKey !== null) {
      const subList = kind === "allergy" ? subListOf(item.key) : null;
      if (!subList || (subKey !== ALL_SUB_KEY && !subList.includes(subKey))) {
        return err(
          "invalid_input",
          `"${subKey}" is not in the sub-list of "${item.key}"`,
        );
      }
    }
    const identity = `${item.key}/${subKey ?? ""}`;
    if (seen.has(identity)) {
      return err("invalid_input", `"${identity}" is checked twice`);
    }
    seen.add(identity);

    const takesText =
      subKey === "other" || (item.key === "other" && subKey === null);
    const rawText = item.otherText ?? "";
    if (takesText) {
      const text = otherTextSchema.safeParse(rawText);
      if (!text.success) {
        return err("invalid_input", "« Autre » needs a text");
      }
      cleaned.push({ key: item.key, subKey, otherText: text.data });
    } else {
      if (rawText.trim() !== "") {
        return err("invalid_input", "only « Autre » takes a text");
      }
      cleaned.push({ key: item.key, subKey, otherText: null });
    }
  }

  const hasAll = new Set(
    cleaned.filter((s) => s.subKey === ALL_SUB_KEY).map((s) => s.key),
  );
  const hasSubs = new Set(
    cleaned.filter((s) => s.subKey !== null).map((s) => s.key),
  );
  return ok(
    cleaned
      .filter((s) => {
        if (hasAll.has(s.key)) {
          return s.subKey === ALL_SUB_KEY;
        }
        return !(s.subKey === null && hasSubs.has(s.key));
      })
      .map((s) =>
        s.subKey === null && kind === "allergy" && subListOf(s.key)
          ? { ...s, subKey: ALL_SUB_KEY }
          : s,
      ),
  );
};

/** Formats the first issue as the service's other answers do: `field: message`. */
const answerError = (error: z.ZodError) => {
  const issue = error.issues[0];
  const field = issue.path.join(".");
  return err(
    "invalid_input",
    field ? `${field}: ${issue.message}` : issue.message,
  );
};

/**
 * Checks a save without writing it. The console creates the profile and the
 * answers in one submit: it checks the answers first, so a refused answer never
 * leaves a half-created file behind.
 */
export const checkQuestionnaireInput = (
  input: QuestionnaireInput,
): Result<null> => {
  const parsed = answerSchema.safeParse(input);
  return parsed.success ? ok(null) : answerError(parsed.error);
};

/** Checks one list's answer without writing it, for the same reason. */
export const checkAllergenAnswer = (
  kind: string,
  answer: AllergenAnswer,
): Result<null> => {
  const parsedKind = kindSchema.safeParse(kind);
  if (!parsedKind.success) {
    return err("invalid_input", "that list does not exist");
  }
  if (answer.state !== "declared") {
    return ok(null);
  }
  const cleaned = cleanSelections(parsedKind.data, answer.items);
  return cleaned.ok ? ok(null) : cleaned;
};

/** The questionnaire's answers and the patient's checked boxes. */
const unscopedGetPatientQuestionnaire = async (
  patientId: Id,
): Promise<Result<PatientQuestionnaireView>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const row = await profiles().findById(patientId);
  if (!row) {
    return err("not_found", "no such patient");
  }
  const page = await allergenRows().findMany({ patientId }, { limit: 500 });
  return ok({
    answers: await visibleAnswers(row),
    allergens: [...page.items].sort(byRank),
  });
};

/**
 * Save any subset of the answers. A field the input does not name is left as
 * it is, which is what makes a save per change safe.
 *
 * A save that changes `consultationDate` writes one
 * `patient.consultation_date_changed` event with the old and the new value
 * (`appointment-date`). Every writer of the column passes here, so the console
 * and the patient's questionnaire get the same trail.
 */
const unscopedSavePatientQuestionnaire = async (
  patientId: Id,
  byThePatient: boolean,
  input: QuestionnaireInput,
  actor: AuditActor | null = null,
): Promise<Result<PatientQuestionnaire>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) {
    return answerError(parsed.error);
  }
  const patch: Partial<PatientQuestionnaire> = {};
  for (const [field, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      (patch as Record<string, unknown>)[field] = value;
    }
  }
  const current = (await profiles().findById(patientId)) as FileRow | null;
  if (!current) {
    return err("not_found", "no such patient");
  }
  const writesGenotype = genotypeFields.some(
    (field) => patch[field] !== undefined && patch[field] !== null,
  );
  if (writesGenotype && !(await consentInForce(patientId, "genetic"))) {
    return err("not_permitted", "the genotype needs the genetic consent");
  }
  const writesDesiredWeight =
    patch.desiredWeightKg !== undefined && patch.desiredWeightKg !== null;
  if (writesDesiredWeight && !(await consentInForce(patientId, "care"))) {
    return err("not_permitted", "the desired weight needs the care consent");
  }
  const written = await profiles().update(patientId, patch);
  if (!written) {
    return err("not_found", "no such patient");
  }
  await recordConsultationDateChange(current, patch, actor);
  if (byThePatient) {
    const fields = Object.keys(patch);
    await recordPatientChanges(
      current,
      valuesOf(current, fields),
      valuesOf(written, fields),
    );
  }
  return ok(await visibleAnswers(written));
};

/** One event when a save changes `consultationDate`. No event otherwise. */
const recordConsultationDateChange = async (
  // The pseudonym is on the same row. It labels the event, so the event
  // survives the file's deletion.
  before: QuestionnaireRow & Partial<Pick<PatientProfile, "pseudonym">>,
  patch: Partial<PatientQuestionnaire>,
  actor: AuditActor | null,
) => {
  if (patch.consultationDate === undefined) {
    return;
  }
  const previous = before.consultationDate ?? null;
  const next = patch.consultationDate;
  if (previous === next) {
    return;
  }
  await recordAuditEvent({
    actor,
    action: "patient.consultation_date_changed",
    targetType: "patient",
    targetId: before.id,
    targetLabel: before.pseudonym ?? "",
    detail: `${previous ?? "∅"} → ${next ?? "∅"}`,
  });
};

/**
 * The profile columns the questionnaire also asks: identity from sign-up,
 * taille, poids, médicaments and compléments. A floor only, like `weightKg`
 * above: `questionnaire-flow` owns the rules the patient sees (the sign-up's
 * identity rules, the plausible ranges).
 */
const profileAnswerSchema = z
  .object({
    // Identity came from sign-up, where each is required: never cleared here.
    firstName: z.string().trim().min(1, "required").max(100),
    lastName: z.string().trim().min(1, "required").max(100),
    birthDate: calendarDate,
    phone: z
      .string()
      .transform((value) => value.replace(/\s/g, ""))
      .pipe(
        z.string().regex(/^\+?\d{8,15}$/, "that phone number is not valid"),
      ),
    // The column is an integer.
    heightCm: z.union([z.null(), z.number().int().positive().max(300)]),
    weightKg: z.union([z.null(), weightKg]),
    // Not-null text columns: "" is « Non renseigné » there.
    medications: z.string().trim().max(5_000),
    supplements: z.string().trim().max(5_000),
  })
  .partial()
  .strict();

/** What `savePatientProfileAnswers` accepts: any subset of its fields. */
export type ProfileAnswerInput = z.input<typeof profileAnswerSchema>;

const careGatedProfileFields = ["medications", "supplements"] as const;

/**
 * The patient's own save of the profile columns the questionnaire asks.
 * A field the input does not name is left as it is.
 *
 * It keeps `fullName` equal to « prénom nom », and applies `updatePatient`'s
 * care-consent rule to médicaments and compléments. Unlike `updatePatient`, it
 * never moves `lastEditedAt`: that column means the practitioner worked on
 * the file, and sorts her roster.
 */
const unscopedSavePatientProfileAnswers = async (
  patientId: Id,
  byThePatient: boolean,
  input: ProfileAnswerInput,
): Promise<Result<PatientProfile>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const parsed = profileAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return answerError(parsed.error);
  }
  const rows = getDatabase().collection<PatientProfile>("patient_profiles");
  const current = await rows.findById(patientId);
  if (!current) {
    return err("not_found", "no such patient");
  }
  const patch: Partial<PatientProfile> = {};
  for (const [field, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      (patch as Record<string, unknown>)[field] = value;
    }
  }
  const writesCareData = careGatedProfileFields.some(
    (field) => patch[field] && patch[field] !== current[field],
  );
  if (writesCareData && !(await consentInForce(patientId, "care"))) {
    return err(
      "not_permitted",
      "the medications and the supplements need the care consent",
    );
  }
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const first = patch.firstName ?? current.firstName ?? "";
    const last = patch.lastName ?? current.lastName ?? "";
    patch.fullName = `${first} ${last}`.trim();
  }
  const written = await rows.update(patientId, patch);
  if (written && changesMeasures(current, patch)) {
    await refreshBmiEstimate(patientId);
  }
  if (written && byThePatient) {
    const fields = Object.keys(patch);
    await recordPatientChanges(
      current,
      valuesOf(current, fields),
      valuesOf(written, fields),
    );
  }
  return written ? ok(written) : err("not_found", "no such patient");
};

/**
 * Replace the patient's answer to one list — allergies or intolerances — in
 * one transaction: the rows of that kind and its « none known » flag together.
 *
 * - `none_known` deletes the rows and sets the flag to `true`.
 * - `declared` writes the boxes and sets the flag to `false`.
 * - `unanswered` deletes the rows and sets the flag to null.
 */
const unscopedSetPatientAllergens = async (
  patientId: Id,
  byThePatient: boolean,
  kind: string,
  answer: AllergenAnswer,
): Promise<Result<readonly PatientAllergen[]>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const parsedKind = kindSchema.safeParse(kind);
  if (!parsedKind.success) {
    return err("invalid_input", "that list does not exist");
  }
  const listKind = parsedKind.data;
  let selections: CleanSelection[] = [];
  if (answer.state === "declared") {
    const cleaned = cleanSelections(listKind, answer.items);
    if (!cleaned.ok) {
      return cleaned;
    }
    selections = cleaned.data;
  }
  const file = (await profiles().findById(patientId)) as FileRow | null;
  if (!file) {
    return err("not_found", "no such patient");
  }

  const flag =
    answer.state === "none_known"
      ? true
      : answer.state === "declared"
        ? false
        : null;
  const flagPatch: Partial<PatientQuestionnaire> =
    listKind === "allergy"
      ? { noKnownAllergies: flag }
      : { noKnownIntolerances: flag };

  let previous: readonly PatientAllergen[] = [];
  const written = await getDatabase().transaction(async (tx) => {
    const existing = await allergenRows(tx).findMany(
      { patientId, kind: listKind },
      { limit: 500 },
    );
    previous = existing.items;
    for (const row of existing.items) {
      await allergenRows(tx).remove(row.id);
    }
    const inserted: PatientAllergen[] = [];
    for (const selection of selections) {
      inserted.push(
        await allergenRows(tx).insert({
          patientId,
          kind: listKind,
          key: selection.key as PatientAllergen["key"],
          subKey: selection.subKey,
          otherText: selection.otherText,
        }),
      );
    }
    await profiles(tx).update(patientId, flagPatch);
    return inserted;
  });
  if (byThePatient) {
    const field = watchedFieldOfKind[listKind];
    await recordPatientChanges(
      file,
      { [field]: listValue(previous) },
      { [field]: listValue(written) },
    );
  }
  return ok(written.sort(byRank));
};

type CompletenessRow = PatientProfile & PatientQuestionnaire;

/**
 * The mandatory fields this file still misses, in the list's order (story 4,
 * `shared/questionnaire.ts`). Taille and poids live on the profile, the rest
 * on the questionnaire's columns and rows.
 */
const unscopedMissingQuestionnaireFields = async (
  patientId: Id,
): Promise<Result<MandatoryQuestionnaireField[]>> => {
  if (!isValidId(patientId)) {
    return err("not_found", "no such patient");
  }
  const row = await getDatabase()
    .collection<CompletenessRow>("patient_profiles")
    .findById(patientId);
  if (!row) {
    return err("not_found", "no such patient");
  }
  const page = await allergenRows().findMany({ patientId }, { limit: 500 });
  const countOf = (kind: AllergenKind) =>
    page.items.filter((item) => item.kind === kind).length;
  return ok(
    missingMandatoryFields({
      sexForCalculation: row.sexForCalculation ?? null,
      heightCm: row.heightCm ?? null,
      weightKg: row.weightKg ?? null,
      activityLevel: row.activityLevel ?? null,
      consultationReason: row.consultationReason ?? null,
      noKnownAllergies: row.noKnownAllergies ?? null,
      noKnownIntolerances: row.noKnownIntolerances ?? null,
      allergyCount: countOf("allergy"),
      intoleranceCount: countOf("intolerance"),
    }),
  );
};

/**
 * Moves a file from « Dossier à compléter » to « Prêt pour consultation » once
 * its last mandatory field is saved (story 4 criterion 8, story 5). It does
 * nothing while a field is missing, and nothing for a file past
 * `to_complete`: a field cleared later never moves a file back (D-31).
 * Answers the file's status after the call.
 */
const unscopedMarkReadyWhenComplete = async (
  patientId: Id,
  actor: AuditActor | null,
): Promise<Result<PatientProfile["fileStatus"]>> => {
  const missing = await unscopedMissingQuestionnaireFields(patientId);
  if (!missing.ok) {
    return missing;
  }
  const row = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!row) {
    return err("not_found", "no such patient");
  }
  if (row.fileStatus !== "to_complete" || missing.data.length > 0) {
    return ok(row.fileStatus);
  }
  const moved = await setFileStatus(
    systemActor,
    patientId,
    "ready",
    actor,
    "every mandatory field is filled",
  );
  return moved.ok ? ok(moved.data.fileStatus) : moved;
};

/**
 * The scoped surface (story 3, D-27). Each service takes the actor first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file.
 */
export const getPatientQuestionnaire = byPatient(
  "read",
  unscopedGetPatientQuestionnaire,
  noSuchPatient,
);
export const savePatientQuestionnaire = byPatientWrite(
  unscopedSavePatientQuestionnaire,
  noSuchPatient,
);
export const savePatientProfileAnswers = byPatientWrite(
  unscopedSavePatientProfileAnswers,
  noSuchPatient,
);
export const setPatientAllergens = byPatientWrite(
  unscopedSetPatientAllergens,
  noSuchPatient,
);
export const missingQuestionnaireFields = byPatient(
  "read",
  unscopedMissingQuestionnaireFields,
  noSuchPatient,
);
export const markReadyWhenComplete = byPatient(
  "write",
  unscopedMarkReadyWhenComplete,
  noSuchPatient,
);
