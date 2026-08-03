/**
 * Cross-app URLs. Anything this site links to that it does not itself serve is
 * built from a variable rather than typed as a literal — each app is its own
 * Vercel project, so the host differs per environment and only the env var
 * knows which one is current.
 *
 * `lib/metadata.ts` owns `siteUrl` for the same reason; it lives there because
 * `metadataBase` needs it, not because it is a different kind of value.
 */

/**
 * The support centre — a separate deployment, so an origin rather than a path.
 * The localhost fallback is the port it runs on under `pnpm dev`, which is what
 * makes the link work in a local run with no environment file.
 *
 * Read straight from `process.env` rather than through `@remi/services/server`'s
 * `env()`: a `NEXT_PUBLIC_*` variable is inlined into the bundle at build time,
 * and that only happens for a literal `process.env.NAME`. Registered in
 * turbo.json's globalEnv and docs/ENV.md.
 */
export const supportUrl =
  process.env.NEXT_PUBLIC_SUPPORT_URL ?? "http://localhost:3004";
