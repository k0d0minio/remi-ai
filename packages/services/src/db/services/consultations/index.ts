import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { PatientGoalCheckIn } from "../../models/patient-goal-check-in";
import type { PatientNote } from "../../models/patient-note";
import {
  addGoalCheckIn,
  listPatientGoals,
  type GoalCheckInInput,
} from "../patient-goals";
import {
  getPatientInstruction,
  setPatientInstruction,
} from "../patient-instructions";
import { addPatientNote } from "../patient-notes";
import { getPatientSummary, setPatientSummary } from "../patient-summaries";
import { getPatient, setPatientNextConsultationPrep } from "../patients";

/**
 * Writing up a consultation — the five edits Morgane used to make in five
 * places, as one unit.
 *
 * It composes the existing services rather than reimplementing them: each one
 * already owns its own validation and its own "saving the same words changes
 * nothing" rule, and a second copy of either here would be the copy that drifts.
 * What this adds is the transaction they run in and the account of what changed,
 * which is what lets the console record one audit event instead of five.
 *
 * A failure anywhere rolls the whole thing back. The `Result` a service returns
 * cannot do that on its own — a returned value is not a failed transaction — so
 * the first failure is thrown as `RollbackSignal`, unwound by the driver, and
 * turned back into the `Result` the caller reads.
 */

export type ConsultationNoteInput = {
  /** `YYYY-MM-DD` — the day of the consultation, and of its check-ins. */
  occurredAt: string;
  title?: string;
  body?: string;
  authorName?: string;
};

export type ConsultationCheckInInput = {
  goalId: Id;
  direction?: string | null;
  measure?: string;
  note?: string;
};

/**
 * An absent field was not on the form; a present one is what she submitted,
 * empty string included — that is how the consigne and the summary are cleared.
 */
export type ConsultationInput = {
  note: ConsultationNoteInput;
  checkIns?: readonly ConsultationCheckInInput[];
  instruction?: string;
  summary?: string;
  nextConsultationPrep?: string;
};

/** What the save actually wrote — the audit event's detail is built from this. */
export type ConsultationRecord = {
  note: PatientNote;
  checkIns: readonly PatientGoalCheckIn[];
  instructionChanged: boolean;
  summaryChanged: boolean;
  prepChanged: boolean;
};

class RollbackSignal extends Error {
  constructor(readonly failure: Result<never>) {
    super("consultation rolled back");
    this.name = "RollbackSignal";
  }
}

/** Unwrap or abandon the transaction — the only way out of a half-written save. */
const orRollback = <T>(result: Result<T>): T => {
  if (!result.ok) {
    throw new RollbackSignal(result);
  }
  return result.data;
};

/** A check-in with nothing in any of its three fields records nothing. */
const saysSomething = (entry: ConsultationCheckInInput) =>
  (entry.direction ?? "") !== "" ||
  (entry.measure ?? "").trim() !== "" ||
  (entry.note ?? "").trim() !== "";

export const recordConsultation = async (
  patientId: Id,
  input: ConsultationInput,
): Promise<Result<ConsultationRecord>> => {
  const patient = await getPatient(patientId);
  if (!patient.ok) {
    return patient;
  }

  // The goal ids arrive from the form, so they are checked against this
  // patient's own goals before anything is written. `addGoalCheckIn` resolves a
  // goal by id alone; without this, a tampered form could hang a check-in off
  // another patient's goal while the single audit row named this one.
  const ownGoals = new Set(
    (await listPatientGoals(patientId)).map((goal) => goal.id),
  );
  const submitted = (input.checkIns ?? []).filter(saysSomething);
  if (submitted.some((entry) => !ownGoals.has(entry.goalId))) {
    return err("not_found", "no such goal for this patient");
  }

  try {
    return ok(
      await getDatabase().transaction(async (tx) => {
        // The note first: it is the one thing on this screen with no other
        // home, so a failure below never costs what she typed.
        const note = orRollback(
          await addPatientNote(patientId, input.note, tx),
        );

        const checkIns: PatientGoalCheckIn[] = [];
        for (const entry of submitted) {
          const checkIn: GoalCheckInInput = {
            checkedOn: input.note.occurredAt,
            direction: entry.direction ?? null,
            measure: entry.measure ?? "",
            note: entry.note ?? "",
          };
          checkIns.push(
            orRollback(await addGoalCheckIn(entry.goalId, checkIn, tx)),
          );
        }

        let instructionChanged = false;
        if (input.instruction !== undefined) {
          const before = await getPatientInstruction(patientId, tx);
          const after = orRollback(
            await setPatientInstruction(patientId, input.instruction, tx),
          );
          instructionChanged = (after?.id ?? null) !== (before?.id ?? null);
        }

        let summaryChanged = false;
        if (input.summary !== undefined) {
          const before = await getPatientSummary(patientId, tx);
          const after = orRollback(
            await setPatientSummary(patientId, input.summary, tx),
          );
          summaryChanged = (after?.body ?? null) !== (before?.body ?? null);
        }

        let prepChanged = false;
        if (input.nextConsultationPrep !== undefined) {
          const before = patient.data.nextConsultationPrep;
          const after = orRollback(
            await setPatientNextConsultationPrep(
              patientId,
              input.nextConsultationPrep,
              tx,
            ),
          );
          prepChanged = after.nextConsultationPrep !== before;
        }

        return {
          note,
          checkIns,
          instructionChanged,
          summaryChanged,
          prepChanged,
        };
      }),
    );
  } catch (cause) {
    if (cause instanceof RollbackSignal) {
      return cause.failure;
    }
    throw cause;
  }
};

/** The audit detail: what changed, in counts and field names — never content. */
export const describeConsultation = (record: ConsultationRecord): string => {
  const parts = ["note"];
  if (record.checkIns.length > 0) {
    parts.push(`${record.checkIns.length} check-in(s)`);
  }
  if (record.instructionChanged) {
    parts.push("instruction");
  }
  if (record.summaryChanged) {
    parts.push("summary");
  }
  if (record.prepChanged) {
    parts.push("next consultation prep");
  }
  return parts.join(", ");
};
