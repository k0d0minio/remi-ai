#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit, then
 * verifies the database really carries the schema they describe. Runs at the
 * front of the admin app's build, so a deploy with DATABASE_URL set migrates
 * before it serves. Without DATABASE_URL it skips loudly and succeeds — CI and
 * previews without a database must still build.
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

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

/**
 * Then check the database actually looks like the migrations say it does.
 *
 * A green `drizzle-kit migrate` only means the ledger is satisfied, not that
 * the schema is there: the high-water-mark rule described above can record a
 * migration that never ran, and drizzle never revisits it. That is not
 * theoretical — `patient_anamnesis` was marked applied and absent for two
 * days, and the first anyone knew was the admin patient page throwing 42P01
 * behind an error digest. A build that fails here costs a deploy; the silent
 * version costs a console.
 *
 * The expected tables come from the newest snapshot rather than from
 * `schema.ts`, so this needs no build of the package and no drift of its own:
 * the snapshot IS the migrations' record of the state they leave behind.
 */
const migrationsDir = new URL("../src/db/migrations/meta/", import.meta.url);
const journal = JSON.parse(
  await readFile(new URL("_journal.json", migrationsDir), "utf8"),
);
const newest = journal.entries.at(-1);
const snapshot = JSON.parse(
  await readFile(
    new URL(`${String(newest.idx).padStart(4, "0")}_snapshot.json`, migrationsDir),
    "utf8",
  ),
);
const expected = Object.values(snapshot.tables)
  .filter((table) => (table.schema ?? "") === "")
  .map((table) => table.name);

// Imported here rather than at the top so the two skip paths above — no
// DATABASE_URL, non-production deploy — never need the driver resolved.
const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const present = new Set(
  (
    await sql`select table_name from information_schema.tables where table_schema = 'public'`
  ).map((row) => row.table_name),
);
const missing = expected.filter((name) => !present.has(name));

if (missing.length > 0) {
  console.error(
    `[db:migrate] the migrations report as applied, but ${missing.length} table(s) are not in the database:`,
  );
  for (const name of missing) {
    console.error(`[db:migrate]   - ${name}`);
  }
  console.error(
    "[db:migrate] Drizzle will not retry a migration it has already recorded. Repair it with a new",
  );
  console.error(
    "[db:migrate] idempotent migration (CREATE TABLE IF NOT EXISTS ...), which applies past the",
  );
  console.error(
    "[db:migrate] high-water mark and no-ops everywhere the table already exists.",
  );
  process.exit(1);
}

console.log(
  `[db:migrate] schema verified — all ${expected.length} tables present.`,
);
