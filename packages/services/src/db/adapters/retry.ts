/**
 * When a failed query is sent a second time.
 *
 * Neon closes a socket that stays idle, and it suspends an idle compute. The
 * pool does not always see it first: the next query goes out on a dead socket
 * and fails with a connection error, not with an answer of Postgres. A second
 * try gets a new socket and succeeds.
 *
 * Only a read is sent again. A write that failed in flight may have run, and a
 * second `insert` would then write twice. A write shows its error, and the
 * person sends it again.
 */

/** A SQLSTATE: five characters, on every error that Postgres itself answers. */
const hasSqlState = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code: unknown }).code === "string" &&
  /^[0-9A-Z]{5}$/.test((error as { code: string }).code);

const textOf = (query: unknown): string => {
  if (typeof query === "string") {
    return query;
  }
  if (typeof query === "object" && query !== null && "text" in query) {
    const text = (query as { text: unknown }).text;
    return typeof text === "string" ? text : "";
  }
  return "";
};

/** A plain `select`. Not `select … for update`, which holds a lock. */
export const isRead = (query: unknown): boolean => {
  const text = textOf(query).trim().toLowerCase();
  return text.startsWith("select") && !/\bfor\s+(update|share)\b/.test(text);
};

/**
 * True for a read that failed with no answer of Postgres: the connection
 * failed, not the statement. An error with a SQLSTATE is an answer, and the
 * same statement would fail the same way.
 */
export const isRetryableRead = (query: unknown, error: unknown): boolean =>
  isRead(query) && !hasSqlState(error);
