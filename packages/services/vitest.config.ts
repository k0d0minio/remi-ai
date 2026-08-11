import { defineConfig } from "vitest/config";

/**
 * The minimum runner needed to land REMI-001's auth layer tested. The full
 * harness — every workspace, the `src/db/**` coverage floor, the CI gate as a
 * required check — is REMI-008; this config is deliberately the smallest thing
 * that makes `pnpm test` real, and REMI-008 extends it rather than replacing it.
 *
 * Tests are colocated as `*.test.ts` next to the source, which is the convention
 * REMI-008 names.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
