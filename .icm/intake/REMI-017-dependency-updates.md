# REMI-017 · Enable automated dependency updates

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| Status         | ready                                                        |
| **Type**       | config + chore                                               |
| **Priority**   | P2 — before real users exist                                 |
| **Size**       | An hour                                                      |
| **Depends on** | REMI-011 (catalogue consolidation, so updates hit one place) |
| **Blocked by** | GitHub admin access (REQ-02) for the alerts toggle           |
| **Sources**    | audit F-36                                                   |

## Problem statement

Dependency updates are entirely manual: no Dependabot or Renovate config, no audit step in CI, and
whether GitHub's account-level alerts are on is invisible from the repo. CI does correctly use a
frozen lockfile — but nothing tells anyone a dependency has a known vulnerability.

## Required steps

1. Add a `dependabot.yml` (or Renovate config — pick one, state why) covering npm (pnpm
   workspaces + catalogue) and GitHub Actions, with a weekly batched schedule routed through the
   repo's chore lane conventions.
2. Enable Dependabot alerts and secret-scanning push protection at the repo level (needs admin;
   otherwise write the exact toggles into the PR).
3. Confirm the updater understands the pnpm catalogue (`pnpm-workspace.yaml`) — if the chosen
   tool can't update catalogue entries, that decides the tool.

## Acceptance criteria

- [ ] Weekly grouped update PRs arrive and pass through normal CI.
- [ ] Vulnerability alerts are on, verified or precisely delegated to the owner.
- [ ] Catalogue entries (not just per-package pins) get updated by the bot.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/audit-report.md
finding F-36.

Task: automate dependency updates.
1. This repo pins shared versions in the pnpm catalogue (pnpm-workspace.yaml). Verify current
   Dependabot support for pnpm catalogues; if solid, add .github/dependabot.yml with weekly
   grouped updates for npm and github-actions ecosystems. If catalogue support is lacking, use
   Renovate (renovate.json) instead and say so in the PR. Group minor/patch updates; leave majors
   individual.
2. If you have GitHub admin tooling, enable Dependabot alerts and secret-scanning push
   protection on the repo; otherwise list the exact settings toggles in the PR for the owner.
3. Follow the repo's commit-format conventions for the config the bot will use (check
   CONVENTIONS.md's git section for the commit prefix to configure).
Push a feature branch and open a PR.
```
