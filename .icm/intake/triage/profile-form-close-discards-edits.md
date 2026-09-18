# Stub: « Fermer » on the profile form discards unsaved edits without warning

- lane: tweak
- found-by: `/code-review` on `secondary-sections` (#100) · 2026-09-18
- priority: P2
- size: S
- sources: `/code-review` on `secondary-sections` (#100) ·
  `apps/admin/components/patients/profile-summary.tsx`

## Problem

`secondary-sections` put the profile behind a read summary: « Modifier » swaps in `PatientForm`,
« Fermer » swaps back. `PatientForm` is uncontrolled and its own save button sits at the bottom of
roughly five hundred lines of fields, so « Fermer » — the one control at the **top** — unmounts the
form and silently drops whatever was typed.

Nobody has lost work to it yet: it shipped with the read summary and Morgane has not used it in
anger. It is cheap to get wrong and cheap to fix, which is why it is written down rather than left
to be discovered mid-consultation.

## Proposed change

Make « Fermer » a no-op when the form is pristine and a confirm dialog (the delete flow's `Dialog`) when it is dirty — or drop the control and collapse only on save, if she never uses it. Ask first.

## Notes

- The obvious fix is dirty-tracking plus a confirm, but that means `PatientForm` exposing whether
  it is dirty — a change to a form `secondary-sections` was explicitly scoped not to touch.
- A cheaper shape: make « Fermer » a `<button form="…">`-style no-op when the form is pristine and
  a `Dialog` confirm when it is not, using the same `Dialog` the delete flow already uses.
- Cheapest of all, if she never uses « Fermer »: drop the control and let the section collapse only
  on a successful save. Worth asking before building the confirm.

**Open — raise on pickup, do not answer in code:**

- Does she ever open « Modifier » and change her mind, or does she only open it to save? The answer
  decides between a confirm dialog and removing the control.

## Prompt

Run `/pipeline tweak profile-form-close-discards-edits` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
