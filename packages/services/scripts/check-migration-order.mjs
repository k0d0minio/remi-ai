#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Fails a branch whose new migrations were generated before something the base
 * branch already carries. Runs in CI on every pull request.
 *
 * Drizzle decides what to apply by comparing the journal's `when` against the
 * newest applied `created_at` — never by hash — so a migration whose `when` is
 * older than one already applied is not retried, it is skipped forever, and the
 * branch ships code that queries columns the database does not have. Five PRs
 * cut from the same `main` once produced two migrations numbered `0013`: the
 * visible failure is a git conflict on `_journal.json`, and the dangerous way
 * out is renumbering the entry by hand while keeping its original `when`, which
 * resolves the conflict and leaves the migration unapplied forever.
 *
 * The remedy is always the same and CONVENTIONS.md § the factory states it:
 * regenerate, never renumber. Delete the branch's migration, bring the base in,
 * and `pnpm db:generate` again so its `when` is later than everything applied.
 *
 * Usage: node scripts/check-migration-order.mjs [--base <ref>]   (default: origin/main)
 */

const JOURNAL_IN_TREE = new URL(
  "../src/db/migrations/meta/_journal.json",
  import.meta.url,
);
/** The same file, repo-root-relative — that is how `git show <ref>:<path>` reads it. */
const JOURNAL_IN_GIT = "packages/services/src/db/migrations/meta/_journal.json";
const packageDir = fileURLToPath(new URL("..", import.meta.url));

const argv = process.argv.slice(2);
const baseFlag = argv.indexOf("--base");

if (baseFlag !== -1 && !argv[baseFlag + 1]) {
  console.error("[db:check-order] --base needs a git ref.");
  process.exit(1);
}

const base = baseFlag === -1 ? "origin/main" : argv[baseFlag + 1];

const git = (args) =>
  execFileSync("git", args, {
    cwd: packageDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

/**
 * A ref that does not resolve is an error — usually a shallow checkout that
 * never fetched the base — because passing on it would mean the check silently
 * covers nothing. A ref that resolves but carries no journal is the genuine
 * "nothing to compare against" case, and passes.
 */
try {
  git(["rev-parse", "--verify", `${base}^{commit}`]);
} catch {
  console.error(
    `[db:check-order] cannot resolve the base ref '${base}' — fetch it first (git fetch --depth=1 origin <branch>).`,
  );
  process.exit(1);
}

let baseJournal;
try {
  baseJournal = JSON.parse(git(["show", `${base}:${JOURNAL_IN_GIT}`]));
} catch {
  baseJournal = { entries: [] };
}

if (baseJournal.entries.length === 0) {
  console.log(
    `[db:check-order] '${base}' carries no migrations yet — nothing to compare against.`,
  );
  process.exit(0);
}

const branchJournal = JSON.parse(await readFile(JOURNAL_IN_TREE, "utf8"));

/**
 * Matched by tag rather than by idx: renumbering an entry is exactly the move
 * this check exists to catch, so an entry whose number changed must read as new
 * and be judged on its `when` like any other.
 */
const baseTags = new Set(baseJournal.entries.map((entry) => entry.tag));
const added = branchJournal.entries.filter((entry) => !baseTags.has(entry.tag));

if (added.length === 0) {
  console.log(
    `[db:check-order] no migrations added on top of '${base}' — nothing to order.`,
  );
  process.exit(0);
}

// Reduced rather than read off the end: a journal that is already out of order
// must not set a ceiling lower than what the database has actually applied.
const ceiling = baseJournal.entries.reduce(
  (newest, entry) => (entry.when > newest.when ? entry : newest),
  baseJournal.entries[0],
);
const stale = added.filter((entry) => entry.when <= ceiling.when);

if (stale.length > 0) {
  console.error(
    `[db:check-order] ${stale.length} migration(s) on this branch were generated before '${ceiling.tag}', which '${base}' already carries:`,
  );
  for (const entry of stale) {
    console.error(
      `[db:check-order]   - ${entry.tag} (when ${entry.when}) <= ${ceiling.tag} (when ${ceiling.when})`,
    );
  }
  console.error(
    "[db:check-order] Drizzle applies by timestamp, not by hash, so these would be recorded as applied and never run.",
  );
  console.error(
    "[db:check-order] Regenerate, never renumber: delete the branch's migration and its journal entry, merge the",
  );
  console.error(
    "[db:check-order] base branch in, then `pnpm db:generate` — see CONVENTIONS.md § the factory.",
  );
  process.exit(1);
}

console.log(
  `[db:check-order] ${added.length} new migration(s), all generated after '${ceiling.tag}' — order is safe.`,
);
