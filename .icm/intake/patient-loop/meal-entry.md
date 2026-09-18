# Stub: Meal entry — « Je vais manger » and « J'ai mangé », from the patient, into the journal

- feature-slug: meal-entry
- scope: patient-loop
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: link-writes
- sequence: 3 of 6
- priority: P1
- size: M
- sources: feedback § 6 ("Interaction repas") · § 8 (the central workflow, "Logique V2") · V2
  explication (« Accueil » field) · decisions D-6, D-12 · `patient_meal_entries` ·
  `apps/web/app/[locale]/p/[token]/repas/page.tsx` ·
  `apps/admin/components/patients/meal-journal.tsx`

## Problem

Her § 8 workflow — « Je vais manger des spaghetti tomate » → « Suggestions » — needs a place for the patient to write the meal in the first place. Today meals reach the journal only when Morgane transcribes them; the loop has no patient-side entry and no response slot.

## Proposed change

Her § 8, the workflow the product bends toward: « Je vais manger des spaghetti tomate » → bouton
« Suggestions » → what is good, what is missing, one simple improvement, why it matters for them.
This stub builds the **loop without the model**, so that Morgane's patients start using it in
November and `ai-assist/meal-suggestions` drops into a slot that already exists:

- **Two intents, one control.** On the home (the slot `patient-home-today` left): « Je vais
  manger » and « J'ai mangé », a text field ("Spaghetti sauce tomate"), an optional slot
  (petit-déj / déjeuner / dîner / collation), submit. Both write a `patient_meal_entries` row
  through `link-writes`, `written_by: patient`, with a new `intent: planned | eaten` column and
  today's date.
- **The response slot.** Each entry renders a response area: Morgane's feedback where she wrote
  it (today's column), and — from `ai-assist` — the instant suggestion. Without a model the area
  says, in her words, that a response will come; the journal counter in admin already counts
  entries awaiting feedback, so she sees them.
- **The journal segment** becomes the patient's history: their own entries and the responses,
  newest first, planned and eaten told apart. The journal exists "en arrière-plan pour garder
  l'historique" (§ 8) — the entry control is the feature, the list is the record.
- **Admin**: entries written by the patient show as such in the journal card; nothing else
  changes there.

Text only (decision D-12). The four-part response shape (bien · manque · amélioration · pourquoi)
is fixed here as the feedback's suggested structure in the admin form's placeholder, so her manual
feedback and the model's later output read the same.

## Acceptance criteria (rough)

- [ ] « Je vais manger » and « J'ai mangé » on the home write text-only `patient_meal_entries` rows with a new `intent` column and patient attribution, through the link-writes path
- [ ] Each entry renders a response slot: Morgane's feedback where she wrote it; otherwise, in her words, that a response will come
- [ ] The journal segment shows the patient's own entries and the responses, newest first, planned and eaten told apart
- [ ] Patient-written entries are marked as such in the console's journal card; nothing else changes there
- [ ] The four-part response shape (bien · manque · amélioration · pourquoi) is the admin feedback form's placeholder

## Out of scope (this feature)

- Any model call (`ai-assist/meal-suggestions` fills the slot); photos (D-12)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-6 (the slot is for the model later) · D-12 (text only).

- `patient_meal_entries` already has `description`, `patient_comment`, `feedback`,
  `feedback_written_at`, `learning`, `slot`, `eaten_on`. New: `intent`, `written_by`; the
  response for a _planned_ meal is still `feedback` — one column, two writers (`ai-assist` adds
  its own `suggestion` column or reuses `feedback` with an author — its call, not this stub's).
- After submit: the entry appears with its empty response slot; no page reload dance.
- Length cap and rate limit come from `link-writes`.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Slot vocabulary: the `meal-journal` stub asked and it is still open — her words, or no slot.
- Does a "planned" entry become "eaten" (one row updated) or does the patient write again
  (two rows)? The V2 flow suggests two separate acts; the data prefers one row.
- Should the patient see entries Morgane transcribed from WhatsApp in the same list, marked as
  hers?

## Prompt

Run `/pipeline new meal-entry` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
