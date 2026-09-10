# Stub: Summary draft — consultation notes in, a proposed living-summary revision out, Morgane edits

- feature-slug: summary-draft
- sequence: 4 of 5
- depends-on: mistral-adapter
- priority: P1
- size: M
- sources: V2 explication (« Structurer avec IA » : raw notes → structured synthesis, editable;
  "les notes brutes restent toujours accessibles, l'IA ne les remplace jamais") · brainstorm § B,
  § C (`PATIENT_SUMMARY`: "Valider | Modifier | Ajouter | Supprimer. Pas de ressaisie
  systématique") · feedback § 1 ("le concept de résumé vivant est pertinent") · decision #8 ·
  cross-epic: `practitioner-workflow/consultation-update` (the note and the summary revision on
  one screen) · `_done/patient-record/_done/living-summary.md` ("Morgane writes what the AI will
  one day draft")

## What this is

The living summary was built to be drafted by a model one day — its stub says so in its title.
This is that day, on the one screen where the note and the summary already sit together:

- On `consultation-update`, beside the summary revision textarea: **« Proposer une révision »**.
  One `balanced` call with the current summary, the new note, the anamnesis as it stands, the
  active goals and recommendations; the schema returns **a revised summary** (the § C shape:
  context and motif, points of vigilance, medications by name only, main symptoms, food habits
  and constraints, positives already present, points needing clarification) and **proposed
  anamnesis field updates** (category → text, only where the note adds something).
- The revision **fills the textarea as a draft**, diff-highlighted against the current summary;
  the anamnesis proposals appear as a checklist under it, each accepted or not. Nothing is saved
  until she saves the screen; the note itself is never touched.
- The saved summary carries `drafted_by: patient-notes-draft@vN` when she accepted a draft
  (edited or not) — so a summary she rewrote by hand and one she accepted are distinguishable in
  the log later.

Brainstorm § 7's "no automation without human validation" is exactly satisfied: the model writes
into a textarea she is already looking at.

## Worth knowing

- This is the one capability that reads the anamnesis and the notes — the most sensitive text in
  the record. The prompt context is logged by _reference_ (note ids, summary version), never by
  content, in `ai_generations`.
- The § C bullet "medications: name only" is a prompt constraint _and_ a post-check: strip dosages
  from the summary if the model adds them.
- Transcript ingestion (brainstorm's "consultation enregistrée") is not this: text notes in, text
  out. Audio is a vendor question for another day.

## Open questions — flag these on pickup

- Does she want the draft to _replace_ the textarea's content or appear beside it? Replace with
  undo is faster; beside is safer for a long summary.
- Anamnesis proposals: accepted one by one, or all-or-nothing? One by one is the § C interface.

## Prompt

Run `/pipeline new .icm/intake/ai-assist/summary-draft.md` in the remi-ai repo and follow the
pipeline from there. Read the stub, its epic's `breakdown.md` (§ The shape) and the
`mistral-adapter` and `practitioner-workflow/consultation-update` runs' notes first. Scope: on the
consultation-update screen, a « Proposer une révision » action that makes one structured
`balanced` call from the current summary, the new note, the anamnesis, goals and recommendations,
returning a revised summary in the § C shape plus per-category anamnesis proposals; the draft
lands in the textarea diff-highlighted and the proposals as an accept-each checklist; nothing saved
until she saves; medication dosages stripped in a post-check; generation logged by reference. No
transcript, no audio, no autonomous write. Raise the stub's open questions rather than answering
them.
