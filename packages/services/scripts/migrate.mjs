#!/usr/bin/env node
// Applies every migration in src/db/migrations that this database has not seen,
// in filename order, recording each in `schema_migrations`. Running it twice is
// a no-op; running it against an empty database builds the current schema.
//
// It uses the WebSocket client rather than the HTTP one the adapter uses: a
// migration file is many statements, and only the simple query protocol — what
// `client.query(text)` with no parameters speaks — will run them as one unit
// inside a transaction. Plain JavaScript so it needs no build step of its own;
// the chain has to be appliable before anything in this package compiles.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client, neonConfig } from "@neondatabase/serverless";

const MIGRATIONS = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "db",
  "migrations",
);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  fail(
    "DATABASE_URL is not set. Use the Neon pooled connection string — see docs/ENV.md.",
  );
}

if (!neonConfig.webSocketConstructor) {
  if (!globalThis.WebSocket) {
    fail("No global WebSocket — this script needs Node 22 or newer.");
  }
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

const client = new Client({ connectionString });
await client.connect();

try {
  // The ledger is not itself a migration — it is what makes migrations
  // idempotent — so it is the one place IF NOT EXISTS belongs.
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));

  const files = (await readdir(MIGRATIONS))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const pending = files.filter((name) => !applied.has(name));

  for (const name of pending) {
    const sql = await readFile(join(MIGRATIONS, name), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        name,
      ]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`${name} failed: ${error.message}`, { cause: error });
    }
    console.log(`applied ${name}`);
  }

  console.log(
    pending.length === 0
      ? `up to date — ${files.length} migration(s) already applied`
      : `${pending.length} migration(s) applied`,
  );
} finally {
  await client.end();
}
