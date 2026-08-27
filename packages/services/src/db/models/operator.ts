import type { Entity } from "../../types";

/**
 * An operator of the admin console — phase 1, that is Morgane. Not re-exported
 * through `@remi/services/shared`: the shape carries a credential hash, so it
 * stays on the server surface and pages pass plain strings down instead.
 */
export type Operator = Entity & {
  email: string;
  name: string;
  passwordHash: string;
};
