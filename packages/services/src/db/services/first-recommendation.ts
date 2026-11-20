import { canMoveFileStatus, initialFileStatus } from "../../shared/file-status";
import type { Id } from "../../types";
import { getDatabase } from "../client";
import type { PatientProfile } from "../models/patient-profile";
import { systemActor } from "./access";
import type { AuditActor } from "./audit";
import { setFileStatus } from "./patients";

/**
 * The move to « Recommandations à valider » (D-31, story 20).
 *
 * The save of a recommendation of any kind calls this after its write: a
 * recommendation, a goal, a supplement or the instruction. A file at « Prêt
 * pour consultation » moves to « Recommandations à valider ». A file at
 * another status does not move: a first recommendation on a file still « à
 * compléter » moves nothing (Jamie, 2026-11-03).
 *
 * The caller has checked the actor before its own write, so the move uses the
 * system actor. The save services do not know the operator's name, so the
 * audit event of the move names REMI: the status follows the save, the
 * practitioner did not set it. The save itself has its own audit event with
 * the operator.
 *
 * A failed move never fails the save: the failure goes to the log.
 */

/** Stored in English. The console's journal has the French of it. */
export const firstRecommendationReason = "a first recommendation is saved";

const remi: AuditActor = { kind: "system", id: null, name: "REMI" };

export const moveToValidateAfterSave = async (patientId: Id): Promise<void> => {
  try {
    const file = await getDatabase()
      .collection<PatientProfile>("patient_profiles")
      .findById(patientId);
    if (
      !file ||
      !canMoveFileStatus(file.fileStatus ?? initialFileStatus, "to_validate")
    ) {
      return;
    }
    const moved = await setFileStatus(
      systemActor,
      patientId,
      "to_validate",
      remi,
      firstRecommendationReason,
    );
    if (!moved.ok) {
      console.error("[file-status] the file did not move to to_validate", {
        patient: patientId,
        message: moved.message,
      });
    }
  } catch (cause) {
    console.error("[file-status] the file did not move to to_validate", cause);
  }
};
