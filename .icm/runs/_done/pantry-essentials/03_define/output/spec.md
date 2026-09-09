# Spec: Pantry essentials — the placard/frigo list, per patient

- slug: pantry-essentials
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/pantry-essential.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/pantry-essentials, packages/services/src/db/adapters/neon.ts, packages/services/src/db/index.ts, packages/services/src/shared/audit.ts, packages/services/src/shared/index.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/patients/actions.ts
- complexity: standard
- demo: none

## Problem

Brainstorm § H (PANTRY_ESSENTIALS) is a short per-patient list of foods worth keeping in the
placard and the frigo, each with a personalised reason — "sardines — oméga-3, et tu aimes ça". It
is one of the first things Morgane hands a patient, and today she has nowhere to put it: the record
carries a profile, recommendations and consultation notes, and the pantry list lives in WhatsApp or
on paper. Nothing accumulates, nothing survives a phone, and the trail of what dropped off the list
between consultations — the WEEKLY_ADAPTATION record § H belongs to — does not exist at all.

This is stub 1 of the `patient-surface` epic, whose job is what Morgane _hands over_ rather than
what she keeps. It ladders up to the current initiative's "database and accounts under it"
objective — real records behind the surfaces, built manual-first so the AI round later changes read
and write sites rather than migrations. The epic's decisions of record
(`.icm/intake/patient-record/breakdown.md § Decisions`) bind it: no AI anywhere, and the patient
link is a separate stub.

## Proposed change

A per-patient pantry-essentials table, its service behind the storage seam, and an inline-editable
card on the admin patient page. No patient-facing change.

**The data.** One new table, `patient_pantry_essentials`, following `patient_recommendations`
exactly — the closest existing analogue, and the one whose shape this stub's requirements already
describe:

- `item` — the food, as Morgane writes it. Required.
- `why` — the short, personalised justification. Optional, defaults to `""`.
- `position` — her order within the list, sparse, a reorder rewriting the run.
- `archived_at` — nullable; set when an item leaves the active list.
- `patient_id` — FK to `patient_profiles`, `on delete cascade`, plus the usual timestamps.

**Nothing else.** § H's own warning is the design rule and it is enforced by absence: no quantity,
no season, no nutrient, no unit, no supplier — an item is a name and a why. `item` is capped at 120
characters and `why` at 280, short enough that the field cannot quietly become a paragraph, long
enough for the sentence § H shows.

**No grouping column.** Placard vs frigo is § H's framing, not its data, and the stub forbids
inventing the sections. The list ships flat; if Morgane turns out to think in sections, one
optional label column is an additive migration later. Raised below, not answered here.

**One active list per patient**, refreshed by archiving what drops off — the stub's lean answer.
Archived rows are the trail, kept and readable, never deleted by a refresh.

**The service**, `packages/services/src/db/services/pantry-essentials/`, mirrors the
patient-recommendations surface: list the active list ordered by position then creation, list the
archived rows newest-archive-first, add (appending past the highest position), update, move up or
down within the active list, archive, restore, and delete for the row that should never have been
written. Validation is zod at the service boundary, returning the existing `Result` shape; every
write touches the patient the way recommendations do. Registration is the one-line pair the seam
already requires: the table in `db/schema.ts` and its name in the `neon.ts` collection registry.

**The admin card** sits on `/patients/[id]` directly after the recommendations card — the pantry
list is content she hands over, so it reads with the protocol rather than with the consultation
history. It renders the active list in order with, per row, an inline pencil-to-edit form, move
up/down, and archive; an add form at the foot; and the archived items in a secondary section with
restore, the same read as the archived protocol. Labels and hints are French, and the layout is the
existing phone-first card layout — she may well type this during the consultation. Every write goes
through a server action in `apps/admin/lib/patients/actions.ts` and records an audit entry via
`lib/audit.ts`, with six new actions — `pantry.added`, `pantry.updated`, `pantry.archived`,
`pantry.restored`, `pantry.deleted`, `pantry.reordered` — added to the closed `auditActions`
vocabulary and to the console's French audit labels.

## Acceptance criteria

- [ ] `patient_pantry_essentials` exists in `packages/services/src/db/schema.ts` with `item`, `why`,
      `position`, `archived_at`, a cascading `patient_id` FK and the shared timestamps, and a
      checked-in migration generated by `pnpm db:generate` applies it to a database holding existing
      rows without manual intervention.
- [ ] A `PantryEssential` model exists in `packages/services/src/db/models/`, is re-exported through
      the models index and the `@remi/services/shared` type surface, and the collection name is
      registered in the `neon.ts` table registry.
- [ ] The pantry-essentials service is exported from `@remi/services/server` and covers: list
      active, list archived, add, update, move up/down, archive, restore, delete — each returning
      the existing `Result` shape and rejecting an unknown patient id as `not_found`.
- [ ] Adding an item appends it after the highest existing position; moving an item up or down
      swaps it with its neighbour in the active list only, and an item at either end has no move
      control in that direction.
- [ ] Archiving an item removes it from the active list without deleting the row: it appears in the
      archived section, and restoring returns it to the active list.
- [ ] `item` is required and rejected when empty or over 120 characters; `why` is optional, defaults
      to `""`, and is rejected over 280 characters. No quantity, season, nutrient or unit field
      exists anywhere in the table, the model or the form.
- [ ] The patient page at `/patients/[id]` shows a pantry-essentials card after the recommendations
      card with the active list in order, inline add / edit / reorder / archive, an archived section
      with restore, and French labels — usable at phone width.
- [ ] Each of the six writes records its audit entry through `apps/admin/lib/audit.ts`; the six
      `pantry.*` actions are in `auditActions` and carry French labels and an intent in the console's
      audit vocabulary.
- [ ] The service tests exercise the whole surface against the in-memory client: ordering, append
      position, reorder, archive/restore round trip, validation rejections, and that a delete removes
      only its own row.
- [ ] `/p/[token]` renders exactly as it does today — the pantry list appears nowhere on the patient
      link, and no route, token or visibility behaviour changes.

## Out of scope

- **Rendering the list on the patient link.** § J's "essentiels placard / frigo" segment is the
  `patient-link-segments` stub, which renders this table once it exists. Nothing patient-facing
  changes in this run.
- **Placard / frigo / congélateur grouping.** No section column, no label, no taxonomy — the stub
  forbids inventing them and the question is Morgane's. Raised below; additive later.
- **Dated list versions** ("the September list") as first-class rows. Archive-on-refresh is the
  shape this run builds. Raised below.
- **Per-item fields of any kind** — quantity, season, nutrients, units, price, supplier links. § H
  warns against them explicitly and the design rule here is enforced by their absence.
- **Any AI drafting of the list.** Morgane writes every item and every why; the table is the one the
  AI round later writes into.
- **Recipes, the meal journal, and the multi-page link** — stubs 2–4 of this epic.
- **Bulk entry, import, templates or a shared reusable pantry library** across patients. Every row
  is written for one patient.

## Open questions

Both are Morgane's to answer, not this run's — neither blocks an acceptance criterion, and nothing
built here assumes an answer.

- **Does she think in placard / frigo (/ congélateur) sections, or one flat list?** The list ships
  flat. If sections turn out to be how she works, they arrive as one optional label column — an
  additive migration and a grouping in the card, with no rewrite of what this run lands.
- **Is one active list per patient right, or does she want dated list versions the way recipes get
  weekly sets?** This run builds archive-rows-on-refresh, the stub's lean answer. Dated versions
  would be a second table keyed by date, not a change to this one; the archived rows already carry
  the "what dropped off, and when" trail either way.
