# Chore: run-archive-close-out

- invariant: no product behaviour changes and no app code is touched. What differs is the **run
  lifecycle**: a shipped run is archived into `.icm/runs/_done/` by `close-out.sh` on its own
  branch, so `.icm/runs/` holds only work that has not shipped. Retires
  `.icm/intake/triage/run-archive-close-out.md`.

- change: `.icm/runs/_done/` — created by migrating all twelve run folders into it. Every one had a
  merged PR behind it (#65–#80), so the live folder said nothing about what was in flight.
  `close-out.sh <slug>` was run for each — its already-merged recovery path — and the twelve moves
  collapsed into one migration commit. The `patient-record` and `patient-surface` epics rode along
  into `.icm/intake/_done/`: both were fully spun out and fully shipped, and with their runs
  archived no future close-out would ever have reached them. `patient-workspace` has five live
  stubs and stays put; `triage/` is exempt by design.

- change: `.icm/stages/04_release/CONTEXT.md` — new **step 9, close out the run**, between the
  `release.md` push and the merge, with the following steps renumbered. It is the last commit on
  the branch, so the squash-merge is what publishes the archive: a close-out that pushed to `main`
  would be refused by branch protection, and the archive commit would strand on a branch nobody
  merges. `release.md` gains a `closed out:` line; Verify gains the two matching checks.

- change: `.icm/scripts/{resolve-run,ci-status,send-ship-note,project-labels}.sh` — each now reads
  `.icm/runs/_done/<slug>/` when the live folder is gone. Without this the close-out breaks the
  three steps that follow it: Release re-establishes green (`ci-status.sh`) and sends the ship note
  (`send-ship-note.sh`) _after_ the folder has moved, and `project-labels.sh` re-projects on the
  close-out push. The fallback is the pattern `close-out.sh` already uses for its sibling lookups.

- change: `.github/workflows/pipeline.yaml` — the labels job derived its slug with
  `cut -d/ -f3`, which reads `_done` as the slug for an archived path. It now normalises the
  optional `_done/` segment away and looks for the spec under both roots. The advisory spec-check
  matches archived paths too, and skips a path the diff lists but the tree no longer has.

- change: `.icm/runs/README.md` · `.icm/CONTEXT.md` · `.icm/_shared/github.md` ·
  `.claude/skills/pipeline/SKILL.md` — reconciled with the new lifecycle. The old instruction to
  move a finished run to `apps/docs/archive/` "once it is no longer being referenced" was a sweep
  nobody ran; it is gone, and with it `apps/docs/archive/` (empty but for its README) and the
  `## Archive` section of `apps/docs/AGENTS.md`. Nothing else referenced either.

- rollback: `git revert` the whole PR. The archive is a `git mv`, so the revert restores all twelve
  folders and the two epics to their live paths; the script fallbacks and the contract steps are
  additive and revert cleanly with them. No migration, no env var, no data outside git.
