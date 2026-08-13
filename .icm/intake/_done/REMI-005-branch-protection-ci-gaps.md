# REMI-005 · Branch protection, required checks, squash merge; close the docs-only check gap

|                |                                                        |
| -------------- | ------------------------------------------------------ |
| Status         | done — settings applied by the owner at merge          |
| **Type**       | config + chore                                         |
| **Priority**   | P0 — everything after this inherits its safety from it |
| **Size**       | Hours                                                  |
| **Depends on** | —                                                      |
| **Blocked by** | GitHub admin access (REQ-02) for the settings half     |
| **Sources**    | audit F-22, F-23, F-45, checklist item 3               |

## Problem statement

Three related enforcement gaps: (1) PRs touching only markdown or `pipeline/**` skip the Quality
workflow entirely (`paths-ignore`), which — depending on an invisible branch-protection setting —
is either a merge deadlock for docs PRs or a hole where a red check blocks nothing. (2) The
pipeline's two human gates ("Spec approved", "Ready to merge") are checkboxes nothing verifies,
while agent tooling is pre-approved to run `gh pr merge` without a prompt. (3) The repo's own
squash-merge rule has never been practiced — all 29 merged PRs landed as ordinary merge commits.

## Required steps

1. **Workflow fix (code):** remove `paths-ignore` from `.github/workflows/quality.yaml` so the
   Quality check runs on every PR; let jobs no-op cheaply on doc-only diffs. Markdown formatting
   then gets checked too.
2. **Branch protection (GitHub settings, needs admin):** require the Quality check on `main`,
   require a PR (no direct pushes), and configure squash-merge as the only merge method.
3. **Gate enforcement:** add a small workflow that fails when a gate anchor from
   `.github/pull_request_template.md` is present and unticked.
4. **Remove the trapdoor:** delete `gh pr merge` from the pre-approved commands in
   `.claude/settings.json`.

## The settings half — what the owner applied

Steps 1, 3 and 4 landed in code. Step 2 is repository settings, which no agent token here can read
or write (`GET /branches/main/protection` → 403), so the owner applied it by hand alongside this
PR. Recorded here because settings live outside the repo and are otherwise invisible to it:

**GitHub → Settings → Branches → rule for `main`** (or the equivalent ruleset):

- ✅ Require a pull request before merging — no direct pushes to `main`.
- ✅ Require status checks to pass before merging, with these two contexts (they are the job
  names, so they must match exactly):
  - `Format, lint, typecheck` — the `Quality` workflow.
  - `Pipeline gates` — the `Gates` workflow.
- ✅ Require branches to be up to date before merging.
- ✅ Block force pushes and branch deletion.
- ✅ Do not allow bypassing the above settings — a rule administrators can step around is the
  honour system with extra steps.

**GitHub → Settings → General → Pull Requests:**

- ✅ Allow squash merging — and **uncheck** "Allow merge commits" and "Allow rebase merging", so
  `CONVENTIONS.md`'s squash rule is the only thing the button can do (audit F-45).
- ✅ Automatically delete head branches after merge.

## Acceptance criteria

- [x] Quality workflow runs on a docs-only PR (verify with this ticket's own PR).
- [x] `main` requires the Quality check and a PR; squash is the only merge method.
- [x] A PR with an unticked gate checkbox fails a required check.
- [x] Agent sessions can no longer merge without a human prompt.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
findings F-22, F-23, F-45.

Task: make "merge only on green, past a human gate" mechanically true.
1. Edit .github/workflows/quality.yaml: remove the paths-ignore block so the workflow triggers on
   all PRs. Keep the jobs cheap on doc-only diffs (turbo's cache and affected-detection already
   help; do not build custom skip logic that reintroduces the hole).
2. Add a workflow (e.g. .github/workflows/gates.yaml) that reads the PR body and fails if a gate
   checkbox from .github/pull_request_template.md ("Spec approved", "Ready to merge") exists and
   is unticked. Minimal permissions; treat PR bodies as untrusted input.
3. Edit .claude/settings.json: remove "gh pr merge" from any pre-approved allowlist.
4. Using GitHub admin access if available (API/MCP tools): on main, require the Quality check and
   the gates check, require PRs, and set squash-merge as the only allowed method. If you lack
   admin rights, write the exact settings changes into the PR description for the owner.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch, open a PR, and
confirm in it that the Quality workflow ran on the PR (it is itself partly docs-only, which
proves the fix).
```
