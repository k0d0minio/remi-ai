# Build notes: copy-context

- commits: `fbaa399` the assembler + its test · `6a8f233` the console surface · `b378d3a` the docs,
  the entrypoint rule and the retention line · `b6c0780` format `spec.md` · `f1229b3` label the new
  audit action
- ci: GREEN on `f1229b3` (`ci-status.sh`, after the last push)

## Two red rounds, and what they were

Worth reading, because neither was a flake and one of them was the codebase
catching me:

1. **`format:check`** failed on `.icm/runs/copy-context/02_define/output/spec.md`. `new-run.sh`
   commits the run without going through lint-staged, so the spec it committed at Define had never
   met prettier — nothing to do with this build's code. Fixed by staging the file so Husky
   formatted it; the diff is the block table's column alignment and nothing else. **This will
   recur on every run** unless `new-run.sh` formats what it commits; I have not changed the script,
   since that is a factory change outside this spec.
2. **`typecheck`** failed on `apps/admin/components/audit/vocabulary.ts`: adding `context.exported`
   to the closed `auditActions` list without adding its label and intent is a type error. That is
   the closed list doing exactly what its own comment says it is for, and the fix is the two
   entries it wanted.

## What changed

- `packages/services/src/ai/context.ts`: the assembler. `patientContextText(input, options)` —
  pure, no I/O, no clock, no provider. Seven French blocks, six on by default. The input type has
  no `fullName`, `email` or `shareToken` field, so pseudonymity is a property of the signature.
- `packages/services/src/ai/context.test.ts`: 11 tests against two fixtures — a full record and an
  empty one. Covers block order, every block toggled off, `resume` toggled on, a custom and a blank
  preamble, rows missing their optional half, a category whose entries are all blank, and that the
  function renders exactly the rows it is given.
- `packages/services/src/ai/index.ts`, `src/server/index.ts`, `src/shared/index.ts`: the three
  re-exports. **`/shared` is the one worth reading closely** — see Notes for Release.
- `packages/services/src/shared/audit.ts`: `context.exported` added to the closed action list.
- `packages/ui/src/components/copy-button.tsx`: an optional `onCopied` callback, fired only after a
  successful clipboard write. Needed because the primitive swallows a denied clipboard on purpose,
  and a caller that records a copy must not record one that did not happen. Additive — the two
  existing call sites are untouched.
- `apps/admin/lib/patients/context.ts`: the console's mapper from the loaded record to the
  assembler's input. This is where the French for the closed vocabularies is resolved, from
  `vocabulary.ts` rather than a second copy inside `@remi/services`, and where `ageInYears` is
  called — which is what keeps the clock out of the pure function.
- `apps/admin/components/patients/copy-context-card.tsx`: the card. Editable preamble, seven block
  checkboxes, the text in a read-only textarea, the copy button. Neither the preamble nor the block
  choice is persisted.
- `apps/admin/lib/patients/actions.ts`: `recordContextExportAction` — re-asserts the operator,
  writes one `context.exported` row with the included blocks in `detail`, revalidates nothing
  (no record changed).
- `apps/admin/app/(admin)/patients/[id]/page.tsx`: the card last in the working view, one registry
  entry, no new query — every row it needs was already loaded.
- `apps/admin/components/patients/quick-actions.tsx`: the fifth action.
- `apps/docs/app/technical/packages/page.mdx`, `.icm/docs/RETENTION.md`: the new export, and the
  audit-trail paragraph on what a context export is and is not.

## Acceptance criteria status

- [x] `patientContextText()` in `src/ai/context.ts`, exported from `/ai`, re-exported through
      `/server`, pure — no I/O, no `Date.now()`, no database call. Also on `/shared`; see below.
- [x] Input type carries `pseudonym` and has no `fullName`, `email` or `shareToken` field.
- [x] `context.test.ts` covers all six named cases against fixtures — 11 tests, green locally
      (212/212 for the whole services suite).
- [x] Default block set is the six protocol blocks; `resume` off by default.
- [x] The card renders the preamble field, seven checkboxes, the read-only textarea and the button.
- [x] Editing the preamble or toggling a block updates the text in place; neither survives a reload.
- [x] The text is always readable and selectable whether or not the clipboard write succeeds.
- [x] `quick-actions.tsx` shows a fifth action landing on the card.
- [x] `context.exported` in `auditActions`; a successful copy records one event naming the patient
      and the included blocks.
- [x] No new table, no schema change, no migration, nothing touched on the patient link or any
      patient-facing surface.
- [x] No model called; `TextProvider` not registered, read or referenced.
- [x] `technical/packages` and `RETENTION.md` updated in this PR.

## Notes for Release

**One deviation from the spec, and it is a real one.** The spec said the assembler would be reached
through `/ai` and `/server`. The card needs it **in the browser** — the text re-renders as she
edits the preamble and toggles blocks — and `/ai` is a server-only entrypoint carrying the
provider seam. Importing `/ai` from a client component would pull that seam into the browser
bundle, and once the Mistral adapter lands (`ai-assist/mistral-adapter`, decision #3) it would pull
vendor code client-side. So the function keeps the spec's path and its `/ai` and `/server`
exports, and gains a third on `/shared`. It imports nothing at all, so inlining it into the
isomorphic bundle costs nothing and drags nothing. The reasoning is in a comment at the
`shared/index.ts` re-export, in the card's import, and on the docs page.

**What to smoke-test on the preview before ticking Ready to merge** — signed in, on a patient with
data in every section, and then on a nearly empty one:

1. The working view shows « Copier le contexte » as its last card, and the fifth quick action lands
   on it (try it from the phone width too, where it has to switch to Suivi first).
2. The text reads as French prose you would actually paste: blocks in order, no empty headings, no
   `Allergies : —`, no stray `—` or `·` where a field is blank. **On a nearly empty patient it
   should be the preamble plus a single `Profil` line with the pseudonym.**
3. The pseudonym is there and the real name is not — check a patient who has a `fullName` on file.
4. Edit the preamble, reload, confirm it is back to the default. Same for a block checkbox.
5. Untick every block: you should get the preamble alone.
6. Tick « Résumé »: the summary appears last.
7. Copy, then paste somewhere — and check the journal (`/audit`) shows one `context.exported` row
   naming the patient with the blocks in its detail. Copying twice should give two rows.
8. Your call on whether the paste is the paste you want: **the preamble's wording is still the one
   open question** (spec § Open questions). It is Morgane's to give, and the field is editable so a
   wrong default costs her one edit. The second « améliorer un repas » register is out of scope.

Close review welcome on: the `/shared` re-export above, and whether `medications` belongs in the
paste at all — it is in because you asked for it, over the stub's own field list, and it is the
sharpest data in the export.
