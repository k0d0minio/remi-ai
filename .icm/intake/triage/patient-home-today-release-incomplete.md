# Stub: #106 merged without its close-out or its changelog page

- lane: chore
- found-by: meal-entry release · 2026-09-18

## Problem

`patient-home-today` (#106) merged to `main` with two of Release's outputs missing:

- `.icm/runs/patient-home-today/` is still in `.icm/runs/`, not `.icm/runs/_done/`. Its intake
  stub moved to `_done/` correctly, so the run opened and closed normally — only `close-out.sh`
  did not run on the branch before the squash. `runs/README.md` names this exactly: a merged run
  still sitting in `.icm/runs/` means Release skipped the step.
- There is no `apps/docs/app/changelog/2026-09-18-patient-home-today/` page, and no entry for it
  in `_meta.ts` or the index, although the change is plainly user-visible — it rebuilt the patient
  link's home.

Neither is recoverable in #106's own PR: it is merged, and the archive move can only ride the
run's own PR. `_shared/project-rules.md` records that nothing verifies the archive after a merge,
which is why this went unnoticed.

## Proposed change

Move the run folder to `.icm/runs/_done/patient-home-today/` and write the missing changelog page
from its `notes.md`, in one chore PR. Then decide whether the post-merge gap is worth closing —
the estate retired the CI archive check for good reasons (`_shared/github.md` § regime 3), so the
answer may be "no, this is what review is for".
