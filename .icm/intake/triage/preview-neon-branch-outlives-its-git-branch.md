# Stub: A preview's Neon branch outlives its git branch

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: low
- priority: P1

## Problem

The Vercel-managed Neon integration deletes `preview/<git branch>` when the Vercel deployment is
deleted, not when the git branch is deleted. On the Pro plan a preview deployment lives 180 days.
On 2026-10-31 the branches of the merged pull requests #151 and #153 and of the closed #154
were still in `uat-remi-ai`. Jamie deleted them by the Neon API. The second Done line of the
setup stub `github-delete-head-branches` (« Its Neon branch is gone from the Neon project »)
cannot pass as written.

On 2026-11-01 the project reached its limit of 10 branches. Five branches of merged pull requests
remained: #155, #156, #157, #158 and #160. The integration could not cut a branch for #163, and
the `admin` and `app` previews failed before the build. Jamie approved the delete of the five, and
a session deleted them by the Neon API. At three or four pull requests a day, the limit comes back
in days. Thus the priority is P1.

## Proposed change

Jamie chooses one: shorten Vercel → project → Settings → Deployment Retention Policy →
Pre-Production Deployments on `app` and `admin`, or add a job on `pull_request: closed` that
deletes `preview/<branch>` with the Neon API (`neondatabase/delete-branch-action`). Then reword
or drop the stub's second Done line. The stub comes from the blueprint, so the wording change
goes there too.

## Acceptance criteria

- [ ] One week after a merge, `uat-remi-ai` holds no `preview/<branch>` of a closed pull request.
- [ ] The setup stub `github-delete-head-branches` has a Done line that the installed integration can pass.
