#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit.
 * Runs at the front of the admin app's build, so a deploy with DATABASE_URL
 * set migrates before it serves. Without DATABASE_URL it skips loudly and
 * succeeds — CI and previews without a database must still build.
 *
 * It also refuses to migrate from a non-production Vercel deploy. That guard
 * exists because previews and production may share one DATABASE_URL, and a
 * preview build then writes the branch's schema into the live database: on
 * 2026-09-02 a preview created a table there, which pushed drizzle's
 * high-water mark past an older migration on `main` and made that one skip
 * silently forever. Drizzle decides what to apply by comparing the journal's
 * `when` against the newest applied `created_at` — never by hash — so a
 * migration that lands out of order is not retried, it is lost.
 *
 * The literal process.env reads are the same carve-out as drizzle.config.ts:
 * this runs outside the app process, where env() does not exist.
 */
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db:migrate] DATABASE_URL is not set — skipping migrations (CI or a preview without a database).",
  );
  process.exit(0);
}

/**
 * Unset off Vercel — a local or CI build with its own DATABASE_URL still
 * migrates, which is the behaviour a developer expects of their own database.
 */
const vercelEnv = process.env.VERCEL_ENV;
const optedIn = process.env.ALLOW_NON_PRODUCTION_MIGRATIONS === "true";

if (vercelEnv && vercelEnv !== "production" && !optedIn) {
  console.warn(
    `[db:migrate] VERCEL_ENV=${vercelEnv} — refusing to migrate from a non-production deploy.`,
  );
  console.warn(
    "[db:migrate] The preview builds and serves against the schema the database already has, so a",
  );
  console.warn(
    "[db:migrate] branch's new tables are absent until it merges. Point previews at their own Neon",
  );
  console.warn(
    "[db:migrate] branch to see them, or set ALLOW_NON_PRODUCTION_MIGRATIONS=true to override.",
  );
  process.exit(0);
}

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: packageDir,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
