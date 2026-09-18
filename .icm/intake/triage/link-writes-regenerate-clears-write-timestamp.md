# Stub: Rotating the share link says the patient has written nothing

- lane: tweak
- found-by: the `link-writes` Release code review · 2026-09-17
- size: S

## Problem

Found in the `link-writes` Release code review, not merge-stopping.

`regenerateShareToken` (`packages/services/src/db/services/patients/index.ts`) nulls both
`linkLastOpenedAt` and `linkLastWroteAt`, so the share-link card reads « Rien n'a encore été écrit
depuis le lien. » straight after a rotation — while the patient's entries are still sitting in the
journal, unanswered.

Nulling is defensible: « dernière écriture » is a fact about _this_ link, and the new link has no
history. The question is whether that is the fact Morgane wants, or whether she wants « rien depuis
le nouveau lien, N entrées avant ». It is a product question, not a defect, and it only matters
once patients are actually writing — `patient-loop/meal-entry` is when it becomes visible.

## Proposed change

Ask Morgane which reading she wants after a rotation and make the card say that; never imply an empty journal.

## Acceptance criteria (rough)

- [ ] Ask Morgane which reading she wants after a rotation, and make the card say that.
- [ ] Whatever is chosen, the card never implies a patient has written nothing when their entries
      are in the journal.

## Prompt

Run `/pipeline tweak link-writes-regenerate-clears-write-timestamp` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
