import type { Entity, Id } from "../../types";
import type { FileClaimPurpose } from "../../shared/file-claim";

/**
 * A one-time link to take over a practitioner-created file
 * (`patient-takes-over-file`). `tokenHash` is the SHA-256 of the token: the
 * plaintext exists once, in the e-mail. Like `OperatorInvitation`, this shape
 * stays off `@remi/services/shared`: it carries a credential digest.
 */
export type PatientFileClaim = Entity & {
  patientProfileId: Id;
  purpose: FileClaimPurpose;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};
