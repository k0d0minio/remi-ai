# Stub: Prep note — no stale-prop flicker after a save, one submission per click

- lane: tweak
- found-by: the `at-a-glance-page` Release review · 2026-09-10
- size: S

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

## Proposed change

Mirror the action's returned `saved` state into the display instead of the server prop, and guard the blur-then-click path so a fast click submits once.

## Acceptance criteria (rough)

- [ ] After saving, the display never flashes the pre-edit text; the saved value shows from the
      moment the action settles (e.g. mirror the action's returned `saved` state into the display
      rather than the server prop).
- [ ] A fast blur+click produces exactly one submission.

## Prompt

Run `/pipeline tweak at-a-glance-prep-note-polish` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
