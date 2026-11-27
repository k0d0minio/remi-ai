#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit.
 * `verify.mjs` (`db:verify`) then checks the database carries the schema they
 * describe. The blueprint's `.icm/_system/scripts/db.sh` runs both: `db.sh
 * build` at the front of the admin app's Vercel build, `db.sh migrate` in
 * `promote.yml` against production before a promotion, and the job `code` of
 * `ci` on an empty Postgres. The rule is `.icm/_system/features/database.md`.
 * Without DATABASE_URL it skips loudly and succeeds.
 *
 * On Vercel it migrates the `uat` build and a `preview` build: `uat` reads the
 * default branch of the UAT project, and each preview reads the one shared
 * preview database (the branch `preview` of `uat-remi-ai`).
 * `MIGRATE_AT_BUILD=1` is the escape hatch for any other target. A
 * `production` build on Vercel fails here: promote.yml migrates production.
 * The guard is the second lock after `db.sh build`,
 * and it fails closed because the cost of a wrong migration is silent: on
 * 2026-09-02 a preview created a table in the live database, which pushed
 * drizzle's high-water mark past an older migration on `main` and made that
 * one skip silently forever. Drizzle decides what to apply by comparing the
 * journal's `when` against the newest applied `created_at` — never by hash —
 * so a migration that lands out of order is not retried, it is lost.
 *
 * It prints the database host (never the connection string) before it
 * migrates, so a build log shows which branch the migration reached.
 *
 * Vercel sets VERCEL_ENV and VERCEL_TARGET_ENV on every build, and turbo.json
 * passes both through. Either one present means "on Vercel". Off Vercel
 * (promote.yml, a developer's own database) both are unset and it migrates.
 *
 * The literal process.env reads are the same carve-out as drizzle.config.ts:
 * this runs outside the app process, where env() does not exist.
 */
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db:migrate] DATABASE_URL is not set — skipping migrations (CI or a build without a database).",
  );
  process.exit(0);
}

const target = process.env.VERCEL_TARGET_ENV;
const onVercel = Boolean(process.env.VERCEL_ENV || target);
const ownsDatabase =
  target === "uat" ||
  target === "preview" ||
  process.env.MIGRATE_AT_BUILD === "1";

if (onVercel && !ownsDatabase) {
  console.error(
    `[db:migrate] VERCEL_TARGET_ENV=${target ?? "unset"} MIGRATE_AT_BUILD=${process.env.MIGRATE_AT_BUILD ?? "unset"} — refusing to migrate.`,
  );
  console.error(
    "[db:migrate] On Vercel only the uat build and a preview build migrate.",
  );
  console.error(
    "[db:migrate] Production migrates in promote.yml. See .icm/_system/features/database.md.",
  );
  process.exit(1);
}

let host = "unknown";
try {
  host = new URL(process.env.DATABASE_URL).host;
} catch {
  // A connection string that URL cannot parse still reaches drizzle-kit below.
}
console.log(
  `[db:migrate] VERCEL_TARGET_ENV=${target ?? "unset"} host=${host}: applying the checked-in migrations`,
);

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: packageDir,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
