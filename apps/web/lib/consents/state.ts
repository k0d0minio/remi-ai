/**
 * The answer of a consent action of the settings (REM-43). Kept out of
 * `actions.ts`: a "use server" file exports only actions.
 *
 * - `signed_out`: no session. The patient signs in again.
 * - `stale`: the text that the page showed is not the current one.
 * - `unavailable`: a read or the write failed, or the service refused.
 */
export type ConsentActionError = "signed_out" | "stale" | "unavailable";

export type ConsentActionResult =
  { ok: true } | { ok: false; error: ConsentActionError };
