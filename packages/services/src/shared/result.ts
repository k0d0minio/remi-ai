/**
 * The one way a service reports a failure the caller is expected to handle.
 *
 * Services throw only for genuinely exceptional conditions (a misconfigured
 * environment, a driver that isn't registered). Anything a UI has to render —
 * not found, not permitted, validation failed — comes back as a `Result` so the
 * caller cannot forget the failure branch.
 */
export type Result<T, E extends string = ServiceErrorCode> =
  { ok: true; data: T } | { ok: false; error: E; message: string };

export type ServiceErrorCode =
  | "not_found"
  | "not_permitted"
  | "invalid_input"
  | "conflict"
  | "upstream_failed";

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const err = <E extends string>(
  error: E,
  message: string,
): Result<never, E> => ({ ok: false, error, message });

/** Narrow a Result to its success branch, throwing if it failed. Use at trust boundaries only. */
export const unwrap = <T, E extends string>(result: Result<T, E>): T => {
  if (!result.ok) {
    throw new Error(`${result.error}: ${result.message}`);
  }
  return result.data;
};
