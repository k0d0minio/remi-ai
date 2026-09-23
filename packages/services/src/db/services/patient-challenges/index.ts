import { z } from "zod";
import { todayAtPractice } from "../../../shared/format";
import { challengeOutcomes } from "../../../shared/patient";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type {
  ChallengeOutcome,
  PatientChallenge,
} from "../../models/patient-challenge";
import { touchPatient } from "../patients";

/**
 * The one habit Morgane runs with a patient at a time — her 14 Sept document,
 * § 2 — and the patient's two answers to it.
 *
 * Three rules live here, and the first is also the schema's:
 *
 * - **One open challenge per patient** (D-25). The partial unique index holds
 *   it under concurrency; this service holds it everywhere else, including the
 *   in-memory client the tests run on, and turns it into a refusal a form can
 *   render rather than a constraint violation.
 * - **The taps are sequential** (D-26): « Prêt(e) pour le prochain » needs
 *   « Challenge acquis », and clearing the second clears the first's follower.
 * - **A closed challenge is frozen.** Nothing edits it and no tap reaches it,
 *   so the past list shows what was true the day she closed it.
 */

const challenges = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientChallenge>("patient_challenges");

const uuidSchema = z.uuid();

/** A day, not an instant — and never later than today at the practice. */
const startedOnSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "a start date is required")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
    "that date is not valid",
  )
  .refine(
    (value) => value <= todayAtPractice(),
    "a challenge cannot start in the future",
  );

const challengeFields = z.object({
  text: z.string().trim().min(1, "a challenge is required").max(200),
  why: z.string().trim().max(2000),
  startedOn: startedOnSchema,
});

export type ChallengeInput = z.input<typeof challengeFields>;

const outcomeSchema = z.enum(challengeOutcomes);

/**
 * Every row for one patient. A patient accumulates one challenge every week or
 * two, so a year is a few dozen rows and one page holds them all.
 */
const allForPatient = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<readonly PatientChallenge[]> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return [];
  }
  const page = await challenges(db).findMany({ patientId }, { limit: 500 });
  return page.items;
};

/** The challenge in force, or `null` when she has none running. */
export const getCurrentChallenge = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<PatientChallenge | null> =>
  (await allForPatient(patientId, db)).find(
    (challenge) => challenge.closedOn === null,
  ) ?? null;

/** What has been closed, most recently closed first. */
export const listPastChallenges = async (
  patientId: Id,
): Promise<readonly PatientChallenge[]> =>
  (await allForPatient(patientId))
    .filter((challenge) => challenge.closedOn !== null)
    .sort((a, b) => {
      const byClose = (b.closedOn ?? "").localeCompare(a.closedOn ?? "");
      return byClose !== 0
        ? byClose
        : b.updatedAt.getTime() - a.updatedAt.getTime();
    });

/**
 * What the roster shows beside a patient: the strongest thing the current
 * challenge says. « Prêt(e) pour le prochain » outranks « acquis » because it
 * is the one that asks her to act.
 */
export type ChallengeSignal = "ready_for_next" | "acquired";

export const challengeSignalOf = (
  challenge: PatientChallenge | null,
): ChallengeSignal | null => {
  if (!challenge || challenge.closedOn !== null) {
    return null;
  }
  if (challenge.readyForNextAt) {
    return "ready_for_next";
  }
  return challenge.acquiredAt ? "acquired" : null;
};

/**
 * Every patient's signal in one pass, for the roster. Paged rather than one
 * read per patient: the list shows up to two hundred people, and two hundred
 * queries to draw one page is the shape that gets slow first.
 *
 * The filter on open rows is done here rather than in the query: the seam's
 * filter is equality, and `closed_on = null` matches nothing in SQL.
 */
export const listChallengeSignals = async (): Promise<
  ReadonlyMap<Id, ChallengeSignal>
> => {
  const signals = new Map<Id, ChallengeSignal>();
  let cursor: string | undefined;
  do {
    const page = await challenges().findMany({}, { limit: 500, cursor });
    for (const challenge of page.items) {
      const signal = challengeSignalOf(challenge);
      if (signal) {
        signals.set(challenge.patientId, signal);
      }
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return signals;
};

/** Whose challenge is this? The link's ownership check reads it. */
export const challengeOwner = async (id: Id): Promise<Id | null> => {
  if (!uuidSchema.safeParse(id).success) {
    return null;
  }
  return (await challenges().findById(id))?.patientId ?? null;
};

/** The open row by id, or `not_found` — a closed one is not a target. */
const openChallenge = async (
  id: Id,
  db?: DatabaseClient,
): Promise<Result<PatientChallenge>> => {
  if (!uuidSchema.safeParse(id).success) {
    return err("not_found", "no such challenge");
  }
  const existing = await challenges(db).findById(id);
  if (!existing || existing.closedOn !== null) {
    return err("not_found", "no such open challenge");
  }
  return ok(existing);
};

export type StartedChallenge = {
  created: PatientChallenge;
  /** The one it replaced, now closed — `null` when there was none. */
  closed: PatientChallenge | null;
};

/**
 * Open a challenge. When one is already running, `closeCurrentWith` is the
 * outcome she picked for it in the same form, and the close and the create
 * happen in one transaction: the patient is never left with none, and never
 * with two. Without an outcome, a running challenge is a refusal — the form
 * always sends one, so reaching it means the page was stale.
 */
export const startChallenge = async (
  patientId: Id,
  input: ChallengeInput,
  closeCurrentWith?: ChallengeOutcome,
): Promise<Result<StartedChallenge>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return err("not_found", "no such patient");
  }
  const parsed = challengeFields.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  if (
    closeCurrentWith !== undefined &&
    !outcomeSchema.safeParse(closeCurrentWith).success
  ) {
    return err("invalid_input", "that outcome is not one of hers");
  }

  const current = await getCurrentChallenge(patientId);
  if (current && closeCurrentWith === undefined) {
    return err(
      "conflict",
      "a challenge is already running — pick its outcome to replace it",
    );
  }

  // Everything that can refuse has refused by now, so a throw below is a
  // failure of the database, and the transaction takes both halves with it.
  const started = await getDatabase().transaction(async (tx) => {
    const closed = current
      ? await challenges(tx).update(current.id, {
          closedOn: todayAtPractice(),
          outcome: closeCurrentWith ?? null,
        })
      : null;
    const created = await challenges(tx).insert({
      patientId,
      text: parsed.data.text,
      why: parsed.data.why,
      startedOn: parsed.data.startedOn,
      closedOn: null,
      outcome: null,
      acquiredAt: null,
      readyForNextAt: null,
    });
    await touchPatient(patientId, tx);
    return { created, closed };
  });
  return ok(started);
};

/** Edit the running challenge's words or start date. A closed one is frozen. */
export const updateChallenge = async (
  id: Id,
  input: ChallengeInput,
): Promise<Result<PatientChallenge>> => {
  const existing = await openChallenge(id);
  if (!existing.ok) {
    return existing;
  }
  const parsed = challengeFields.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const updated = await challenges().update(id, parsed.data);
  if (!updated) {
    return err("not_found", "no such challenge");
  }
  await touchPatient(existing.data.patientId);
  return ok(updated);
};

/** Close the running challenge with the outcome she picked. */
export const closeChallenge = async (
  id: Id,
  outcome: ChallengeOutcome,
): Promise<Result<PatientChallenge>> => {
  if (!outcomeSchema.safeParse(outcome).success) {
    return err("invalid_input", "that outcome is not one of hers");
  }
  const existing = await openChallenge(id);
  if (!existing.ok) {
    return existing;
  }
  const updated = await challenges().update(id, {
    closedOn: todayAtPractice(),
    outcome,
  });
  if (!updated) {
    return err("not_found", "no such challenge");
  }
  await touchPatient(existing.data.patientId);
  return ok(updated);
};

/**
 * « Challenge acquis », set or cleared by the patient. The caller posts the
 * state it wants rather than "toggle", so a double submit lands where the
 * patient meant instead of flipping twice. Clearing it clears « Prêt(e) pour
 * le prochain » with it: ready for the next one is only true of an acquired
 * habit.
 */
export const setChallengeAcquired = async (
  id: Id,
  acquired: boolean,
): Promise<Result<PatientChallenge>> => {
  const existing = await openChallenge(id);
  if (!existing.ok) {
    return existing;
  }
  const updated = await challenges().update(
    id,
    acquired
      ? { acquiredAt: existing.data.acquiredAt ?? new Date() }
      : { acquiredAt: null, readyForNextAt: null },
  );
  return updated ? ok(updated) : err("not_found", "no such challenge");
};

/**
 * « Prêt(e) pour le prochain », set or cleared by the patient. Refused until
 * « Challenge acquis » is set — the link only offers it then, so reaching the
 * refusal means a page older than the patient's own last tap.
 */
export const setChallengeReadyForNext = async (
  id: Id,
  ready: boolean,
): Promise<Result<PatientChallenge>> => {
  const existing = await openChallenge(id);
  if (!existing.ok) {
    return existing;
  }
  if (ready && existing.data.acquiredAt === null) {
    return err("conflict", "a challenge is ready for the next once acquired");
  }
  const updated = await challenges().update(id, {
    readyForNextAt: ready ? (existing.data.readyForNextAt ?? new Date()) : null,
  });
  return updated ? ok(updated) : err("not_found", "no such challenge");
};
