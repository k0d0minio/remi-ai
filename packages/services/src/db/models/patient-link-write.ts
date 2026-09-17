import type { Entity, Id } from "../../types";

/**
 * One accepted write through a patient link — the ledger row the per-token
 * rate limit counts.
 *
 * Deliberately almost empty. `createdAt` is the whole payload: what was
 * written is the row the write created, and who wrote it is the audit trail.
 * A copy of either here would be health data kept for arithmetic.
 */
export type PatientLinkWrite = Entity & {
  patientId: Id;
};
