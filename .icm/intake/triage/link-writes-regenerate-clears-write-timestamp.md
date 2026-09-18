# link-writes-regenerate-clears-write-timestamp

- epic: triage
- lane: tweak
- status: active
- created: 2026-09-17
- size: S
- depends-on: none

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

## Acceptance

- [ ] Ask Morgane which reading she wants after a rotation, and make the card say that.
- [ ] Whatever is chosen, the card never implies a patient has written nothing when their entries
      are in the journal.
