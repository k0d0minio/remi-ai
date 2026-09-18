# Stub: Summary draft — consultation notes in, a proposed living-summary revision out, Morgane edits

- feature-slug: summary-draft
- scope: ai-assist
- personas: practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: mistral-adapter
- sequence: 4 of 5
- priority: P1
- size: M
- sources: V2 explication (« Structurer avec IA » : raw notes → structured synthesis, editable;
  "les notes brutes restent toujours accessibles, l'IA ne les remplace jamais") · brainstorm § B,
  § C (`PATIENT_SUMMARY`: "Valider | Modifier | Ajouter | Supprimer. Pas de ressaisie
  systématique") · feedback § 1 ("le concept de résumé vivant est pertinent") · decision D-8 ·
  cross-epic: `practitioner-workflow/consultation-update` (the note and the summary revision on
  one screen) · `_done/patient-record/_done/living-summary.md` ("Morgane writes what the AI will
  one day draft")

## Problem

The living summary was built to be drafted by a model one day and is still written by hand at every consultation. On the one screen where the note and the summary already sit together, nothing proposes the revision.

## Proposed change

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

## Acceptance criteria (rough)

- [ ] On the consultation-update screen, « Proposer une révision » makes one structured `balanced` call from the current summary, the new note, the anamnesis, goals and recommendations
- [ ] The returned summary follows the § C shape and lands in the textarea as a draft, diff-highlighted against the current summary; anamnesis proposals appear as an accept-each checklist
- [ ] Nothing is saved until she saves the screen; the note itself is never modified
- [ ] Medication dosages the model adds are stripped in a post-check; the generation is logged by reference (note ids, summary version), never by content
- [ ] A summary accepted from a draft carries `drafted_by` so it is distinguishable from one she wrote

## Out of scope (this feature)

- Transcript or audio ingestion; any autonomous write to the record

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-8 (in the first round) · brainstorm § 7 (no automation without human validation — satisfied by the textarea she is already looking at).

- This is the one capability that reads the anamnesis and the notes — the most sensitive text in
  the record. The prompt context is logged by _reference_ (note ids, summary version), never by
  content, in `ai_generations`.
- The § C bullet "medications: name only" is a prompt constraint _and_ a post-check: strip dosages
  from the summary if the model adds them.
- Transcript ingestion (brainstorm's "consultation enregistrée") is not this: text notes in, text
  out. Audio is a vendor question for another day.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Does she want the draft to _replace_ the textarea's content or appear beside it? Replace with
  undo is faster; beside is safer for a long summary.
- Anamnesis proposals: accepted one by one, or all-or-nothing? One by one is the § C interface.

## Prompt

Run `/pipeline new summary-draft` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
