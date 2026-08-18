# REMI-016 · Stand up the test harness

|                |                                                                    |
| -------------- | -------------------------------------------------------------------- |
| Status         | ready                                                              |
| **Type**       | chore                                                              |
| **Priority**   | P0 — Phase B; do it *before* the first adapter, not with it        |
| **Size**       | A day                                                              |
| **Depends on** | —                                                                  |
| **Blocked by** | —                                                                  |
| **Sources**    | Status report Phase B bullet 4 · audit F-26                        |

## Problem statement

There are zero test files, no runner and no CI step, against a stated commitment to test-driven
development and 75% coverage. The deleted v1 had 74 test files — more than this monorepo has today.

The ordering matters and the audit is explicit about it: stand the harness up **before** the first
database adapter, not alongside it. Bootstrapping harness, adapter and coverage floor in one PR is
exactly how the floor gets waived.

## Required steps

1. Add Vitest — it fits this stack with no extra build machinery — configured for the monorepo.
2. Write the first tests against the pure logic that already exists: locale parsing, link building,
   formatters, env parsing. Roughly 900 lines of it, all pure, all testable today.
3. Add the CI step to `.github/workflows/quality.yaml` so it gates every PR.
4. Set the coverage floor deliberately and low enough to be true, then raise it as coverage grows.
   A floor that has to be waived on its first PR is worse than no floor.
5. Document how to write and run tests in the conventions, once, where the Build stage reads it.

## Open questions — flag these on pickup

- **What coverage floor is honest to start at?** The stated commitment is 75%; starting there on
  day one would fail the first PR. Propose a starting figure and a ramp.
- **Do component tests belong in this ticket?** The pure logic is unambiguous; React component and
  route-handler testing brings choices (Testing Library, mocking strategy) that may deserve their
  own pass.
- **Does the docs app get the same treatment?** It is exempt from the boundary lint rules already
  (audit F-02); whether that exemption extends to tests is undecided.

## Acceptance criteria

- [ ] `vitest` runs in the monorepo and in CI, gating every PR.
- [ ] The existing pure logic has real tests — not placeholder ones.
- [ ] A coverage floor exists, is enforced, and was not waived to make the first PR pass.
- [ ] How to write tests here is documented once, in the conventions.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then
.icm/docs/history/audit-report.md finding F-26.

Task: stand up the test harness before any database adapter exists.
1. Add Vitest, configured for the Turborepo workspace layout.
2. Write real tests for the pure logic that already exists — locale parsing, link building,
   formatters, env parsing in packages/services and the apps' lib directories. Find it, don't
   assume the list is complete.
3. Add the CI step to .github/workflows/quality.yaml so it gates PRs.
4. Set a coverage floor you can actually meet on this PR, and say in the PR body what the ramp to
   the stated 75% commitment should be.
5. Document the testing approach once, in CONVENTIONS.md.
Do not run build/lint/typecheck/format locally — the factory owns them; you may run the test suite
itself. Push a branch, open a PR, git mv this ticket into .icm/intake/_done/, and read the check
results back from the PR.
```
