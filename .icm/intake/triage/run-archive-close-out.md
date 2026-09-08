# Stub: runs are never archived — no `close-out.sh`, no `runs/_done/`

- feature-slug: run-archive-close-out
- lane: chore
- priority: P2
- found-by: the `remi-ai-stage-collapse` session, 2026-09-08, writing the Release contract
- sources: `_system/template/icm-pipeline/scripts/close-out.sh` and its
  `stages/04_release/CONTEXT.md` § close-out (icm-board) · `.icm/runs/` (12 live folders, no
  `_done/`) · `.icm/runs/README.md` ("move its folder to `apps/docs/archive/`")

## What this is

The estate's template Release stage runs `.icm/scripts/close-out.sh <slug>` as **the last commit
on the branch**: it `git mv`s `.icm/runs/<slug>/` into `.icm/runs/_done/`, and the epic into
`.icm/intake/_done/` when the run was its last unshipped stub, so **the squash-merge is what
publishes the archive** and nothing has to run after it. Live folders then hold only live work —
a merged run still sitting in `runs/` is an alarm rather than a state.

remi-ai does none of this. It has no `close-out.sh` and no `runs/_done/`; `runs/README.md` says a
finished run is moved to `apps/docs/archive/` by hand, "once it is no longer being referenced",
which is a sweep nobody runs. All twelve run folders are still live, including the ones whose PRs
merged weeks ago, so `.icm/runs/` no longer says anything about what is in flight.

## Why it was parked, not fixed

The stage collapse rewrote the contracts; adopting close-out changes the **run lifecycle** — a new
script, a new `runs/_done/`, and a migration of the twelve existing folders into it. That is its
own change with its own review, and folding it into the collapse would have made a contract rewrite
into a data migration. remi-ai's Release contract therefore keeps the repo's current behaviour
("the run folder stays on `main` as the durable record") and this is the deliberate divergence from
the template.

## Proposed change

- Seed `close-out.sh` from `_system/template/icm-pipeline/scripts/`
- Create `.icm/runs/_done/` and move the runs whose PRs have merged into it, in one commit
- Add the close-out step to `.icm/stages/04_release/CONTEXT.md` (before the merge, on the branch —
  never a push to `main` afterwards: branch protection refuses it and the archive commit strands)
- Reconcile `.icm/runs/README.md` and `.icm/CONTEXT.md` with the new lifecycle, and retire the
  `apps/docs/archive/` instruction if nothing else uses it

## Acceptance criteria (rough)

- [ ] `close-out.sh` exists, reports `RESULT: CLOSED`, and commits on the run's branch
- [ ] Release runs it as its last commit before the squash-merge
- [ ] `.icm/runs/` holds only in-flight runs; the merged ones are under `runs/_done/`
- [ ] No contract still tells a stage to archive by hand after the merge
