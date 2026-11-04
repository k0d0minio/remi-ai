# Stub: The Neon preview branch of a merged pull request is deleted with its git branch

- lane: bug
- found-by: `consent-and-data/data-access-scoping` · 2026-11-04
- complexity: research
- priority: P1

## Problem

`.icm/database/CONTEXT.md` says the Neon integration deletes `preview/<git branch>` when the git
branch is deleted. On 2026-11-04 the Neon project `uat-remi-ai` held 9 preview branches. The git
branches of 7 of them were already deleted after their merge (#173 to #179). The project is at 10
branches, so a new git branch gets no database and its `admin` and `app` previews fail at build.

## Proposed change

Investigate why the integration keeps the branch. Then fix the setting, or add the delete to the
merge path, and correct `.icm/database/CONTEXT.md`.

## Acceptance criteria

- [ ] The merge of a pull request removes its `preview/<git branch>` branch from `uat-remi-ai`
- [ ] `.icm/database/CONTEXT.md` states what deletes a preview branch
