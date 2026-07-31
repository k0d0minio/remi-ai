import { z } from "zod";

/**
 * Every server-side environment read in the monorepo goes through here.
 *
 * Two reasons it is worth the indirection: a missing variable fails at boot with
 * the variable's name rather than as `undefined` three layers down, and
 * `docs/ENV.md` has exactly one file to stay in sync with. Adding a
 * `process.env.*` read anywhere else is a review blocker.
 */
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export const env = (): ServerEnv => {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`invalid server environment — check: ${names}`);
    }
    cached = parsed.data;
  }
  return cached;
};

/**
 * Read a variable that is optional in the schema but required by the code path
 * asking for it — so the failure names the caller as well as the variable.
 */
export const requireEnv = <K extends keyof ServerEnv>(
  key: K,
  usedBy: string,
): NonNullable<ServerEnv[K]> => {
  const value = env()[key];
  if (value === undefined || value === "") {
    throw new Error(
      `${String(key)} is not set — required by ${usedBy}. Add it in Vercel and document it in docs/ENV.md.`,
    );
  }
  return value as NonNullable<ServerEnv[K]>;
};
