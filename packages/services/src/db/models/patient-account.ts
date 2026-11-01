import type { Entity, Id } from "../../types";

/**
 * The account a patient signs in with — story 2, D-26. One per patient file,
 * kept after activation: story 19 sets `activatedAt`, it never makes a second
 * account.
 *
 * `authSubject` is the auth adapter's own user id. It is the only link to the
 * identity store, so nothing above the auth seam names the vendor. `email` is
 * stored lower-cased and is unique across the table, because the identity store
 * holds one user per address whatever the practitioner.
 */
export type PatientAccount = Entity & {
  patientProfileId: Id;
  email: string;
  authSubject: string;
  activatedAt: Date | null;
};
