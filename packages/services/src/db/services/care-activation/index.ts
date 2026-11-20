import { z } from "zod";
import {
  activationRecap,
  canActivate,
  careActivationReason,
  type ActivationRecap,
} from "../../../shared/care-activation";
import { initialFileStatus } from "../../../shared/file-status";
import { err, ok, type Result } from "../../../shared/result";
import { safetyList } from "../../../shared/safety-highlights";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, noSuchPatient, systemActor } from "../access";
import type { OperatorActor } from "../audit";
import { markPatientAccountActivated } from "../patient-accounts";
import { listPatientCalculations } from "../patient-calculations";
import { getPatientQuestionnaire } from "../patient-questionnaire";
import { setFileStatus } from "../patients";
import { getValidatedProtocol } from "../protocol-versions";
import { listActivationDirectives } from "./directives";

/**
 * The activation of the care — story 19, D-31, D-32.
 *
 * The practitioner validates the recommendations (`validateProtocol`), reads
 * the recap, then activates. `getActivationRecap` builds the recap for the
 * console. `activateCare` builds it again on the server, refuses when one
 * blocker is present, then moves the file to « Accompagnement actif » and
 * dates the patient's account.
 *
 * The callers have their actor checked by `byPatient`, so the reads and the
 * writes in the bodies use the system actor.
 */

const uuidSchema = z.uuid();

const profiles = (db: DatabaseClient = getDatabase()) =>
  db.collection<PatientProfile>("patient_profiles");

const recapOf = async (patientId: Id): Promise<Result<ActivationRecap>> => {
  const [validated, questionnaire, directives, calculations] =
    await Promise.all([
      getValidatedProtocol(systemActor, patientId),
      getPatientQuestionnaire(systemActor, patientId),
      listActivationDirectives(patientId),
      listPatientCalculations(systemActor, patientId),
    ]);
  if (!validated.ok) {
    return validated;
  }
  if (!questionnaire.ok) {
    return questionnaire;
  }
  const { answers, allergens } = questionnaire.data;
  return ok(
    activationRecap({
      validated: validated.data,
      safety: {
        allergies: safetyList("allergy", answers.noKnownAllergies, allergens)
          .state,
        intolerances: safetyList(
          "intolerance",
          answers.noKnownIntolerances,
          allergens,
        ).state,
      },
      // The live rows, not the snapshot: the mark comes after the validation.
      staleCalculations: calculations
        .filter(
          (row) =>
            row.validatedValue !== null &&
            row.validatedValue !== undefined &&
            row.needsRevalidation,
        )
        .map((row) => row.kind),
      evictions: directives.evictions,
      unrecognised: directives.unrecognised,
    }),
  );
};

/**
 * The recap that the practitioner reads before the activation, with the
 * blockers. A validated version that cannot be read is `upstream_failed`:
 * the console must not show a recap from the live tables in its place.
 */
const unscopedGetActivationRecap = async (
  patientId: Id,
): Promise<Result<ActivationRecap>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  return recapOf(patientId);
};

export type CareActivation = {
  patient: PatientProfile;
  /** True when the file was active before the call: nothing was written. */
  alreadyActive: boolean;
};

/**
 * Activate the care (story 19).
 *
 * 1. A file that is active already is `ok` with `alreadyActive`. Nothing is
 *    written: the activation runs once.
 * 2. A file at another status than « Recommandations à valider » is a
 *    `conflict`.
 * 3. The recap is built again. One blocker or more is a `conflict`, and
 *    nothing is written.
 * 4. In one transaction: the account of the patient, if one exists, gets
 *    `activatedAt`, and `setFileStatus` moves the file to `active`. A file
 *    with no account is activated the same way: `createPatientAccount` dates
 *    an account that is made later for an active file.
 * 5. `setFileStatus` writes the audit event `patient.file_status_changed`
 *    with the practitioner, the patient and the reason (D-32).
 *
 * The e-mail to the patient is not sent here. The caller sends it after an
 * `ok` with `alreadyActive` false (`./email.ts`, `sendActivationEmail`). A
 * send that fails does not undo the activation.
 */
const unscopedActivateCare = async (
  patientId: Id,
  actor: OperatorActor,
): Promise<Result<CareActivation>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await profiles().findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const status = file.fileStatus ?? initialFileStatus;
  if (status === "active") {
    return ok({ patient: file, alreadyActive: true });
  }
  if (status !== "to_validate") {
    return err("conflict", `a file at ${status} cannot be activated`);
  }
  const recap = await recapOf(patientId);
  if (!recap.ok) {
    return recap;
  }
  if (!canActivate(recap.data)) {
    return err(
      "conflict",
      `the activation is blocked: ${recap.data.blockers
        .map((blocker) => blocker.kind)
        .join(", ")}`,
    );
  }
  // A refused move throws in the transaction to roll it back. The holder
  // carries the refusal out of it.
  const refusal: { result: Result<CareActivation> | null } = { result: null };
  try {
    return await getDatabase().transaction(
      async (tx): Promise<Result<CareActivation>> => {
        // The account first: the audit event of the move is not in the
        // transaction, so the move is the last write that can fail.
        await markPatientAccountActivated(patientId, new Date(), tx);
        const moved = await setFileStatus(
          systemActor,
          patientId,
          "active",
          actor,
          careActivationReason,
          tx,
        );
        if (!moved.ok) {
          refusal.result = moved;
          throw new Error("the activation was refused");
        }
        return ok({ patient: moved.data, alreadyActive: false });
      },
    );
  } catch (cause) {
    if (refusal.result) {
      return refusal.result;
    }
    throw cause;
  }
};

/**
 * The date of the activation, or null. The file has no column for it, so the
 * date is the date of the audit event of the move to `active`. A file with
 * no such event (an old fixture) has no date.
 */
const unscopedGetCareActivationDate = async (
  patientId: Id,
): Promise<Date | null> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return null;
  }
  const page = await getDatabase()
    .collection<AuditEvent>("audit_events")
    .findMany(
      { action: "patient.file_status_changed", targetId: patientId },
      { limit: 500 },
    );
  const moves = page.items
    .filter((event) => /^\w+ → active(?::|$)/.test(event.detail))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return moves[0]?.createdAt ?? null;
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file. `activateCare` is a write: an admin's read-only open is
 * refused.
 */
export const getActivationRecap = byPatient(
  "read",
  unscopedGetActivationRecap,
  noSuchPatient,
);
export const activateCare = byPatient(
  "write",
  unscopedActivateCare,
  noSuchPatient,
);
export const getCareActivationDate = byPatient(
  "read",
  unscopedGetCareActivationDate,
  () => null,
);
