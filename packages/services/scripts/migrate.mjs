#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  MAX_ATTEMPTS,
  isConnectionFailure,
  waitForRetry,
} from "./connection-retry.mjs";

/**
 * Applies the checked-in migrations (src/db/migrations/) with drizzle-kit.
 * `verify.mjs` (`db:verify`) then checks the database carries the schema they
 * describe. `.icm/local/vercel-build.sh` runs both at the front of the admin
 * app's build, and `promote.yml` runs both against production before a
 * promotion. The rule is `.icm/local/database.md` § The migration rule.
 * Without DATABASE_URL it skips loudly and succeeds — CI and a developer
 * without a database must still build.
 *
 * On Vercel it migrates the `uat` build and a `preview` build. Each one owns
 * its database: `uat` reads the default branch of the UAT project, and a
 * preview reads the branch `preview/<git branch>` that the Neon integration
 * makes before the build. `MIGRATE_AT_BUILD=1` is the escape hatch for any
 * other target. A `production` build on Vercel fails here: promote.yml
 * migrates production. The guard is the second lock after vercel-build.sh,
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
 * A connection failure of `drizzle-kit migrate` gets a new attempt, with a
 * backoff (`connection-retry.mjs`, REM-118). Any other failure stops at the
 * first attempt: the decision reads the output of drizzle-kit, not its exit
 * code. A new attempt runs the same `drizzle-kit migrate` again, so drizzle
 * reads its ledger again and the order of the journal holds.
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
    "[db:migrate] On Vercel only the uat build and a preview build migrate. Each one owns its database.",
  );
  console.error(
    "[db:migrate] Production migrates in promote.yml. See .icm/local/database.md § The migration rule.",
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

/** The end of the output is enough to find the error, and it bounds the memory. */
const OUTPUT_LIMIT = 64 * 1024;

/**
 * One run of `drizzle-kit migrate`. The output goes to the build log as it
 * comes, and its end is kept to tell a connection failure from another one.
 */
const runMigrate = () =>
  new Promise((resolve) => {
    let output = "";
    const keep = (chunk) => {
      output = (output + chunk).slice(-OUTPUT_LIMIT);
    };
    const child = spawn("pnpm", ["exec", "drizzle-kit", "migrate"], {
      cwd: packageDir,
      stdio: ["inherit", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      keep(chunk);
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      keep(chunk);
    });
    // The command did not start (for example, pnpm is absent). No retry.
    child.on("error", (error) => {
      console.error(`[db:migrate] drizzle-kit did not start: ${error.message}`);
      resolve({ status: 1, output: "" });
    });
    child.on("close", (status) => {
      resolve({ status: status ?? 1, output });
    });
  });

for (let attempt = 1; ; attempt += 1) {
  const { status, output } = await runMigrate();
  if (status === 0) {
    if (attempt > 1) {
      console.log(
        `[db:migrate] attempt ${attempt} of ${MAX_ATTEMPTS}: the migrations are applied.`,
      );
    }
    process.exit(0);
  }
  if (!isConnectionFailure(output)) {
    console.error(
      `[db:migrate] drizzle-kit migrate failed (exit ${status}). This is not a connection failure, so there is no new attempt.`,
    );
    process.exit(status);
  }
  if (!(await waitForRetry("db:migrate", attempt))) {
    process.exit(status);
  }
}
