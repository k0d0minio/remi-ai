# REMI-007 · Adopt Supabase officially and close the database question

|                |                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                          |
| **Type**       | decision + chore                                                                               |
| **Priority**   | P0 — Phase A; every Phase B ticket is blocked behind it                                        |
| **Size**       | An hour                                                                                        |
| **Depends on** | —                                                                                              |
| **Blocked by** | —                                                                                              |
| **Sources**    | Status report Phase A bullet 1 · `.icm/docs/braindump/developpement-produit/ai.md` · audit D-2 |

## Problem statement

The repository has spent months carrying an open question — Neon or Supabase — and the docs still
lean Neon (`apps/docs/app/technical/decisions/page.mdx`). The braindump closes it: V2's architecture
is "Supabase, workflows IA simplifiés, appels IA ciblés, limitation des coûts de génération". v1 also
ran on Supabase's auth, storage, cron and RLS, so the vendor is already proven against this domain.

Nothing technical is blocked by the decision being unrecorded — but everything downstream keeps
re-opening it. This ticket is the paperwork that stops that: write the decision down once, in the
place stages are told to read, and delete the alternatives.

## Required steps

1. Update the technical decision log (`apps/docs/app/technical/decisions/page.mdx`) to record
   Supabase as the chosen database, replacing the Neon leaning. Cite the braindump as the reason.
2. Sweep the repo for the Neon leaning and remove or correct each instance (the seam docs,
   `packages/services/AGENTS.md` if it names a vendor, any decision references).
3. Reserve the Supabase environment variables in the catalogue per the three-list rule —
   `.icm/docs/ENV.md`, the zod schema in `packages/services/src/server/env.ts`, and `globalEnv` in
   `turbo.json` — marked "not wired yet". Do not create an account or commit a key.
4. Note in the decision log that Supabase Auth is now the default answer to beat for the auth
   question (audit D-3), without deciding it here.

## Open questions — flag these on pickup

- **Which Supabase region and plan?** EU hosting is non-negotiable for health data, but the
  specific region and whether the free tier is adequate for the beta are unanswered. Raise before
  creating anything.
- **A new project, or the v1 project?** REMI-011 settles what happens to the v1 Supabase project.
  If it holds real patient data, the answer changes. Do not reuse it by default.
- **Who owns the account?** The tool register (REMI-012) should record the owner before a new
  project exists, not after.

## Acceptance criteria

- [ ] The decision log names Supabase and no longer leans Neon.
- [ ] No document in the repo still presents the database vendor as an open question.
- [ ] Supabase variables are reserved consistently across all three lists, with no value committed.
- [ ] The open questions above are raised with the owner, not answered by the agent.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/README.md for the
precedence order, then .icm/docs/braindump/developpement-produit/ai.md (section "Architecture
pragmatique V2").

Task: record Supabase as the chosen database and close the Neon-vs-Supabase question.
1. Rewrite the database entry in apps/docs/app/technical/decisions/page.mdx to name Supabase,
   citing the braindump. Remove the Neon leaning rather than hedging it.
2. Grep the repo for remaining Neon references and correct each one. Historical records under
   .icm/docs/history/ already carry a superseded banner — leave those alone.
3. Reserve the Supabase env variables under the three-list rule (.icm/docs/ENV.md + the zod schema
   in packages/services/src/server/env.ts + globalEnv in turbo.json), marked as not wired. Never
   commit a key or create an account.
Do not run build/lint/typecheck/format locally — the factory owns them. Push a branch, open a PR,
git mv this ticket into .icm/intake/_done/ in the same PR, and state the open questions above in
the PR body as questions for the owner. Do not answer them yourself.
```
