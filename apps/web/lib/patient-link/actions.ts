"use server";

import {
  addMealEntry,
  markMealEntryEaten,
  mealEntryOwner,
} from "@remi/services/server";
import {
  isLocale,
  mealIntents,
  mealSlots,
  todayAtPractice,
  type MealIntent,
  type MealSlot,
  type ServiceErrorCode,
} from "@remi/services/shared";
import { writePatientLink } from "@/lib/patient-link/write";

/**
 * The patient link's write endpoints — the first of them, and the shape the
 * rest of `patient-loop` follows.
 *
 * Everything a form posts is untrusted, the token included: it arrives in a
 * hidden field because a server action has no route params, and it is the only
 * thing that says whose record this is. It is never trusted on its own —
 * `writePatientLink` resolves it exactly as the loader does, checks the
 * ceilings, and refuses a write naming a row the token does not own.
 *
 * Nothing here re-validates what the services layer already validates — the
 * description's length, a meal id's shape, whether the token resolves. Those
 * are the journal's rules, and asserting them a second time up here is how two
 * validators drift into disagreeing.
 *
 * What it does own is the turn from posted strings into the vocabulary the
 * journal is written in. That is a type-boundary job rather than a second
 * opinion: `FormData` hands back `string`, and the alternative to naming the
 * two closed sets here is a cast, which asserts the same thing while checking
 * nothing. The intent earns it twice over — it arrives from whichever button
 * was pressed rather than from a field, so an absent one has to be refused
 * rather than defaulted into the wrong sentence.
 *
 * What comes back is an error *key*, never a service message. The services
 * layer speaks English to developers; the patient reads their own language, so
 * the dictionary owns the wording and this file only says which sentence.
 */
export type WriteState = { error: PatientWriteError | null };

/**
 * The failures a patient can actually reach, collapsed to what each one should
 * make them do: fix the text, wait, or reload.
 *
 * `not_permitted`, `conflict` and `upstream_failed` are real service codes that
 * no path here produces; naming them anyway would put three unreachable
 * sentences in both dictionaries, so they fall through to `unknown` until
 * something can raise one.
 */
export type PatientWriteError =
  "invalid_input" | "rate_limited" | "not_found" | "unknown";

const written: WriteState = { error: null };
const refused: WriteState = { error: "invalid_input" };

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const asPatientError = (code: ServiceErrorCode): PatientWriteError => {
  switch (code) {
    case "invalid_input":
    case "rate_limited":
    case "not_found":
      return code;
    default:
      return "unknown";
  }
};

const asIntent = (value: string): MealIntent | null =>
  (mealIntents as readonly string[]).includes(value)
    ? (value as MealIntent)
    : null;

/**
 * `""` is the « Aucun » chip — a real answer, and the journal's own way of
 * saying an entry has no moment. Anything else outside the vocabulary is a
 * post nothing on the page can produce, so it is refused rather than quietly
 * saved as a meal with no moment.
 */
const asSlot = (value: string): MealSlot | null | undefined => {
  if (value === "") {
    return null;
  }
  return (mealSlots as readonly string[]).includes(value)
    ? (value as MealSlot)
    : undefined;
};

/** « Je vais manger » / « J'ai mangé » — one row, written as the patient. */
export const logMealAction = async (
  _previous: WriteState,
  formData: FormData,
): Promise<WriteState> => {
  const token = field(formData, "token");
  const locale = field(formData, "locale");
  const description = field(formData, "description");
  const posted = field(formData, "slot");
  const slot = asSlot(posted);
  const intent = asIntent(field(formData, "intent"));

  if (!isLocale(locale) || intent === null || slot === undefined) {
    return refused;
  }

  const result = await writePatientLink(locale, token, {
    action: "meal.logged",
    // Declared by length class, so the ceiling applies to what is actually
    // written rather than to whatever this endpoint remembered to mention.
    text: { bodies: [description], shorts: [posted] },
    target: { type: "meal_entry" },
    write: async (patient) =>
      addMealEntry(
        patient.id,
        {
          // The day the patient is in, not the day the server is in.
          eatenOn: todayAtPractice(),
          slot,
          description,
          intent,
        },
        "patient",
      ),
  });

  return result.ok ? written : { error: asPatientError(result.error) };
};

/** « Je l'ai mangé » — the planned row moves on rather than a second one. */
export const markMealEatenAction = async (
  _previous: WriteState,
  formData: FormData,
): Promise<WriteState> => {
  const token = field(formData, "token");
  const locale = field(formData, "locale");
  const id = field(formData, "id");

  if (!isLocale(locale)) {
    return refused;
  }

  const result = await writePatientLink(locale, token, {
    action: "meal.updated",
    text: {},
    // Naming an existing row is what makes `ownerOf` mandatory: a meal id is a
    // plain uuid that travels — a screenshot, a pasted link — and without this
    // check a patient posting someone else's id would write into their record.
    target: { type: "meal_entry", id, ownerOf: mealEntryOwner },
    write: async () => markMealEntryEaten(id),
  });

  return result.ok ? written : { error: asPatientError(result.error) };
};
