# Spec: Bulk entry — whole-section editing for recommendations, supplements and essentials

- slug: bulk-entry
- apps: admin, packages
- touches: apps/admin/components/patients, apps/admin/lib/patients/actions.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, packages/services/src/db/services/patient-recommendations, packages/services/src/db/services/patient-supplements, packages/services/src/db/services/pantry-essentials
- complexity: complex

## Problem

Encoding a protocol in the console costs one round-trip per line. A recommendation is a category,
a title and a detail then a save; a supplement is four fields then a save; a pantry essential is
two fields then a save. A real protocol is roughly eight recommendations, five supplements and a
dozen essentials — around thirty submits, each one a server action, a revalidation and a repaint.
Morgane's verdict on the first version is exactly this: "cela prendrait beaucoup trop de temps
d'encoder un profil tel que demandé (un par un)", and her § 9.3 test is "je peux ajouter
efficacement plusieurs recommandations, compléments ou essentiels — pas un à un".

It matters because nothing downstream gets real data until she can encode a patient in minutes.
The current initiative (`business/initiatives`) is a patient experience validated on real terrain
before the 19 December open day, and its method is that Morgane accompanies 10–15 of her own
patients now — which she cannot do through a console that charges a page cycle per protocol line.
The epic's product rule binds this stub: a practitioner never encodes the same information twice,
and updating a patient after a consultation takes a few minutes.

## Proposed change

Each of the three protocol sections gains a **whole-section edit mode**: the section's rows become
editable at once, rows can be added, removed and reordered locally, and **one save** applies the
whole section. The read view each section already has stays what she sees by default; edit mode is
entered deliberately and left on save or cancel.

- **Recommendations** — edit mode is **one block per category** (Nutrition, Habitudes, Activité,
  Suivi), rows under each, each block with its own add-row. No per-row category picker: that is
  how a protocol is written. `supplement` stays out of the offered categories, as
  `vocabulary.ts` has it today — supplements have their own table. Existing rows already stored
  under `supplement` still render, still save, and can still be re-categorised from the
  single-row edit form.
- **Supplements** — one compact table, every row visible at once: nom · dose · moment · raison.
- **Essentials** — one table of item + pourquoi, plus a **paste-a-list** affordance: pasted text is
  split one line to one row, the line becoming the item and the "pourquoi" left blank. It is a
  line split and nothing more — no parsing of doses, quantities or fields (decisions #8 and #14
  put free text → structured rows at P2, in `ai-assist`).
- **Optional detail folds closed** in all three (recommendation `detail`, supplement `raison` and
  `moment`, essential `pourquoi`), so the base act stays one field and a tab (§ 5 bullet 7).

Behind each section, **one batch server action**: it takes the section's rows as submitted and
applies inserts, updates, archives and the new order in a **single transaction**, writing **one**
audit event carrying the counts rather than one event per row. The existing single-row actions
stay exactly as they are — they are the phone quick-add and the patient-loop's own write path.

Two operators editing the same section at once (Morgane on a phone, an operator at the desk) is
**last-write-wins**: the batch applies what was submitted, and the audit event names the operator
and the counts. That is accepted for the beta and is stated in the PR.

## Dependency

The batch actions' single-transaction requirement is **not satisfiable on the current storage
adapter**. `packages/services/src/db/adapters/neon.ts` runs the Neon **HTTP** driver, whose
`transaction()` is a pass-through — `transaction: async (fn) => fn(client)` — with a comment
saying the first service that writes across a unit must move the adapter to the WebSocket driver.
This run is that first service.

On the owner's call (2026-09-17) the adapter move is **its own chore, ahead of this run**, not a
side-effect of a UI change: it alters database access for all six apps.
[`.icm/intake/triage/neon-websocket-transactions.md`](../../../../intake/triage/neon-websocket-transactions.md)
is cut for it. **Build does not start here until that chore is merged** — without it the
"one transaction" criterion below cannot be met, and building the batch on a pass-through would
bury a half-applied protocol behind a green test.

## Acceptance criteria

- [ ] Each of the three sections has an edit mode covering the whole section, entered from the
      section and left by saving or cancelling; cancelling leaves the stored rows untouched.
- [ ] In edit mode a row can be added, a row can be removed, and rows can be reordered — all
      locally, with no server call until the save.
- [ ] One save per section writes every change in that section: a mixed edit (two rows changed,
      one added, one removed, the order altered) is applied by a single submit.
- [ ] That save runs as **one transaction** — a failure part-way leaves the section exactly as it
      was, with nothing partly applied.
- [ ] Each batch save writes **one** audit event naming the operator, the patient and the counts
      applied (added / updated / archived / reordered) — not one event per row.
- [ ] Recommendations edit mode presents one block per category, each with its own rows and
      add-row, and offers no `supplement` category for new rows.
- [ ] A recommendation already stored with category `supplement` still renders and still saves
      through the section's batch without being silently re-categorised.
- [ ] Supplements edit mode shows nom, dose, moment and raison for every row at once.
- [ ] Pasting multiple lines into the essentials section produces one row per non-empty line, the
      line as the item and "pourquoi" blank, before any save is made — the operator can edit or
      remove the parsed rows first.
- [ ] Optional fields (recommendation detail, supplement moment and raison, essential pourquoi)
      are folded closed by default and open per row.
- [ ] Removing a row through the batch **archives** it where the section archives today — it does
      not hard-delete, so a protocol that stopped is still the answer to "why did we stop it".
- [ ] The existing single-row add / update / move / archive actions still exist and still work
      unchanged.
- [ ] Each section's edit mode is a `<form>` with a single submit, so it degrades where the rest
      of the console degrades; row state is submitted as form data, not as a client-only payload.
- [ ] Each batch server action re-asserts `requireOperator()` and validates every row through the
      service layer, refusing the whole save if any row is invalid and saying which row.

## Out of scope

- **Any AI.** No model is called: no free-text parsing, no suggested rows, no prefill. The grid is
  the slot `ai-assist/free-text-to-rows` fills later (P2, decisions #8 and #14).
- **Anything on the patient link.** This is the console only; the patient surface reads the same
  rows and is untouched.
- Paste-a-list for recommendations and supplements — essentials only this run.
- Moving a recommendation between categories inside edit mode. Categories are blocks; a
  re-categorisation is the existing single-row edit form.
- Cross-patient copy and personal templates — that is `reuse-and-duplicate`, which depends on this.
- Drag-and-drop reordering as a requirement: reorder must work, the input is the implementer's
  call, and it must work by keyboard.
- Concurrency beyond last-write-wins — no locking, no conflict detection, no merge.
- The Neon adapter's driver move itself. See **Dependency**; it is
  `.icm/intake/triage/neon-websocket-transactions.md`.
- A new `@remi/ui` primitive. A grid of inputs in `Table` cells is admin-local composition
  (`CONVENTIONS.md` § Keeping the codebase lean).

## Open questions

- none — the stub's three open questions were put to the owner at Define and answered: one block
  per category for recommendations; `supplement` stays excluded from the offered categories;
  paste-a-list on essentials only. The fourth, raised from the code rather than the stub — whether
  "one transaction" is real on the current driver — is answered by **Dependency** above.
