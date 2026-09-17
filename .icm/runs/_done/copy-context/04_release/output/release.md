# Release: copy-context

- gate: Ready to merge ticked — merge authorised
- ci: GREEN — established by `ci-status.sh` on the branch head that was merged (the close-out
  commit, which is the last on the branch; the PR's merge commit records it)
- pr: https://github.com/k0d0minio/remi-ai/pull/96 · merged: yes — 2026-09-17
- code-review: medium (spec complexity `standard`) — 3 findings, all 3 fixed on this branch, none parked
- production-readiness: run — no findings. The diff adds no env var, no migration, no schema change,
  no service adapter and no dependency; its only write is one audit row through the existing
  `recordAuditEvent` into the existing `text` column, so there is nothing for a deploy to carry.
- security-review: run — no High or Medium findings. Triggered because the diff handles patient PII
  and adds a server action.
- parked: none
- technical docs: `apps/docs/app/technical/packages` (the new export and why it sits on two
  entrypoints) · `packages/services/AGENTS.md` (the entrypoint table and the rule) ·
  `.icm/docs/RETENTION.md` (what a `context.exported` row is)
- business docs: no business docs impact — `business/roles` still describes the operator's rights
  correctly, and this adds no role, no permission and nothing a patient sees.
- release notes: both
- sent: ship note sent 2026-09-17
- closed out: RESULT: CLOSED — run archived to `.icm/runs/_done/copy-context/`;
  `practitioner-workflow` has 5 stubs left, so the epic is not finished by this run

## The three code-review findings, and why each was fixed rather than parked

All three were trivial and in-run, which the stage's rule sends to a fix on the branch, not to
triage:

1. **`recordContextExportAction` did not narrow its `blocks` argument** before joining it into the
   audit `detail`. A server action is a public endpoint, and every sibling action in that file
   narrows client values against a closed list first. Fixed with `asContextBlocks`, which filters
   the `contextBlocks` vocabulary rather than the argument — so the stored value is bounded,
   canonically ordered, and cannot carry a caller-chosen byte. The security pass confirmed the
   unnarrowed version was not exploitable (the value is never rendered as HTML), but the
   inconsistency with its siblings was the point.
2. **The card was registered in the section registry while rendering nested inside the
   `working-view` section.** The desktop index's IntersectionObserver assumes registered sections
   occupy disjoint ranges, so the active marker flipped between "Vue de travail" and "Copier le
   contexte". Fixed by dropping the registry entry: none of the working view's other cards —
   Objectifs, Consigne, Résumé, Derniers repas, Recommandations, À préparer — is registered
   either, so the entry was inconsistent before it was buggy. The fifth quick action still lands
   on the card, because `scrollTo` resolves by `getElementById` and never reads the registry.
3. **`onCopied?.()` sat inside the clipboard `try`**, whose `catch` is documented as "clipboard
   denied" — so a callback throwing synchronously would be swallowed as a copy failure, defeating
   the one thing that prop exists for. Fixed by narrowing the `try` to the write alone and
   early-returning on denial.

## Notes on the review passes

The security pass also flagged, as a non-security aside, that removing the registry entry looked
like a functional regression. It is not: `scrollTo` is `getElementById`, and `quick-actions.tsx`
never reads the `sections` array. Verified before accepting.

It declined to report one thing worth recording here: the audit row's `patientId` is
client-supplied, so an operator could in principle record an export against a patient whose
context was not the one copied. That is inherent to a clipboard feature — the text is deliberately
hand-selectable when the browser refuses the copy, so an operator can already take it without
producing any row — and it is not a defect this diff introduces.

## Acceptance check (vs spec)

- [x] `patientContextText()` in `src/ai/context.ts`, exported from `/ai`, re-exported through
      `/server`, pure — no I/O, no clock, no database call. Also on `/shared`; see the deviation
      recorded in the build notes.
- [x] The input type carries `pseudonym` and has no `fullName`, `email` or `shareToken` field —
      confirmed independently by the security pass, which traced every call site.
- [x] `context.test.ts` covers all six named cases against two fixtures — 11 tests; the services
      suite is 212/212.
- [x] The default block set is the six protocol blocks; `resume` is off by default.
- [x] The card renders the preamble field, the seven checkboxes, the read-only textarea and the
      copy button.
- [x] Editing the preamble or toggling a block updates the text in place; neither survives a
      reload — no table, no browser storage.
- [x] The text is always readable and selectable whether or not the clipboard write succeeds.
- [x] `quick-actions.tsx` shows a fifth action landing on the card.
- [x] `context.exported` is in `auditActions`, with its label and intent in the journal's
      vocabulary, and a successful copy records one event naming the patient and the blocks.
- [x] No new table, no schema change, no migration; nothing touched on the patient link or any
      patient-facing surface.
- [x] No model called; `TextProvider` not registered, read or referenced.
- [x] `technical/packages` and `RETENTION.md` updated in this PR.

## Still open, deliberately

The preamble's wording is Morgane's to give and she has not given it (spec § Open questions). The
build seeds the stub's own line and the field is editable, so a wrong default costs her one edit
rather than a release. The second « améliorer un repas » register stays out of scope.
