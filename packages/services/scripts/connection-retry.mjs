/**
 * The retry rule that `migrate.mjs` and `verify.mjs` share (REM-118).
 *
 * A Neon compute that wakes from auto-suspend can drop the first connection.
 * On PR #95 that one drop failed the whole admin deploy, and the migrations
 * were correct. So a connection failure gets a small number of new attempts
 * with a backoff. The Neon documentation gives a cold start of a few seconds.
 *
 * Only a connection failure is tried again. The decision reads the error
 * text, never the exit code: a migration that fails to apply (an SQL error)
 * must stop the build at the first attempt. A new attempt after a connection
 * failure is safe. drizzle-orm applies the pending migrations in one
 * transaction, so a dropped connection rolls them back. The next attempt
 * reads the ledger again and applies, in journal order, only what the ledger
 * does not have.
 *
 * The log lines of this file print the attempt number and the wait. They do
 * not print the error text or the connection string.
 */

/** The wait before attempts 2, 3 and 4. Thus 4 attempts and 14 s of wait at most. */
export const RETRY_DELAYS_MS = [2000, 4000, 8000];
export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

/** SQLSTATE class 08 (connection exception) and the server start and stop codes. */
const CONNECTION_SQLSTATE = /^(?:08\w{3}|57P01|57P02|57P03)$/;
const SQLSTATE = /^[0-9A-Z]{5}$/;

/**
 * The text of a connection failure, as node-postgres, the Neon serverless
 * driver (WebSocket and HTTP), undici and the Neon proxy print it. Each
 * pattern is narrow on purpose. drizzle-kit prints a warning with the word
 * "websocket" on each run, so that word alone must not match.
 */
const CONNECTION_FAILURE = [
  /Connection terminated/i,
  /timeout exceeded when trying to connect/i,
  /\b(?:ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|EAI_AGAIN|ENOTFOUND|EHOSTUNREACH|ENETUNREACH)\b/,
  /\bUND_ERR_(?:CONNECT_TIMEOUT|SOCKET|HEADERS_TIMEOUT)\b/,
  /socket hang up/i,
  /fetch failed/i,
  /WebSocket was closed before the connection was established/i,
  /open a WebSocket to connect to the database failed/i,
  /Server error \(HTTP status 5\d\d\)/i,
  /Couldn't connect to compute node/i,
  /Control plane request failed/i,
  /the database system is (?:starting up|shutting down|in recovery mode)/i,
  /terminating connection due to (?:administrator command|crash)/i,
  /code: '(?:08\w{3}|57P01|57P02|57P03)'/,
];

/** True when the text of a failed command shows a connection failure. */
export const isConnectionFailure = (text) =>
  CONNECTION_FAILURE.some((pattern) => pattern.test(text));

/**
 * True when a thrown error is a connection failure. It reads the error and its
 * causes (`cause`, and `sourceError` of the Neon driver). An error with an
 * SQLSTATE outside the connection codes is an answer of the database, so it is
 * never a connection failure, whatever its message says.
 */
export const isConnectionError = (error) => {
  const texts = [];
  let current = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const code = typeof current.code === "string" ? current.code : "";
    if (SQLSTATE.test(code) && !CONNECTION_SQLSTATE.test(code)) {
      return false;
    }
    texts.push(`${current.name ?? ""}: ${current.message ?? ""}`);
    if (code) {
      texts.push(`code: '${code}'`);
    }
    current = current.cause ?? current.sourceError;
  }
  return isConnectionFailure(texts.join("\n"));
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Call it after attempt `attempt` failed on the connection. It writes one log
 * line. When an attempt is left, it waits and returns true. When the attempts
 * are spent, it returns false and the caller fails.
 */
export const waitForRetry = async (label, attempt) => {
  if (attempt >= MAX_ATTEMPTS) {
    console.error(
      `[${label}] attempt ${attempt} of ${MAX_ATTEMPTS}: the connection to the database failed. No attempt is left.`,
    );
    return false;
  }
  const delay = RETRY_DELAYS_MS[attempt - 1];
  console.warn(
    `[${label}] attempt ${attempt} of ${MAX_ATTEMPTS}: the connection to the database failed. The next attempt starts in ${delay / 1000} s.`,
  );
  await sleep(delay);
  return true;
};
