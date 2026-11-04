import type { Id } from "../../types";
import type { OperatorRole } from "./operator";

/**
 * Who calls a service of patient data (story 3, D-27). Every read and write of
 * a patient file takes one, and `db/services/access` decides from it alone.
 *
 * - `operator`: a console account. It reads and writes the files it holds.
 *   An `admin` also reads, never writes, a file of another practitioner after
 *   it gave a reason: `openedPatientIds` lists those files.
 * - `patient`: a patient session or a patient link. It reaches its own file
 *   only.
 * - `system`: REMI itself, or a service that already checked the caller. It
 *   reaches every file. Only code in this package and the scheduled routes
 *   build it.
 */
export type Actor =
  | {
      kind: "operator";
      id: Id;
      role: OperatorRole;
      openedPatientIds: readonly Id[];
    }
  | { kind: "patient"; patientId: Id }
  | { kind: "system" };

/** A read or a write. An admin's open of another practitioner's file reads only. */
export type AccessMode = "read" | "write";
