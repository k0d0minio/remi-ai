#!/usr/bin/env node
import { readFile } from "node:fs/promises";

/**
 * Checks the database actually looks like the migrations say it does. Runs
 * after `db:migrate`, in `.icm/scripts/vercel-build.sh` and in `promote.yml`.
 * Without DATABASE_URL it skips loudly and succeeds. It only reads, so it
 * carries no environment guard.
 *
 * A green `drizzle-kit migrate` only means the ledger is satisfied, not that
 * the schema is there: drizzle's high-water-mark rule (see migrate.mjs) can
 * record a migration that never ran, and drizzle never revisits it. That is not
 * theoretical — `patient_anamnesis` was marked applied and absent for two
 * days, and the first anyone knew was the admin patient page throwing 42P01
 * behind an error digest. A build that fails here costs a deploy; the silent
 * version costs a console.
 *
 * The expected tables come from the newest snapshot rather than from
 * `schema.ts`, so this needs no build of the package and no drift of its own:
 * the snapshot IS the migrations' record of the state they leave behind.
 *
 * The literal process.env read is the same carve-out as drizzle.config.ts.
 */
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db:verify] DATABASE_URL is not set — skipping the schema check (CI or a build without a database).",
  );
  process.exit(0);
}

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

// Imported here rather than at the top so the skip path above never needs the
// driver resolved.
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
    `[db:verify] the migrations report as applied, but ${missing.length} table(s) are not in the database:`,
  );
  for (const name of missing) {
    console.error(`[db:verify]   - ${name}`);
  }
  console.error(
    "[db:verify] Drizzle will not retry a migration it has already recorded. Repair it with a new",
  );
  console.error(
    "[db:verify] idempotent migration (CREATE TABLE IF NOT EXISTS ...), which applies past the",
  );
  console.error(
    "[db:verify] high-water mark and no-ops everywhere the table already exists.",
  );
  process.exit(1);
}

console.log(
  `[db:verify] schema verified — all ${expected.length} tables present.`,
);
