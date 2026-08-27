#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit.
 * Runs at the front of the admin app's build, so a deploy with DATABASE_URL
 * set migrates before it serves. Without DATABASE_URL it skips loudly and
 * succeeds — CI and previews without a database must still build.
 *
 * The literal process.env read is the same carve-out as drizzle.config.ts:
 * this runs outside the app process, where env() does not exist.
 */
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db:migrate] DATABASE_URL is not set — skipping migrations (CI or a preview without a database).",
  );
  process.exit(0);
}

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: packageDir,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
