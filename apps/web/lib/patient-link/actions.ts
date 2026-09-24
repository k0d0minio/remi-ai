"use server";

import {
  addMealEntry,
  challengeOwner,
  markMealEntryEaten,
  mealEntryOwner,
  recordWeeklyCheckIn,
  setChallengeAcquired,
  setChallengeReadyForNext,
  type WeeklyAnswer,
} from "@remi/services/server";
import {
  goalScores,
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

/**
 * « Challenge acquis » and « Prêt(e) pour le prochain » — one endpoint for
 * both taps, because they are one row and one rule: the service owns the order
 * between them and the clearing cascade, so this only says which tap and which
 * way.
 *
 * The form posts the state it wants (`on` = "true" | "false") rather than
 * "toggle": a double tap then lands where the patient meant instead of
 * flipping twice, and a page older than the row cannot flip the wrong way.
 */
export const tapChallengeAction = async (
  _previous: WriteState,
  formData: FormData,
): Promise<WriteState> => {
  const token = field(formData, "token");
  const locale = field(formData, "locale");
  const id = field(formData, "id");
  const tap = field(formData, "tap");
  const on = field(formData, "on");

  if (
    !isLocale(locale) ||
    (tap !== "acquired" && tap !== "ready_for_next") ||
    (on !== "true" && on !== "false")
  ) {
    return refused;
  }
  const set = on === "true";

  const result = await writePatientLink(locale, token, {
    action:
      tap === "acquired"
        ? set
          ? "challenge.acquired"
          : "challenge.acquired_cleared"
        : set
          ? "challenge.ready_for_next"
          : "challenge.ready_for_next_cleared",
    text: {},
    // A challenge id is a plain uuid that travels like a meal id does; naming
    // it makes the ownership check mandatory.
    target: { type: "patient_challenge", id, ownerOf: challengeOwner },
    write: async () =>
      tap === "acquired"
        ? setChallengeAcquired(id, set)
        : setChallengeReadyForNext(id, set),
  });

  if (result.ok) {
    return written;
  }
  // « Prêt(e) » refused because « acquis » was cleared elsewhere is a stale
  // page, not a transient failure: « réessayez » would fail every time, so it
  // reads as the challenge having changed — reload.
  return {
    error:
      result.error === "conflict" ? "not_found" : asPatientError(result.error),
  };
};

/**
 * The weekly « comment ça s'est passé ? » — her 0–5 per goal (D-30, D-31), one
 * submit for every goal on the card.
 *
 * The form names its goals in hidden `goal` fields and posts `score-<id>` and
 * `note-<id>` beside each. A goal id is a plain uuid like a meal's, but no
 * `target.id` is named here: the write can span three goals, and the service
 * checks every one against the patient the token resolved before it writes any
 * row — the same guarantee, held where the rows are.
 *
 * A score that is posted but not one of 0–5 is refused rather than dropped:
 * nothing on the card can produce one. An absent score is an unrated goal.
 */
export const weeklyCheckInAction = async (
  _previous: WriteState,
  formData: FormData,
): Promise<WriteState> => {
  const token = field(formData, "token");
  const locale = field(formData, "locale");
  if (!isLocale(locale)) {
    return refused;
  }

  const answers: WeeklyAnswer[] = [];
  for (const goalId of formData.getAll("goal").map(String)) {
    const posted = field(formData, `score-${goalId}`);
    const score = posted === "" ? null : Number(posted);
    if (score !== null && !(goalScores as readonly number[]).includes(score)) {
      return refused;
    }
    answers.push({ goalId, score, note: field(formData, `note-${goalId}`) });
  }

  const result = await writePatientLink(locale, token, {
    action: "goal.checked_in",
    text: { bodies: answers.map((answer) => answer.note ?? "") },
    target: { type: "patient_goal_check_in" },
    write: async (patient) => recordWeeklyCheckIn(patient.id, answers),
  });

  if (result.ok) {
    return written;
  }
  // Already answered this week — a second tab, or a page left open across the
  // first submit. Retrying would fail every time; reloading shows the answer.
  return {
    error:
      result.error === "conflict" ? "not_found" : asPatientError(result.error),
  };
};
