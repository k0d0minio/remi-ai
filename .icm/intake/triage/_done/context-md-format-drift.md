# Stub: `.icm/CONTEXT.md` fails `pnpm format:check` — pre-existing, not this PR's
> Done elsewhere — retired 2026-09-26 (estate audit): fixed by 4204a7b (#131), which formatted `.icm/CONTEXT.md`.

- lane: chore
- found-by: `fix-console-today-timezone` bug lane, `Quality (advisory)` on PR #130 · 2026-09-25
- size: S

## Problem

`Quality (advisory)` failed on PR #130's ready head (run 36133987394): `pnpm format:check`
(`prettier --check "**/*.{ts,tsx,md}"`, over the whole tree, not just the diff) flags
`.icm/CONTEXT.md`. The bug lane's own diff never touches that file — the last commit to touch it
(`e333b26`, #129) is already on `origin/main`, so the drift predates this PR and would fail
identically on any PR. `.icm/CONTEXT.md` is not in `.icm/MANIFEST`'s `T` list, so it is this repo's
own file to fix, not a template change request.

## Proposed change

Run the repo's formatter over `.icm/CONTEXT.md` alone and commit the result — a mechanical
`prettier --write`, no content change.

## Acceptance criteria (rough)

- [ ] `Quality (advisory)` on a fresh PR no longer flags `.icm/CONTEXT.md`.

## Prompt

Run `/pipeline chore context-md-format-drift` in the remi-ai repo. The lane pre-seeds from this
stub and moves it to `triage/_done/` when it opens the PR. Scope is the formatting fix alone —
`.icm/scripts/format.sh` won't catch it (changed-files-only); confirm with the advisory job on the
branch's own PR instead.
