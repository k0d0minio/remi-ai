# REMI-006 · Fix the documentation drift batch

|                |                                                                        |
| -------------- | ---------------------------------------------------------------------- |
| **Type**       | chore                                                                  |
| **Priority**   | P0 (cheap now, misleading forever if left)                             |
| **Size**       | Half a day                                                             |
| **Depends on** | —                                                                      |
| **Blocked by** | —                                                                      |
| **Sources**    | audit F-21, F-25, F-44, F-46, F-47, F-48, F-19, F-20, checklist item 4 |

## Problem statement

The repo's strongest claim — every rule lives in exactly one place — has already failed five
times: the pipeline scripts don't know the `support` app exists (a hard error waiting for the
first support feature), four documents tell the Scope stage the business pages are unwritten when
they were written a week ago, the packages docs page describes a structure two versions old, a
deleted automation is still documented as live with its dead script on disk, and several rule
restatements have drifted. Plus small env-catalogue residue (F-19, F-20).

## Required steps

1. **F-21:** add `support` to `pipeline/scripts/validate-spec.sh`, `pipeline/scripts/project-labels.sh`,
   and the templates in `pipeline/stages/03_define/CONTEXT.md` and `pipeline/intake/CONTEXT.md`.
2. **F-44:** correct the four "stubs / aren't written yet" claims in
   `pipeline/stages/01_scope/CONTEXT.md`, `pipeline/intake/CONTEXT.md`,
   `pipeline/_shared/github.md`, `.github/labels.yml`.
3. **F-25:** delete `.claude/hooks/route-request.sh`; fix `.claude/skills/pipeline/SKILL.md` and
   the "read-only" mislabel in `.claude/SKILLS.md`.
4. **F-47:** rewrite `apps/docs/app/technical/packages/page.mdx` from the AGENTS files (or reduce
   it to pointers at them).
5. **F-46:** fix the remaining drifted duplicates (marketing AGENTS `urls.ts` reference, command
   lists missing `support:dev`, "the five apps"), then thin the worst prose duplications to
   pointers.
6. **F-48:** the residue list — eslint error message pointing at a nonexistent section, the
   Layer 3/Layer 0 contradiction, "enforces" vs warning wording.
7. **F-19/F-20:** fix the six-vs-seven `NODE_ENV` carve-out sentence in
   `packages/services/AGENTS.md`; add or exempt a `NODE_ENV` row in `docs/ENV.md`; delete the
   ghost `NEXT_PUBLIC_ANALYTICS_KEY` row and its `turbo.json` entry; document `env:pull` and
   `GITHUB_API_URL`.

## Acceptance criteria

- [ ] A spec naming only the support app passes `validate-spec.sh` and `project-labels.sh`.
- [ ] No document claims the business pages are unwritten.
- [ ] No unreachable hook script on disk; skill docs match reality.
- [ ] The packages docs page matches `packages/ui/tsup.config.ts` and the AGENTS files.
- [ ] `docs/ENV.md` has no ghost variables and no uncatalogued readers.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
findings F-19, F-20, F-21, F-25, F-44, F-46, F-47, F-48 — each names exact files and lines.

Task: fix all catalogued documentation/config drift in one sitting. Work finding by finding:
F-21 (add support to the two pipeline scripts and two stage templates), F-44 (four stale "stub"
claims), F-25 (delete the dead hook script, fix two skill-doc sentences), F-47 (rewrite the
packages docs page from packages/ui/AGENTS.md and packages/services/AGENTS.md, or reduce it to
pointers), F-46 (the other drifted duplicates it lists, then thin repeated prose rules to
pointers at their canonical home), F-48 (the four small inconsistencies), F-19/F-20 (env-catalogue
residue: NODE_ENV carve-out count and row, ghost NEXT_PUBLIC_ANALYTICS_KEY, undocumented env:pull
and GITHUB_API_URL).

Rules: change meaning only where the audit says the doc is wrong; where two copies disagree,
verify against the code before picking the survivor. Run the two pipeline shell scripts with a
test spec naming the support app to prove F-21 is fixed (shell scripts are fine to run; the
blocked commands are build/lint/typecheck/format).
Push a feature branch and open a PR with a per-finding checklist of what changed.
```
