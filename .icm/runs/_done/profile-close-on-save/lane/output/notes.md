# Tweak: profile-close-on-save

- change: `apps/admin/components/patients/profile-summary.tsx`: « Fermer » above the profile form →
  no control at all; the form collapses on a successful save instead (`PatientForm` gained an
  optional `onSaved`)
- changelog: entry added

## The open question, and its answer

The stub (`intake/triage/profile-form-close-discards-edits.md`) left one question open and told the
lane to raise it rather than answer it in code: does Morgane ever open « Modifier » and change her
mind, or does she only open it to encode? Raised with the operator in session on pickup; the answer
was **only to encode**. That picks the stub's cheapest shape — drop the control — over the confirm
dialog, so no dirty-tracking was added to `PatientForm` and the form the `secondary-sections` run
was scoped not to touch keeps its fields untouched.

## What changed

- `profile-summary.tsx` no longer renders the « Fermer » button, and no longer imports `X`. The
  editing branch is the form alone.
- `PatientForm` takes an optional `onSaved` and calls it once `savePatientAction` reports `saved`.
  `/patients/new` passes none — creating redirects — so that path is unchanged.
- The summary passes a `useCallback`-stable `close`, so the notification cannot re-fire on an
  unrelated re-render of the page around the form.
- `savePatientAction` already revalidates `/patients/<id>`, so the summary she lands on carries the
  values she just saved and a fresh « Modifié le … ». That is what replaces the form's own
  « Enregistré. », which unmounts with it — collapsing is not silent.
- A failed save leaves `saved` false, so the form stays open with its error message.

## Not done

- No dirty-tracking and no confirm dialog: the answer above ruled both out.
- Leaving the page mid-edit still discards, exactly as it does for every other form in the console.
  The stub scoped « Fermer » and nothing wider.
