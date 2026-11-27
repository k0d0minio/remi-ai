#!/usr/bin/env node
import { parseArgs } from "node:util";
import pg from "pg";

/**
 * Gives a role to a test account of the BAXTER checktest. The contract is
 * `.icm/setup/checktest-accounts.md`: the root script `seed:test-roles`.
 *
 *   pnpm seed:test-roles --email test+remi-ai-admin@jamienisbet.com --role admin --target uat
 *
 * The account is a row of `operators` (the admin console). The checktest signs
 * it up first. This script only changes its `role`, so it can run again with
 * no change. A role is `admin` or `practitioner`, the set of `operators.role`.
 *
 * The database address comes from DATABASE_URL in the environment of the one
 * command, never from the command line. The UAT address comes from the keyring
 * of BAXTER for that command only. Never write it in a file.
 *
 * It refuses:
 * - an address that is not `test+remi-ai-*@jamienisbet.com`;
 * - a target that is not `local` or `uat`;
 * - a production environment (VERCEL_ENV, VERCEL_TARGET_ENV or NODE_ENV);
 * - `--target local` on a remote host, and `--target uat` on a local host.
 *
 * Exit 0: the account has the role. Exit 1: refused or failed, with one line.
 * It prints the database host, never the connection string.
 *
 * The literal process.env reads are the same carve-out as migrate.mjs: this
 * runs outside the app process, where env() does not exist.
 */

const ROLES = ["admin", "practitioner"];
const TARGETS = ["local", "uat"];
const TEST_EMAIL = /^test\+remi-ai-[a-z0-9-]+@jamienisbet\.com$/;
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

const fail = (reason) => {
  console.error(`[seed:test-roles] refused: ${reason}`);
  process.exit(1);
};

const readArgs = () => {
  try {
    // pnpm can pass a lone "--" before the options.
    const args = process.argv.slice(2).filter((arg) => arg !== "--");
    return parseArgs({
      args,
      options: {
        email: { type: "string" },
        role: { type: "string" },
        target: { type: "string" },
      },
      strict: true,
    }).values;
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
};

const hostOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return fail("DATABASE_URL is not a valid address");
  }
};

const main = async () => {
  const { email, role, target } = readArgs();
  const address = (email ?? "").trim().toLowerCase();

  if (!TEST_EMAIL.test(address)) {
    fail("the address is not test+remi-ai-*@jamienisbet.com");
  }
  if (!ROLES.includes(role ?? "")) {
    fail(`the role is not one of ${ROLES.join(", ")}`);
  }
  if (!TARGETS.includes(target ?? "")) {
    fail(`the target is not one of ${TARGETS.join(", ")}`);
  }

  const environments = [
    process.env.VERCEL_ENV,
    process.env.VERCEL_TARGET_ENV,
    process.env.NODE_ENV,
  ];
  if (environments.includes("production")) {
    fail("the environment is production");
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    fail("DATABASE_URL is not set");
  }

  const host = hostOf(url);
  const isLocal = LOCAL_HOSTS.includes(host);
  if (target === "local" && !isLocal) {
    fail(`--target local, but the host ${host} is not local`);
  }
  if (target === "uat" && isLocal) {
    fail(`--target uat, but the host ${host} is local`);
  }

  console.log(`[seed:test-roles] database host: ${host}`);

  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const result = await client.query(
      "update operators set role = $2, updated_at = now() where lower(email) = $1 returning id",
      [address, role],
    );
    if (result.rowCount !== 1) {
      fail(`no operator account has the address ${address}: sign it up first`);
    }
    console.log(`[seed:test-roles] ${address} has the role ${role}`);
  } finally {
    await client.end();
  }
};

try {
  await main();
} catch (error) {
  console.error(
    `[seed:test-roles] failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
