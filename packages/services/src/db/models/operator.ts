import type { Entity } from "../../types";
import type { operatorRoles, PatientListSort } from "../../shared/operator";

export type OperatorRole = (typeof operatorRoles)[number];

/**
 * An operator of the admin console — Morgane, Arnaud, and whoever they invite.
 * Not re-exported through `@remi/services/shared`: the shape carries a
 * credential hash, so it stays on the server surface and pages pass plain
 * strings down instead.
 */
export type Operator = Entity & {
  email: string;
  name: string;
  passwordHash: string;
  role: OperatorRole;
  /** The permanent sign-up link's token. Shown only to its own practitioner. */
  signupLinkToken: string;
  /** The order of the patient list, remembered per practitioner (story 5). */
  patientListSort: PatientListSort;
  /**
   * The practitioner's own free question for their patients (REM-161). Null
   * when they have none.
   */
  questionnaireQuestion: string | null;
};
