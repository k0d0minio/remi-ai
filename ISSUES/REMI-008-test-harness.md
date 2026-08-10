# REMI-008 · Stand up the test harness before the first adapter

| | |
| --- | --- |
| **Type** | chore (foundation) |
| **Priority** | P1 — must land before REMI-022 (database adapter) |
| **Size** | A day |
| **Depends on** | REMI-005 (so the new Test check can be made required) |
| **Blocked by** | — |
| **Sources** | audit F-26, checklist item 5 |

## Problem statement

The conventions commit to test-driven development for logic and a 75% coverage floor on the
database layer — and the repo has zero test files, no runner, no test dependency, and no CI step.
The plan bundles harness-bootstrapping into the first database-adapter PR (runner + coverage gate
+ CI wiring + the adapter at once), which is exactly how coverage floors get waived "just this
once". Meanwhile ~900 lines of testable pure logic already exist: locale/header parsing, cross-app
link building (the file that 404s every cross-app link if it regresses), formatters, the Result
type, env parsing, and the three seam registries.

## Required steps

1. Add Vitest + `@vitest/coverage-v8` to the pnpm catalogue (`pnpm-workspace.yaml`), and to the
   workspaces that need them — no literal version pins outside the catalogue (see REMI-011).
2. Convention: colocated `*.test.ts` files next to the source.
3. Add a `test` task to `turbo.json` and a Test step to `.github/workflows/quality.yaml`; make it
   a required check on `main` (with REMI-005's settings work).
4. Pre-wire the 75% coverage threshold scoped to `packages/services/src/db/**` so it is active
   the day the adapter lands, without failing while that directory has no logic.
5. Write the first test files covering the existing pure logic: `shared/i18n.ts` (its own comment
   advertises testability), `shared/links.ts`, formatters, the Result type, env parsing, and the
   three seam registration guards.
6. Decide the F-26 rider: extend `.claude/hooks/block-local-checks.sh` to cover local test runs
   too (factory owns checks), or document the exception — don't let the rule fork silently.

## Acceptance criteria

- [ ] `pnpm test` (via turbo) runs Vitest across workspaces; CI has a Test step gating PRs.
- [ ] The existing pure-logic modules have meaningful tests (not smoke tests) and they pass.
- [ ] The 75% floor for `src/db/**` is wired and documented.
- [ ] CONVENTIONS.md's testing section matches what now exists.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md (its testing commitments,
~lines 169-178), then docs/audit-report.md finding F-26.

Task: bootstrap the test harness, before any database adapter exists.
1. Add vitest and @vitest/coverage-v8 to the catalogue in pnpm-workspace.yaml and consume them
   via "catalog:" from packages/services and packages/ui (and any app that gains tests). Create
   minimal vitest configs; colocate tests as *.test.ts next to source.
2. Add a "test" task to turbo.json (correct inputs/outputs for caching) and a Test step to
   .github/workflows/quality.yaml after typecheck.
3. Pre-wire a 75% coverage threshold scoped to packages/services/src/db/** in a way that does not
   fail while that directory holds only the seam (document how it switches on).
4. Write real tests for: packages/services/src/shared/i18n.ts (locale/header parsing edge cases),
   shared/links.ts (every cross-app link shape, locale prefixes, env overrides), the formatters,
   the Result/unwrap helpers, env parsing, and the db/email/ai registration guards (loud failure,
   re-registration behaviour — note they currently differ per audit F-13; test current behaviour,
   don't change it here).
5. Handle the block-local-checks question: read .claude/hooks/block-local-checks.sh and
   CONVENTIONS.md:177, then either add test commands to the block list or document the exception
   in CONVENTIONS.md — one or the other, explicitly.
You may run "pnpm vitest run" to verify tests pass (the blocked commands are
build/lint/typecheck/format; if the hook blocks tests after your change, rely on CI instead).
Push a feature branch, open a PR, and read the CI result back.
```
