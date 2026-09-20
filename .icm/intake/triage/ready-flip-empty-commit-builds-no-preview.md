# Stub: The post-flip empty commit builds no preview, so a ready head has nothing to smoke-test

- lane: chore
- found-by: the `patient-profile-edit` Build · 2026-09-20
- size: S

## Problem

Build's step 10 flips the PR ready and then pushes — an empty commit when nothing is pending —
because "previews build per push: the post-flip push is what makes the full-tier run and the
affected product-app previews materialise on a fresh head". In this repo it makes the opposite
happen.

Every app's `vercel.json` carries `ignoreCommand: npx turbo-ignore <package> --fallback=HEAD^1`.
With no previous successful deployment of that project to compare against, turbo-ignore falls back
to diffing `HEAD^1` — the commit immediately before. An empty commit diffs to nothing, so **every**
project answers "Skipped - Not affected" and `ci-status.sh` reports:

> Previews built for this commit: none — every Vercel project was skipped or is still pending;
> there is no preview URL to test against

The verdict is still a legitimate `GREEN` — nothing failed — but the head the operator is asked to
smoke-test before ticking **Ready to merge** has no preview of its own. On `patient-profile-edit`
the usable previews sat two and three commits back (`apps/web` on the commit before last,
`apps/admin` on the last non-empty one), and Build had to go and find them by hand.

This is not specific to that run: it happens on every spine PR whose last real commit does not
touch every affected app, which is most of them.

## Proposed change

Pick one; the first is the smaller change.

- **Make the post-flip push carry a real diff.** Build already owes `notes.md` its settled `ci:`
  line at exactly this moment — writing it in the post-flip commit instead of before the flip makes
  the push non-empty. It does not fix the deeper issue: a `.icm/`-only diff still leaves
  turbo-ignore skipping every app, so this alone is not enough.
- **Compare against the base branch rather than the previous commit.** `--fallback=origin/main`
  (or turbo-ignore's `--base`) makes the question "is this app affected by the PR", which is the
  question the operator's smoke-test is asking. It costs a rebuild of every affected app on every
  push, which is what a preview is for.
- **Have `ci-status.sh` fall back to the newest successful preview on the branch.** Keeps the
  builds cheap and gives the operator a URL, but the URL is then not the head they are ticking,
  which needs saying out loud wherever the script prints it.

The branch-alias URLs (`app-git-<branch>-remi21.vercel.app`) already serve the newest successful
deployment for the branch, so option three is mostly a reporting change.

## Notes

Worth settling before the next Release, since **Ready to merge** attests a preview smoke-test and
the contract currently tells the operator to test a head that has no preview.
