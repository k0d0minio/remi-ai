import { defineConfig } from "drizzle-kit";

/**
 * Migrations are generated from the schema (`pnpm db:generate`) into
 * `src/db/migrations/` and checked in; `pnpm db:migrate` applies them. Never
 * change the live schema any other way.
 *
 * The literal `process.env` read is a documented carve-out from the `env()`
 * rule: drizzle-kit is a CLI that loads this file outside the app process,
 * where the zod schema and its cache do not exist.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
