import type { Entity, Id } from "../../types";
import type { AuditActorKind } from "./audit-event";
import type {
  ConsentDecision,
  ConsentKey,
  ConsentRecordChannel,
  ConsentTextLocale,
} from "../../shared/consent";

/**
 * One consent decision of one patient — story 3, D-32. Append-only: a later
 * decision on the same key is a new row, and the latest row per key is the
 * patient's answer.
 *
 * `textVersion`, `textLocale` and `textHash` name the exact text the patient
 * read. A `legacy` row comes from the two hand-filled columns of
 * `patient_profiles`, and it has no locale and no hash.
 */
export type PatientConsent = Entity & {
  patientProfileId: Id;
  consentKey: ConsentKey;
  textVersion: string;
  textLocale: ConsentTextLocale | null;
  textHash: string | null;
  decision: ConsentDecision;
  channel: ConsentRecordChannel | null;
  decidedAt: Date;
  actorKind: AuditActorKind;
};
