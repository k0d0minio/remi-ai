# Runs — one folder per unit of work in flight

`runs/<slug>/` is a run's working home: `run.md` (the pointer index — lane, stub, branch, PR,
and a `- db:` line when `db-branch.sh` bound a database), `usage.md` (one `- usage:` line per
stage start and end, appended by `usage-snapshot.sh`, never edited), the **canonical file pack**
(below) plus each stage's `output/`. Spine runs carry `02_define/output/spec.md` and
`03_build/output/notes.md` (Release appends its `## Release` record there); lane runs carry
`lane/output/notes.md` instead — and, where something failed on the way, an `error.log` beside
it (each error and its fix; `retrospective.sh` reads it at Release, and the archive keeps it so
later runs can count what recurs). A **front** run — Scope — carries `01_scope/_source/story.md`
and `01_scope/output/scope.md`, and opens no PR of its own.

```md
# Run: <slug>

- lane: feature # or front | bug | tweak | chore | hotfix | handover
- stub: intake/<epic>/<slug>.md # when spun from one
- branch: claude/<slug> # recorded, not enforced — written by new-run.sh
- pr: #456 # the ONE PR — written by new-run.sh (a front has none)
- db: schema run_<slug> (via $DATABASE_URL) # written by db-branch.sh up, removed by down
```

**The canonical file pack** — seven plain-text files at the root of every live run, seeded by
`new-run.sh` (through `.icm/scripts/run-pack.sh --init`) and by Scope for a front, so a session
on any machine can resume from what the last one left, not from memory:

| file           | one job                                                                                                                                                                    | who writes it                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `project.md`   | the context card — pointers to stub, scope, spec; touches; constraints                                                                                                     | seeded; Define fills the gaps                                                                                                   |
| `plan.md`      | the execution plan in passes, one layer each                                                                                                                               | Define (the advisor); Build rewrites when reality disagrees                                                                     |
| `tasks.md`     | the queue with a definition of done per item (`- [ ]`, human checkboxes)                                                                                                   | seeded from the spec's criteria; Build ticks                                                                                    |
| `decisions.md` | the `D-n` ids the run rests on, and any it made itself                                                                                                                     | seeded from the scope; any stage that decides                                                                                   |
| `status.md`    | phase · step · ci · blocked · updated — read first on a resume                                                                                                             | every stage, at start, stop and every flag flip                                                                                 |
| `handoff.md`   | next steps and blockers for the next session — rewritten at every stop                                                                                                     | every stage, last thing before it stops                                                                                         |
| `FAILURE.md`   | what the run learned that no tool logged — a wrong assumption, a STOP, a rewritten plan — and its learned rules (a tool's error is an `error.log` entry, `retrospective.sh`'s) | the stage that learned it; `close-out.sh` copies the rules into `_shared/project-rules.md` (`run-pack.sh --sync-rules`) |

`run-pack.sh <slug> --check` says whether a run has all seven. The `03_build/output/error.log`
(a lane: `lane/output/error.log`) is where `security-check.sh` writes its redacted trace when it
blocks a commit — read it, never commit around it. The one run live when the pack arrived
(`patient-home-today`, 2026-09-23) predates it: its stage seeds the pack with `run-pack.sh
<slug> --init` at its next step rather than by hand.

**A run only ever writes inside its own folder, on its own branch** — that is what lets several
runs be in flight at once: each stage's working artifacts land under `runs/<slug>/<stage>/`, the
run is bound to `claude/<slug>`, and no two live runs share a working tree
(`.icm/_shared/stage-preamble.md` → Run-scoped isolation). A run's database is its own too
(`db-branch.sh`), where the repo declares one — this repo does not yet
(`_shared/project-rules.md` → The run's database).

**A folder in this directory means work that has not shipped.** That is the whole point of the
split: a merged run still sitting here is an alarm, not a state.

**Completed runs are archived by `close-out.sh`, not by hand.** Release (and every lane) runs

```bash
.icm/scripts/close-out.sh <slug>
```

on the run's own branch, before the merge. It `git mv`s `.icm/runs/<slug>/` into
`.icm/runs/_done/<slug>/` — and the intake epic into `.icm/intake/_done/` when the run was its
last unshipped stub, taking the front run that cut the epic along — copies the run's
`FAILURE.md` learned rules into `_shared/project-rules.md`, and commits it all. **The
squash-merge is what publishes the archive**, so nothing runs afterwards and nothing sweeps this
folder: the merge does it, or nobody does. A run found here after its PR merged is a Release that
skipped the step; `close-out.sh` still accepts it on a fresh branch, and the move reaches `main`
on that branch's own PR.

**A front has no PR of its own, so its epic is its merge.** Scope pushes straight to `main`; a
front-only run (`01_scope` only, no `- pr:` line) is archived with its epic, in the same
close-out commit, once every stub the epic cut has shipped. A front whose epic is still in
`.icm/intake/` stays here: it is the live head of a batch still being spun out.

`_done/` is the archive: the durable paper trail of what was specced, built and released. Read
it for the history of a shipped feature; never cite an archived run as current truth — that is
`apps/docs/app/business/**` and `technical/**`. Nothing is deleted, and the factory scripts
(`resolve-run.sh`, `ci-status.sh`, `close-out.sh`, `project-labels.sh`, `retrospective.sh`,
`client-status.sh`) read `_done/` as readily as the live folder, so a closed-out run stays
addressable by its slug. Older archived runs carry the folder shape they were written in;
nothing is renumbered.

Never hand-create a folder here to "resume" a run. If `resolve-run.sh` says `STOP`, the run does
not exist and fabricating it orphans the real one — see `.icm/_shared/stage-preamble.md`.
