# at-a-glance-prep-note-polish

- epic: triage
- lane: tweak
- status: active
- created: 2026-09-10
- size: S
- depends-on: none

## Problem

The "à préparer" prep note (`apps/admin/components/patients/prep-note.tsx`) has two minor UX edges
found in Release review, neither merge-stopping (build notes / 03_build/output/notes.md):

1. **Stale-prop flicker.** After a save, the success branch reads `value ?? draft` — `value` is the
   pre-revalidation server prop, so the old text shows until `revalidatePatient` streams the fresh
   row (sub-second, but visible when the network is slow).
2. **Blur/click double-submit race.** Clicking "Enregistrer" fires an input `blur` (which submits)
   before the click's `submit()`, and `pending` hasn't re-rendered yet — the guarded
   `requestSubmit()` can run twice on a fast click, writing an idempotent identical value plus a
   duplicate audit row.

## Acceptance

- [ ] After saving, the display never flashes the pre-edit text; the saved value shows from the
      moment the action settles (e.g. mirror the action's returned `saved` state into the display
      rather than the server prop).
- [ ] A fast blur+click produces exactly one submission.
