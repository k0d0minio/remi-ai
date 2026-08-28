import type { Entity } from "../../types";
import type { OperatorRole } from "./operator";

/**
 * A pending invitation to the admin console.
 *
 * `tokenHash` is what the name says — the plaintext token exists once, in the
 * email and the link handed to the inviter, and is never stored. Like
 * `Operator`, this shape stays off `@remi/services/shared`: it carries a
 * credential digest, so pages are handed a view model instead.
 */
export type OperatorInvitation = Entity & {
  email: string;
  name: string;
  role: OperatorRole;
  tokenHash: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  invitedByEmail: string;
};
