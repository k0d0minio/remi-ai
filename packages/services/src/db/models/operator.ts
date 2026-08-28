import type { Entity } from "../../types";
import type { operatorRoles } from "../../shared/operator";

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
};
