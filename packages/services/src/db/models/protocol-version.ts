import type { ProtocolSnapshot } from "../../shared/protocol-snapshot";
import type { Entity, Id } from "../../types";

/**
 * One validated version of a patient's protocol — story 20. The practitioner
 * validates the live protocol, and the row keeps a copy of it with the date
 * and the operator. A version is immutable: no code path updates or deletes
 * a row. The rows go only with the patient (`on delete cascade`).
 */
export type ProtocolVersion = Entity & {
  patientId: Id;
  /** From 1, plus 1 at each validation of the same patient. */
  versionNumber: number;
  validatedAt: Date;
  /** The operator who validated. No foreign key, like `audit_events`. */
  validatedBy: Id;
  snapshot: ProtocolSnapshot;
};

/**
 * What a reader of validated content gets (D-30): the latest version of the
 * patient. The patient space and the generation read only this, never the
 * live tables.
 */
export type ValidatedProtocol = Pick<
  ProtocolVersion,
  "versionNumber" | "validatedAt" | "validatedBy" | "snapshot"
>;
