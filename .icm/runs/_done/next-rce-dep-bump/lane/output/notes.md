# Chore: next-rce-dep-bump

- invariant: no behaviour changes for any persona; `pnpm audit --audit-level=high` on the branch
  reports no high/critical advisory (verified: 20 high/critical resolved, 8 low/moderate remain,
  all below the `--audit-level=high` threshold).
- change: `pnpm-workspace.yaml` catalog: `next` `^16.2.3` → `^16.3.6` (patches the unauthenticated
  RCE and the AVIF Image Optimization RCE, both `>=16.0.0 <16.3.3`). `apps/{admin,demo,marketing,
  support,web}/package.json`: `postcss` `^8.5.6` → `^8.5.28` (patches the source-map path-traversal
  and arbitrary-file-read advisories, both `<=8.5.17`/`<=8.5.11`). Root `package.json` →
  `pnpm.overrides`: added `sharp: 0.35.4` (libheif/libvips CVEs via `next`), `nanoid: ^3.3.19`
  (infinite-loop advisory via `postcss`), `js-yaml: ^4.3.2` (quadratic-CPU advisories via
  `eslint`'s `@eslint/eslintrc`), `@xmldom/xmldom: ^0.9.12` (the six xmldom advisories via
  `nextra` → `better-react-mathjax` → `mathjax-full` → `speech-rule-engine`) — all transitive, so
  pinned by override rather than a direct dependency bump. `pnpm-lock.yaml` regenerated with
  `pnpm install`; no manifest range was widened beyond what resolves the advisories.
- rollback: revert the four manifest files and `pnpm-lock.yaml`, then `pnpm install` — a forward-only
  repo, and reverting drops no schema (no migration in this change).
- learned: none
