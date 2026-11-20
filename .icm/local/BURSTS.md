# Burst mode

Language: en

Jamie started this mode on 2026-11-20. It applies while the branch `bursts` exists. This file
lives on `bursts` only. The last commit before `bursts` merges into `main` removes this file and
the folder `.icm/local/bursts/`.

## Why

The client must see as many features as possible in a short time. Tickets are built in bursts of
about six. One ticket is one local branch. No ticket branch goes to GitHub.

## What is suspended in this mode

- The pipeline commands and the stage contracts of `.icm/_system/`. Do not run `resolve-run.sh`,
  `new-run.sh`, `ci-status.sh` or a stage. Do not make a run folder.
- One pull request for each ticket, and the gates of each ticket.
- A line `[icm-router] Route:` from the hook `route-request`. Ignore it.

## What stays

- `CONVENTIONS.md` and the `AGENTS.md` of the subtree.
- Secrets never enter git. Never read or print an `.env*` file.
- `main` changes by pull request only. Jamie approves the one pull request `bursts` → `main`.
- A session does not write to Linear.

## Rules for a ticket session

1. Work in your own worktree, on your own local branch cut from `bursts`. Commit there.
2. Do not push, fetch or pull. Do not call `gh` or the GitHub API. Do not open a pull request.
3. Do not run build, lint, typecheck, test, format or a dev server. One check runs on the merged
   branch at the end of the burst. Thus read the code that you change with care, and write the
   unit tests of each pure function that you add. The burst check runs them.
4. `pnpm install` is permitted. `pnpm --filter @remi/services db:generate` is permitted for the
   one ticket of the burst that has a migration. Do not run `db:migrate`.
5. Only the ticket that your brief names as the migration ticket adds a migration. Never number
   or edit a migration file by hand.
6. Keep your change out of the files that many tickets touch:
   - Put a new section of the patient file in a new component file, and its server actions in a
     new actions file. Add only one import and one line to
     `apps/admin/app/(admin)/patients/[id]/page.tsx` and none to
     `apps/admin/lib/patients/actions.ts`, unless your brief says otherwise.
   - Put new patient texts in one new block of `apps/web/lib/content/fr.ts`, `en.ts` and
     `types.ts`. Do not change a line that exists, unless your ticket is about that text.
7. If the ticket has a stub in `.icm/intake/`, move the stub to the `_done/` folder of its epic in
   your commit.
8. The commit title is `<KEY>: <ticket title>`. Add no attribution line.
9. Client-facing text is in `fr-BE` and `en`. The patient is addressed with « tu ».

## Rules that no shortcut drops

- A practitioner's read or write uses the scope that exists (`byPatient`, D-27). A patient's read
  or write uses `requirePatient` with the id from the session (D-26).
- Each status change, validation, consent and acknowledge writes an audit event (D-32).
- Unknown composition is never shown as safe (D-30).
- A prompt for a model has no name and no e-mail address of a patient.

## The last message of a ticket session

Give, in this order: the branch name, the commit hashes, the files that you changed, what you did
not do and why, each debt that you left, and three to five things that the burst check must look
at in the browser.

## The end of a burst

The coordinating session merges the ticket branches into `bursts` in a fixed order. It then runs
one check on `bursts`: the migration order, the migration on the Neon branch `local/bursts`,
typecheck, lint, the unit tests, and a look at the features in the browser on local dev.
`bursts` is then pushed once.
