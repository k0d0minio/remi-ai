# REMI-010 · Delete dead exports; write down the seam exception

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Type**       | chore                                                                              |
| **Priority**   | P2                                                                                 |
| **Size**       | Hours                                                                              |
| **Depends on** | —                                                                                  |
| **Blocked by** | — (D-8 is pre-answered by the audit's recommendation: keep seams, delete the rest) |
| **Sources**    | audit F-01, F-05, F-13, D-8                                                        |

## Problem statement

The conventions say an export without a consumer is a review blocker, and about twenty exported
things have no user: nine client components/sub-parts, five style-variant exports, two animation
shells, helpers (`formatCurrency`, `formatDateTime`, `unwrap`), eight domain types, the entire
Tooltip component with its Radix dependency, and an unused `./globals.css` package export. The
deliberately pre-built seam entrypoints are a stated exception — but it is stated nowhere in the
code. Also: `date-fns` is catalogued but used by nothing, docs declares `@vercel/analytics` but
never renders it, and the three seam registries guard re-registration three different ways.

## Required steps

1. Delete the genuinely dead exports listed in F-01 (verify each is truly unimported first —
   the audit's line references are the map, the current code is the truth).
2. Delete the Tooltip component and its `@radix-ui/react-tooltip` dependency; remove the unused
   `./globals.css` export from `packages/ui/package.json`.
3. Annotate the deliberate seam entrypoints (`/server`, `/db`, `/ai`, `/email`) with a barrel
   comment naming the exception, and record the D-8 exception in CONVENTIONS.md.
4. Remove the `date-fns` catalogue line; either render `<Analytics />` in docs' layout or drop
   the dependency (pick rendering — every other app reports traffic).
5. Align the three seam registration guards on the db seam's strict behaviour (reject silent
   re-registration), per F-13.

## Acceptance criteria

- [ ] Every remaining export in both packages has an importer or a written exception.
- [ ] No unused dependencies in any manifest; lockfile updated.
- [ ] All three seams reject re-registration identically (tests updated if REMI-008 landed).
- [ ] CONVENTIONS.md carries the pre-built-seam exception.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md (lean rules ~lines 160-165),
then docs/audit-report.md findings F-01, F-05, F-13 and decision D-8.

Task: enforce "no export without a consumer", keeping the deliberate seam exception.
1. For each export F-01 lists (packages/ui/src/index.ts, server.ts, motion/index.tsx,
   packages/services/src/shared/index.ts), verify with a repo-wide search that nothing imports
   it, then delete it. Delete the Tooltip component file, its export, and the
   @radix-ui/react-tooltip dependency; remove the ./globals.css export from packages/ui if truly
   unread. Run pnpm install to update the lockfile.
2. Do NOT delete the seam entrypoints (/server, /db, /ai, /email in packages/services): they are
   deliberately pre-built. Add a one-line comment in each barrel naming this, and add the
   exception to CONVENTIONS.md's lean rules per decision D-8.
3. F-05: delete the date-fns line from pnpm-workspace.yaml; add <Analytics /> to
   apps/docs/app/layout.tsx so the declared dependency earns its place.
4. F-13: make the email and ai registries reject re-registration the same way the db registry
   does (packages/services/src/db/client.ts:40-44 is the model). Update any tests.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch, open a PR listing
every deleted export.
```
