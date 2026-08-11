#!/usr/bin/env node
// Creates — or rotates the password of — one operator.
//
//   pnpm --filter @remi/services build          # the script runs the built package
//   pnpm --filter @remi/services auth:create-operator -- --email=you@example.com
//
// The password is never an argument. It is prompted for with the echo turned
// off, or taken from OPERATOR_PASSWORD for a non-interactive run, so it does not
// land in shell history, in a process list, or in this repository.
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const emailArg = process.argv
  .slice(2)
  .find((argument) => argument.startsWith("--email="));

const email = emailArg?.slice("--email=".length).trim();
if (!email) {
  fail("Usage: auth:create-operator -- --email=<address>");
}

const promptHidden = (question) =>
  new Promise((resolve) => {
    let muted = false;
    const output = new Writable({
      write: (chunk, encoding, callback) => {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    const rl = createInterface({
      input: process.stdin,
      output,
      terminal: true,
    });

    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });

const password =
  process.env.OPERATOR_PASSWORD ?? (await promptHidden(`Password for ${email}: `));

if (!password) {
  fail("No password given — nothing was written.");
}

let auth;
try {
  auth = await import("../dist/auth/index.js");
} catch {
  fail(
    "Could not load the built package. Run `pnpm --filter @remi/services build` first.",
  );
}

auth.registerNeonAuthStore();

const result = await auth.createOperator({ email, password });

if (!result.ok) {
  fail(`${result.error}: ${result.message}`);
}

console.log(
  `operator ready — ${result.data.email} (${result.data.role}, ${result.data.status})`,
);
