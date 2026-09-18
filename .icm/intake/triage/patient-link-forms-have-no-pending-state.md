# Stub: the patient link's forms accept a double tap

- lane: bug
- found-by: meal-entry review · 2026-09-18

## Problem

Neither `apps/web/components/patient-link/meal-entry-form.tsx` nor
`apps/web/components/patient-link/meal-mark-eaten.tsx` disables its submit button while the
action is in flight. On a slow connection — which is the normal case for a patient standing in a
kitchen on mobile data — a second tap before the first returns writes a second identical row into
the journal.

The `link-writes` ceilings cap the damage at ten a minute; they do not prevent the duplicate. The
patient sees their dinner twice and Morgane answers it twice.

## Proposed change

A `useFormStatus` island around each submit control, disabled while pending. It is the same
pattern both forms need, so it likely belongs in `packages/ui` as a `SubmitButton` rather than
twice in `apps/web` — and the console's forms have the same gap, which would make three consumers.

## Notes

`patient-link` is the urgent half: the console is Morgane alone on a desk connection.
