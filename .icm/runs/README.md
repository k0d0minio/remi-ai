# Runs

Active `/pipeline` runs live here — one folder per feature slug, while the feature is in flight.
**A folder in this directory means work that has not shipped.** That is the whole point of the
split: a merged run still sitting here is an alarm, not a state.

A run folder is created by Scope (or by Define for work that skips the front), committed to git from
the start, and carried onto `main` by Release's squash-merge. That merge is what makes it the
durable record of what was specced, built and released.

**Completed runs are archived by `close-out.sh`, not by hand.** Release's second-to-last step runs

```bash
.icm/scripts/close-out.sh <slug>
```

on the run's own branch, before the merge. It `git mv`s `.icm/runs/<slug>/` into
`.icm/runs/_done/<slug>/` — and the intake epic into `.icm/intake/_done/` when the run was its last
unshipped stub — and commits both. **The squash-merge is what publishes the archive**, so nothing
runs afterwards: a close-out that pushed to `main` would be refused by branch protection, and an
archive commit stranded on an unmerged branch leaves every shipped run sitting here forever.

`_done/` is the archive: the durable paper trail of what was specced, built and released. Read it
for the history of a shipped feature; never cite an archived run as current truth — that is
`apps/docs/app/business/**` and `app/technical/**`. Nothing is deleted, and the factory scripts
(`resolve-run.sh`, `ci-status.sh`, `send-ship-note.sh`, `project-labels.sh`) read `_done/` as
readily as the live folder, so a closed-out run stays fully addressable by its slug.

Never hand-create a folder here to "resume" a run. If `resolve-run.sh` says `STOP`, the run does not
exist and fabricating it orphans the real one — see `.icm/_shared/stage-preamble.md`.
