"use server";

import {
  getPatient,
  markReadyWhenComplete,
  missingQuestionnaireFields,
  savePatientProfileAnswers,
  savePatientQuestionnaire,
  setPatientAllergens,
  validateSignup,
  type AllergenAnswer,
  type AllergenSelection,
  type ProfileAnswerInput,
  type QuestionnaireInput,
} from "@remi/services/server";
import { allergenKinds, type Result } from "@remi/services/shared";
import { currentPatient } from "@/lib/patient-auth/session";
import {
  answerFields,
  type AnswerField,
  type SaveError,
  type SaveResult,
} from "./state";

/**
 * The questionnaire's saves (story 4, `questionnaire-flow`). Each one is a
 * public endpoint: the field, the value and the list are caller input, and the
 * patient's id comes from the session, never from the page. After each write
 * the file moves to « Prêt pour consultation » when nothing mandatory is
 * missing (`markReadyWhenComplete`).
 */

const failed = (error: SaveError): SaveResult => ({ ok: false, error });

const fromService = (result: Result<unknown>): SaveResult | null => {
  if (result.ok) {
    return null;
  }
  if (result.error === "not_permitted") {
    return failed("consent");
  }
  return failed(result.error === "invalid_input" ? "invalid" : "unavailable");
};

/** Story 4: taille 100 to 250 cm, whole centimetres (the column is an integer). */
const heightOf = (value: string): number | null | SaveError => {
  if (value === "") {
    return null;
  }
  if (!/^\d{3}$/.test(value)) {
    return "height_range";
  }
  const cm = Number(value);
  return cm >= 100 && cm <= 250 ? cm : "height_range";
};

/** Story 4: poids 25 to 300 kg, one decimal, with a comma or a point. */
const weightOf = (value: string): number | null | SaveError => {
  if (value === "") {
    return null;
  }
  if (!/^\d{2,3}([.,]\d)?$/.test(value)) {
    return "weight_range";
  }
  const kg = Number(value.replace(",", "."));
  return kg >= 25 && kg <= 300 ? kg : "weight_range";
};

const identityFields = ["firstName", "lastName", "birthDate", "phone"] as const;

type IdentityField = (typeof identityFields)[number];

const isIdentityField = (field: string): field is IdentityField =>
  (identityFields as readonly string[]).includes(field);

/** Writes one answer. Null when it was written, the failure otherwise. */
const writeAnswer = async (
  patientId: string,
  field: AnswerField,
  value: string,
): Promise<SaveResult | null> => {
  if (isIdentityField(field)) {
    // The sign-up's own rules, so an identity reads the same wherever typed.
    const checked = validateSignup({ [field]: value });
    const code = checked.ok ? undefined : checked.fields[field];
    if (code) {
      return failed(code === "required" ? "required" : "invalid");
    }
    return fromService(
      await savePatientProfileAnswers(patientId, {
        [field]: value,
      } as ProfileAnswerInput),
    );
  }
  if (field === "heightCm") {
    const heightCm = heightOf(value);
    return typeof heightCm === "string"
      ? failed(heightCm)
      : fromService(await savePatientProfileAnswers(patientId, { heightCm }));
  }
  if (field === "weightKg" || field === "desiredWeightKg") {
    const kg = weightOf(value);
    if (typeof kg === "string") {
      return failed(kg);
    }
    return fromService(
      field === "weightKg"
        ? await savePatientProfileAnswers(patientId, { weightKg: kg })
        : await savePatientQuestionnaire(patientId, { desiredWeightKg: kg }),
    );
  }
  if (field === "medications" || field === "supplements") {
    return fromService(
      await savePatientProfileAnswers(patientId, {
        [field]: value,
      } as ProfileAnswerInput),
    );
  }
  // « Maladie cœliaque » is a tick or an untick. An untouched box sends nothing.
  if (field === "celiacDisease") {
    if (value !== "true" && value !== "false") {
      return failed("invalid");
    }
    return fromService(
      await savePatientQuestionnaire(patientId, {
        celiacDisease: value === "true",
      }),
    );
  }
  // A diet other than « Autre » drops the note that described « Autre ».
  const input: QuestionnaireInput =
    field === "diet" && value !== "other"
      ? { diet: value as QuestionnaireInput["diet"], dietNote: null }
      : ({ [field]: value } as QuestionnaireInput);
  return fromService(await savePatientQuestionnaire(patientId, input));
};

/** The file's status and the missing fields after a write. */
const settle = async (patientId: string): Promise<SaveResult> => {
  const patient = await getPatient(patientId);
  if (!patient.ok) {
    return failed("unavailable");
  }
  const status = await markReadyWhenComplete(patientId, {
    kind: "patient",
    id: patientId,
    name: patient.data.pseudonym,
  });
  const missing = await missingQuestionnaireFields(patientId);
  if (!status.ok || !missing.ok) {
    return failed("unavailable");
  }
  return { ok: true, status: status.data, missing: missing.data };
};

const isAnswerField = (
  field: unknown,
): field is AnswerField =>
  typeof field === "string" &&
  (answerFields as readonly string[]).includes(field);

/** Saves one answer of the questionnaire. `""` clears it. */
export const saveAnswerAction = async (
  field: string,
  value: string,
): Promise<SaveResult> => {
  if (
    !isAnswerField(field) ||
    typeof value !== "string" ||
    value.length > 5_000
  ) {
    return failed("invalid");
  }
  const account = await currentPatient();
  if (!account) {
    return failed("signed_out");
  }
  const patientId = account.patientProfileId;
  const refused = await writeAnswer(patientId, field, value.trim());
  return refused ?? settle(patientId);
};

const isKind = (kind: unknown): kind is (typeof allergenKinds)[number] =>
  typeof kind === "string" &&
  (allergenKinds as readonly string[]).includes(kind);

const shortText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length <= max;

/**
 * Rebuilds the answer from caller input, keeping only the shape the service
 * takes. The service checks every key against its lists.
 */
const allergenAnswerOf = (answer: unknown): AllergenAnswer | null => {
  if (typeof answer !== "object" || answer === null) {
    return null;
  }
  const { state, items } = answer as { state?: unknown; items?: unknown };
  if (state === "unanswered" || state === "none_known") {
    return { state };
  }
  if (state !== "declared" || !Array.isArray(items) || items.length > 100) {
    return null;
  }
  const selections: AllergenSelection[] = [];
  for (const item of items as unknown[]) {
    const { key, subKey, otherText } = (item ?? {}) as Record<string, unknown>;
    if (
      !shortText(key, 40) ||
      !(subKey === null || shortText(subKey, 40)) ||
      !(otherText === null || shortText(otherText, 2_000))
    ) {
      return null;
    }
    selections.push({ key, subKey, otherText });
  }
  return { state, items: selections };
};

/**
 * Saves the patient's whole answer to one list: no answer, « Aucune … connue »,
 * or the boxes they checked.
 */
export const saveAllergensAction = async (
  kind: string,
  answer: unknown,
): Promise<SaveResult> => {
  const parsed = allergenAnswerOf(answer);
  if (!isKind(kind) || !parsed) {
    return failed("invalid");
  }
  const account = await currentPatient();
  if (!account) {
    return failed("signed_out");
  }
  const patientId = account.patientProfileId;
  const refused = fromService(
    await setPatientAllergens(patientId, kind, parsed),
  );
  return refused ?? settle(patientId);
};
