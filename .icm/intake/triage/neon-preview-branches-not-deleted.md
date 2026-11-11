# Stub: The Neon integration keeps the preview branch after the git branch is deleted

- lane: bug
- found-by: `patient-home-navigation/app-shell-and-nav` · 2026-11-11
- complexity: research
- priority: P1

## Problem

`.icm/database/CONTEXT.md` says the Neon integration deletes `preview/<git branch>` when the git branch is deleted. It does not. On 2026-11-11 the Neon project `uat-remi-ai` held `main` and 9 preview branches. 8 of them belong to merged pull requests (#180, #181, #183 to #188) whose git branches GitHub deleted. With 10 branches, the project is at its branch limit. The integration cannot cut a branch for a new git branch, so the `app` and `admin` previews of #190 and #191 fail before the build, with no build log.

## Proposed change

Investigate why the integration does not delete the branch: its setting on the Vercel projects `app` and `admin`, or the plan. Then make the deletion reliable, or change the contract to name who deletes a preview branch and when.

## Acceptance criteria

- [ ] A merged pull request's Neon branch `preview/<git branch>` is gone within one day of the merge.
- [ ] `.icm/database/CONTEXT.md` names the act or the setting that deletes it.
- [ ] A new pull request gets its `app` and `admin` previews when 8 or more pull requests merged before it.
