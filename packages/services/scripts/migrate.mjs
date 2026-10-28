#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit.
 * `verify.mjs` (`db:verify`) then checks the database carries the schema they
 * describe. `.icm/scripts/vercel-build.sh` runs both at the front of the admin
 * app's build when that deployment owns its database, and `promote.yml` runs
 * both against production before a promotion. The rule is
 * `.icm/database/CONTEXT.md` § The migration rule. Without DATABASE_URL it
 * skips loudly and succeeds — CI and a developer without a database must still
 * build.
 *
 * On Vercel it migrates only the UAT build (`VERCEL_TARGET_ENV=uat`) and a
 * preview that owns its own Neon branch (`MIGRATE_AT_BUILD=1`). Anything else
 * on Vercel fails the build. vercel-build.sh already decides this; the guard
 * is the second lock, and it fails closed because the cost of a wrong
 * migration is silent: on 2026-09-02 a preview created a table in the live
 * database, which pushed drizzle's high-water mark past an older migration on
 * `main` and made that one skip silently forever. Drizzle decides what to
 * apply by comparing the journal's `when` against the newest applied
 * `created_at` — never by hash — so a migration that lands out of order is
 * not retried, it is lost.
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
  target === "uat" || process.env.MIGRATE_AT_BUILD === "1";

if (onVercel && !ownsDatabase) {
  console.error(
    `[db:migrate] VERCEL_TARGET_ENV=${target ?? "unset"} MIGRATE_AT_BUILD=${process.env.MIGRATE_AT_BUILD ?? "unset"} — refusing to migrate.`,
  );
  console.error(
    "[db:migrate] On Vercel only the uat build, or a preview that owns its Neon branch, migrates.",
  );
  console.error(
    "[db:migrate] Production migrates in promote.yml. See .icm/database/CONTEXT.md § The migration rule.",
  );
  process.exit(1);
}

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: packageDir,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
