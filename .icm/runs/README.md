# Runs — one folder per unit of work in flight

`runs/<slug>/` is a run's working home: `run.md` (the pointer index — lane, stub, branch, PR)
plus each stage's `output/`. Spine runs carry `02_define/output/spec.md` and
`03_build/output/notes.md` (Release appends its `## Release` record there); lane runs carry
`lane/output/notes.md` instead. A **front** run — Scope — carries `01_scope/_source/story.md`
and `01_scope/output/scope.md`, and opens no PR of its own.

**A folder in this directory means work that has not shipped.** That is the whole point of the
split: a merged run still sitting here is an alarm, not a state.

**Completed runs are archived by `close-out.sh`, not by hand.** Release (and every lane) runs

```bash
.icm/scripts/close-out.sh <slug>
```

on the run's own branch, before the merge. It `git mv`s `.icm/runs/<slug>/` into
`.icm/runs/_done/<slug>/` — and the intake epic into `.icm/intake/_done/` when the run was its
last unshipped stub, taking the front run that cut the epic along — and commits both. **The
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
(`resolve-run.sh`, `ci-status.sh`, `close-out.sh`, `project-labels.sh`) read `_done/` as readily
as the live folder, so a closed-out run stays addressable by its slug. Older archived runs carry
the folder shape they were written in; nothing is renumbered.

Never hand-create a folder here to "resume" a run. If `resolve-run.sh` says `STOP`, the run does
not exist and fabricating it orphans the real one — see `.icm/_shared/stage-preamble.md`.
