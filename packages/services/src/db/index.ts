/**
 * @remi/services/db — storage.
 *
 * Server-only. Apps do not import this directly; they import `/server`, which
 * re-exports the service layer. This entrypoint exists so the seam is testable
 * and so an adapter package can depend on the interfaces without the rest.
 *
 * Layout as this grows:
 *   db/client.ts     the seam (below)
 *   db/models/       one file per entity — shape + validation
 *   db/services/     one folder per entity — the callable surface
 *   db/migrations/   forward + backward, one file per change
 */

export { getDatabase, isDatabaseRegistered, registerDatabase } from "./client";
export type { Collection, DatabaseClient } from "./client";
