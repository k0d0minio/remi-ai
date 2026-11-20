/**
 * The vocabulary of the console page « Modèles d'IA », for browser code. It
 * imports nothing. The AI seam and `server/ai-models` are server-only: they
 * read these lists, so that the two sides cannot differ.
 */

/** The three roles that a caller of the AI seam chooses between. */
export const aiModelRoles = ["fast", "balanced", "deep"] as const;

export type AiModelRole = (typeof aiModelRoles)[number];

/**
 * The checks that a model must pass before an admin sets it for a role, in
 * the order in which they run (`ai/model-checks.ts`).
 */
export type ModelCheck = "not_listed" | "no_structured_output" | "may_train";

/** What one test call to a model gave: `ok`, or the failure of the seam. */
export type ModelTestOutcome =
  "ok" | "schema_fail" | "refused" | "no_access" | "unknown_model" | "error";
