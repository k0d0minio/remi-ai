/**
 * Why the provider refused a call, when the adapter can tell.
 * - `no_access`: the account has no access to the model (for example a model
 *   that a free plan does not include).
 * - `unknown_model`: the provider does not know the model id.
 */
export type ProviderCallReason = "no_access" | "unknown_model";

/**
 * An adapter throws this when it knows why the provider refused a call. The
 * message is fixed: it never holds the provider's message, the prompt or the
 * key. It is in its own file, which imports nothing, because the seam and its
 * adapter both need the class.
 */
export class ProviderCallError extends Error {
  readonly reason: ProviderCallReason;

  constructor(reason: ProviderCallReason) {
    super(`the provider refused the call: ${reason}`);
    this.name = "ProviderCallError";
    this.reason = reason;
  }
}
