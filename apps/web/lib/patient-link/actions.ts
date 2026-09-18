"use server";

import { z } from "zod";
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

const logSchema = z.object({
  token: z.string().min(1),
  locale: z.string(),
  intent: z.enum(mealIntents),
  description: z.string().trim().min(1).max(2000),
  /** The chip posts `""` for « Aucun », which is a real answer, not a gap. */
  slot: z.union([z.enum(mealSlots), z.literal("")]),
});

const eatenSchema = z.object({
  token: z.string().min(1),
  locale: z.string(),
  id: z.uuid(),
});

/** « Je vais manger » / « J'ai mangé » — one row, written as the patient. */
export const logMealAction = async (
  _previous: WriteState,
  formData: FormData,
): Promise<WriteState> => {
  const parsed = logSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "invalid_input" };
  }
  const { token, locale, intent, description, slot } = parsed.data;
  if (!isLocale(locale)) {
    return { error: "invalid_input" };
  }

  const result = await writePatientLink(locale, token, {
    action: "meal.logged",
    // Declared by length class, so the ceiling applies to what is actually
    // written rather than to whatever this endpoint remembered to mention.
    text: { bodies: [description], shorts: [slot] },
    target: { type: "meal_entry" },
    write: async (patient) =>
      addMealEntry(
        patient.id,
        {
          // The day the patient is in, not the day the server is in.
          eatenOn: todayAtPractice(),
          slot: slot === "" ? null : slot,
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
  const parsed = eatenSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "invalid_input" };
  }
  const { token, locale, id } = parsed.data;
  if (!isLocale(locale)) {
    return { error: "invalid_input" };
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
