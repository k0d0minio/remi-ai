> Dropped: #141 removed `release.yaml` before this stub started, 2026-10-27.

# Stub: Retire release.yaml after the blueprint release

- lane: chore
- found-by: the blueprint `v1.0.0` conformance (`chore/conform-blueprint-v1.0.0`) · 2026-10-27
- complexity: low
- priority: P1

## Problem

The repo has two release paths. Jamie answered `release: true` and `uat: true` on 2026-10-27.
Thus `ci.yml` calls the blueprint's release job: release-please keeps one release pull request
open on `main`, and the merge of that pull request makes the release tag.
`.github/workflows/release.yaml` is the repo's own workflow from before the blueprint. It runs
on the merge of each pull request to `main`. It cuts a GitHub Release (`release/<date>-pr-<n>`)
and posts it to Slack. Its header says that the merge is the production release.

With UAT, that is not true. A ticket's merge reaches UAT only. Production moves on a promotion.
Thus each ticket's merge gives a false "release" in GitHub and in Slack. The merge of the
release pull request gives two GitHub Releases: one from release-please and one from
`release.yaml`.

Files: `.github/workflows/release.yaml`, `CLAUDE.md` § Release, `.icm/docs/ENV.md` (the names
`SLACK_BOT_TOKEN` and `SLACK_ANNOUNCE_CHANNEL_ID`), `.icm/docs/slack-app-manifest.yaml`.

## Proposed change

Remove `.github/workflows/release.yaml`. Before the removal, ask Jamie if the Slack post stays.
If yes, the Slack post must come from the blueprint: name the change for the blueprint's
release or promotion, and do not edit a rendered workflow here.

## Acceptance criteria

- [ ] `.github/workflows/release.yaml` is not in the repo.
- [ ] The merge of a ticket to `main` cuts no GitHub Release and posts nothing to Slack.
- [ ] The merge of the release pull request gives one GitHub Release only: release-please's.
- [ ] `CLAUDE.md` § Release does not name `release.yaml`.
- [ ] `.icm/docs/ENV.md` and `.icm/docs/slack-app-manifest.yaml` agree with Jamie's answer on the Slack post.
