import { describe, expect, it } from "vitest";
import * as auth from "./index";

/**
 * The entrypoint's public surface, pinned.
 *
 * Two things this catches that nothing else does: a symbol dropped from the
 * barrel while an app still imports it, and a module graph that fails to load at
 * all — importing this file pulls in the Neon adapter, so a missing dependency
 * or a bad relative path fails here rather than on a deployed console.
 */
describe("@remi/services/auth", () => {
  it("exports exactly what the gated apps and the seed script import", () => {
    expect(Object.keys(auth).sort()).toEqual([
      "SIGN_IN_FAILED",
      "createOperator",
      "isOperator",
      "registerAuthStore",
      "registerNeonAuthStore",
      "resolveSession",
      "signInWithPassword",
      "signOut",
    ]);
  });

  it("refuses a second, different adapter rather than swapping one in", () => {
    const first = { driver: "first" } as unknown as Parameters<
      typeof auth.registerAuthStore
    >[0];
    const second = { driver: "second" } as unknown as typeof first;

    auth.registerAuthStore(first);
    auth.registerAuthStore(first); // idempotent — the same adapter is not a bug
    expect(() => auth.registerAuthStore(second)).toThrow(/already registered/);
  });
});
