# Spec: Meal entry — « Je vais manger » and « J'ai mangé », from the patient, into the journal

- slug: meal-entry
- personas: patient, practitioner
- touches: packages/services/src/db, apps/web/app/[locale]/p/[token]/repas, apps/web/components/patient-link, apps/web/lib/patient-link, apps/admin/components/patients
- complexity: standard

## Problem

Morgane's § 8 workflow — « Je vais manger des spaghetti tomate » → « Suggestions » → what is good,
what is missing, one improvement, why it matters — needs somewhere for the patient to write the
meal in the first place. Today a meal reaches `patient_meal_entries` only when Morgane transcribes
it from WhatsApp, and the patient link renders that journal read-only. The loop has no patient-side
entry and no response slot.

That is the initiative's whole question — does REMI help a patient apply their recommendations
between two consultations — and a read-only rendering of the protocol cannot answer it. It is also
the 15 October milestone, « the patient writes into the link ». `link-writes` (#98) made the token a
write credential; this is the first feature to use it for the meal loop. Building the loop **without
the model** is deliberate (D-14): Morgane's patients start using it in November, and
`ai-assist/meal-suggestions` drops into a response slot that already exists rather than inventing
one.

## Proposed change

The patient writes meals through their link, and every entry carries a place for the answer.

**Two intents, one control.** On the `repas` segment: « Je vais manger » and « J'ai mangé », a text
field ("Spaghetti sauce tomate"), an optional slot, submit. Both write a `patient_meal_entries` row
through the `link-writes` path — `written_by: patient`, `eaten_on` = today, and a new
`intent: planned | eaten` column. The slot control offers Morgane's four existing keys
(`petit_dejeuner` / `dejeuner` / `diner` / `collation`) and defaults to none; null stays a
first-class value, exactly as it is for her own entries.

**A planned meal becomes an eaten one on the same row.** A `planned` entry offers « je l'ai mangé »,
which flips `intent` to `eaten` on that row and keeps its description, its slot and any response
already written against it. One meal is one record; a flipped entry offers the flip no more.

**The response slot.** Each entry renders a response area: Morgane's `feedback` where she has written
it, and otherwise a line in her words saying a response will come. `feedback` stays one column with
two writers — when `ai-assist` arrives it decides whether to add a column of its own or reuse this
one with an author; that is its call, not this run's. The console's existing journal counter already
marks entries awaiting feedback, so she sees them arrive.

**The segment becomes the patient's history.** `repas` lists every non-archived entry newest first,
planned and eaten told apart, with the responses beneath. Because the control now lives there, the
segment is reachable for a patient with no meals yet — it no longer 404s and no longer disappears
from the navigation, which is what makes a first entry possible at all. What the patient sees is
otherwise unchanged: entries Morgane transcribed stay in the same list, with no attribution shown.

**Console.** Entries written by the patient are marked as such in the journal card — `written_by` is
stored today but rendered nowhere. The admin feedback textarea gains the four-part response shape
(bien · manque · amélioration · pourquoi) as its placeholder, so her manual feedback and the model's
later output read the same. Nothing else in the console changes.

Text only (D-12). No model call (D-6 fixes the slot; `ai-assist/meal-suggestions` fills it).

## Acceptance criteria

- [ ] `patient_meal_entries` carries an `intent` column (`planned | eaten`), not null, with a
      migration in the repo; every existing row reads `eaten`
- [ ] The `repas` segment carries an entry control with « Je vais manger » and « J'ai mangé », a
      text field and an optional slot offering the four existing `mealSlots` keys, defaulting to none
- [ ] Submitting writes one `patient_meal_entries` row through the `link-writes` path, with
      `written_by: patient`, `eaten_on` = today and `intent` set from the button used
- [ ] The length cap and the rate ceilings come from `link-writes`; a refused write tells the
      patient so in their own language rather than failing silently
- [ ] The new entry appears in the list with its empty response slot straight after submitting — no
      full page reload
- [ ] A `planned` entry offers « je l'ai mangé »; taking it flips `intent` to `eaten` on the same row
      through the `link-writes` path, keeps the description, the slot and any `feedback` already
      written, and the entry no longer offers the flip
- [ ] Every entry renders a response slot: Morgane's `feedback` where she wrote it, otherwise a line
      in her words saying a response will come
- [ ] The `repas` list shows every non-archived entry newest first, planned and eaten told apart,
      with no author shown to the patient
- [ ] `repas` is reachable and appears in the navigation for every patient, including one with no
      meal entries yet
- [ ] Entries with `written_by: patient` are marked as such in the console's journal card
- [ ] The console's meal feedback textarea shows the four-part shape
      (bien · manque · amélioration · pourquoi) as its placeholder

## Out of scope

- Any model call. `ai-assist/meal-suggestions` fills the response slot this run builds (D-6, D-14).
- Photos or any upload (D-12); the journal stays text-only.
- The patient editing or deleting an entry after submitting, and flipping `eaten` back to `planned`.
  Correcting a meal is Morgane's, in the console, as it is today.
- The entry control on the patient home. `patient-home-today` owns the home and places it there when
  it runs; this run puts it where the history already lives.
- Any change to how `feedback` is authored or stored beyond the placeholder — one column, two
  writers, and `ai-assist` decides its own shape.
- Anything else in `apps/admin`: the marker and the placeholder only, no journal redesign.
- Slot vocabulary changes. The four keys and Morgane's French labels are reused as they stand; her
  confirmation of the wording remains open elsewhere and is a `vocabulary.ts` edit, never a migration.

## Open questions

- none — the three points the stub left **Open for Define** were settled with the operator on
  2026-09-18: the slot is optional and uses her four existing words; a planned meal is flipped on one
  row rather than written twice; entries Morgane transcribed stay visible to the patient, unmarked,
  as they are today. The stub's note that `written_by` is a new column is stale — `link-writes` (#98)
  already shipped it; only `intent` is new.
