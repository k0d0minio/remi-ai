# Runs

Active `/pipeline` runs live here — one folder per feature slug, while the feature is in flight.

A run folder is created by Scope (or by Define for work that skips the front), committed to git from
the start, and carried onto `main` by Ship's squash-merge. That merge is what makes it the durable
record of what was specced, built and verified.

**Completed runs are archived.** Once a run is shipped and no longer being referenced, move its
folder to `apps/docs/archive/` — unlisted, excluded from navigation, never canonical. This folder
stays small enough to see the current state of the world at a glance; the archive holds the history.

Never hand-create a folder here to "resume" a run. If `resolve-run.sh` says `STOP`, the run does not
exist and fabricating it orphans the real one — see `pipeline/_shared/stage-preamble.md`.
