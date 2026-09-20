# Stub: the ready flip's empty commit leaves a PR with no preview to smoke-test

- lane: chore
- found-by: recipe-feedback-and-favourites (Build) · 2026-09-20

## Problem

Build's step 10 flips the PR ready and then pushes "an empty commit when nothing is pending", so
the full gate and the previews settle on a fresh head. In this repo the empty commit does the
opposite: Vercel's Ignored Build Step sees a commit that changed no files, skips all six projects,
and the Vercel bot rewrites its comment with every `previewUrl` blank. The head is green with no
preview URL on it, and `ci-status.sh` says so plainly — "Previews built for this commit: none …
there is no preview URL to test against".

The previews are not lost — the branch aliases (`app-git-<branch>-remi21.vercel.app`) still serve
the last real build, which is the same code — but the operator is asked to smoke-test a preview
before ticking **Ready to merge** and the PR no longer shows them one. Seen on #114, head
`cfd6bcb` (empty) against `e57cd5d` (the code).

## Proposed change

Investigate — the contract is template-owned (`.icm/stages/03_build/CONTEXT.md` step 10), so the
fix is either in the template, in the Ignored Build Step, or in `ci-status.sh` surfacing the
branch aliases when the head itself skipped. Cheapest of the three: have `ci-status.sh` fall back
to the branch alias and name the commit it was built from, rather than reporting no preview at
all. Whatever is chosen, the flip should leave the operator with a URL.
