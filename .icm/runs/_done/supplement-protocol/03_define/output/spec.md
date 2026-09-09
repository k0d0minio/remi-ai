# Spec: Supplement protocol — structured prescribed rows, category overlap settled

- slug: supplement-protocol
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-supplement.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/patient-supplements, packages/services/src/shared/patient.ts, packages/services/src/shared/audit.ts, apps/admin/components/patients/supplement-protocol.tsx, apps/admin/components/patients/supplement-add-form.tsx, apps/admin/components/patients/supplement-item.tsx, apps/admin/components/patients/recommendation-add-form.tsx, apps/admin/components/patients/patient-form.tsx, apps/admin/components/patients/vocabulary.ts, apps/admin/lib/patients/actions.ts, apps/admin/app/(admin)/patients/[id]/page.tsx
- complexity: standard
- demo: none

## Problem

Brainstorm § G (SUPPLEMENTS) asks for a minimal but _structured_ display of the supplements Morgane
prescribes: name, dose if needed, moment of intake if needed, reason. Today that prescription lives
in prose in two places at once — the `supplements` free-text column on `patient_profiles` (what the
patient already takes) and, sometimes, recommendations under the existing `supplement` category
(what Morgane prescribes). Neither can render § G's four columns, and the future safety check
("current medications exist only to secure proposals") needs prescribed supplements as rows, not
sentences.

This is stub 6 of the `patient-record` epic: the manual record Morgane runs a consultation from,
built as permanent data layer now so the AI round later changes read and write sites rather than
migrations (`.icm/intake/patient-record/breakdown.md`). `business/initiatives` names the
terrain-first, manual-before-AI sequencing this follows. The epic's decisions of record bind it —
admin + data layer only, no patient-facing change (§ J's "compléments validés" rendering on the
link is the `patient-surface` epic, not this stub).

## Proposed change

**A new `patient_supplements` table** for the prescribed protocol, per patient — modelled exactly
like `patient_recommendations` minus the category:

- `id`, `patientId` (FK to `patient_profiles`, `onDelete: cascade`).
- `name` — short free text, **the only required field**.
- `dose`, `timing`, `reason` — short free text, each `not null default ''`. § G's other three
  columns: dose if needed, moment of intake if needed, why.
- `position` — `integer not null default 0`, sparse, ordered within the patient (§ G is one flat
  ordered list, not category-grouped like recommendations).
- `archivedAt` — nullable timestamp. Archive-not-delete: a stopped supplement is history, exactly
  like an archived recommendation — "pourquoi on a arrêté le magnésium" is answered by a row.
- `...timestamps` (the shared `createdAt` / `updatedAt`). **No `started_on` column** — created-at is
  enough (open question 2, Morgane's call; see Decisions).

**A service behind the seam** at `packages/services/src/db/services/patient-supplements/`, mirroring
`patient-recommendations`: `listPatientSupplements` (active, ordered by position then created-at),
`listArchivedPatientSupplements` (archived, most-recently-archived first), `addPatientSupplement`
(appends at `nextPosition`), `updatePatientSupplement` (partial patch), `movePatientSupplement`
(reorder), `archivePatientSupplement(id, archived)` (toggle), `deletePatientSupplement`. Zod input
shape: `name` trimmed min 1 max 200; `dose` / `timing` / `reason` trimmed, capped. Every write calls
`touchPatient`. The model type lives in `db/models/patient-supplement.ts`, exported from the models
barrel; the seam collection is `getDatabase().collection<PatientSupplement>("patient_supplements")`,
tested against the in-memory client.

**A protocol card on the admin patient page** (`/patients/[id]`), mirroring the recommendations
card: the active protocol as a compact table (name · dose · timing · reason), add / edit / archive
inline, reorder, and archived rows behind a `<details>` fold. New components
`supplement-protocol.tsx`, `supplement-add-form.tsx`, `supplement-item.tsx`, wired through new server
actions in `apps/admin/lib/patients/actions.ts`, each writing the matching audit entry.

**The overlap with the `supplement` recommendation category is settled** (open question 1, Morgane's
call — Decisions): the `supplement` category is **retired from the recommendation _add_ form**. The
add form's category Select stops offering it; the protocol card takes over as the single home for
new prescribed supplements. Existing `supplement`-category recommendation rows are **untouched**:
the `recommendationCategories` constant, the `categoryLabels["supplement"]` label, the service's zod
enum and `RecommendationGroups` rendering all keep `supplement`, so stored rows still validate, still
group, still render. Only the set the add form iterates changes — a new derived
`addableRecommendationCategories` constant (= `recommendationCategories` without `supplement`) that
the add form's Select maps over. No automated migration of existing rows: if Morgane wants the
handful moved into the protocol she re-encodes them by hand — the same afternoon-not-script rule as
`profile-fields`.

**The profile free-text field is relabelled** to say what it is for: `patient-form.tsx`'s
`supplements` field label and hint become "compléments déjà pris, hors protocole" (already taking,
outside the protocol). The column name, type and stored content are unchanged — label only, no
migration, no merge.

**Audit vocabulary** gains `supplement.added` / `.updated` / `.archived` / `.restored` / `.deleted`
/ `.reordered` in `packages/services/src/shared/audit.ts`, matching the recommendation set; writes
audit via `apps/admin/lib/audit.ts`.

Decisions taken at Define (Jamie, 2026-09-03, channeling Morgane's calls) on the stub's open
questions: (1) overlap — retire the `supplement` category from the add form, existing rows left
rendering, no migration; (2) start date — created-at is enough, no `started_on` column.

## Acceptance criteria

- [ ] A new `patient_supplements` table exists with `name`, `dose`, `timing`, `reason`, `position`,
      `archivedAt`, patient FK (cascade) and the shared timestamps, with a checked-in migration
      generated by `pnpm db:generate` that applies to a database holding existing rows without
      manual intervention. `name` is required; `dose` / `timing` / `reason` are `not null default ''`.
- [ ] `PatientSupplement` in `packages/services/src/db/models/patient-supplement.ts` carries the
      fields and is exported from the models barrel, following the `PatientRecommendation` shape.
- [ ] A `patient-supplements` service behind the seam provides list / listArchived / add / update /
      move / archive(toggle) / delete, ordered by `position` then created-at, appending new rows at
      the next position; `name` is validated non-empty and each write calls `touchPatient`.
- [ ] The patient page shows a protocol card: active rows as a compact table (name, dose, timing,
      reason), add / edit / archive / reorder inline, archived rows behind a fold — saving through
      new server actions and re-rendering on reload, mirroring the recommendations card.
- [ ] The `supplement` category is removed from the recommendation add form's category Select
      (via a derived `addableRecommendationCategories` constant), while `recommendationCategories`,
      `categoryLabels["supplement"]`, the recommendation service's zod enum and `RecommendationGroups`
      are unchanged — existing `supplement`-category rows still validate, group and render.
- [ ] The profile form's `supplements` field is relabelled to name "compléments déjà pris, hors
      protocole"; the `patient_profiles.supplements` column name, type and stored content are
      unchanged (no migration, no data move).
- [ ] Each protocol write records a `supplement.*` audit entry via `apps/admin/lib/audit.ts`, with
      the new actions added to `packages/services/src/shared/audit.ts`.
- [ ] The `patient-supplements` service tests round-trip the fields through add / update / move /
      archive / restore against the in-memory client, including archive-then-restore and the
      required-name rejection.
- [ ] `/p/[token]` renders exactly as it does today — nothing from the protocol appears on the
      patient link in this stub.

## Out of scope

- **Rendering the protocol on `/p/[token]`** ("compléments validés", § J). That is the
  `patient-surface` epic (epic decision 4: this epic is admin + data layer only).
- **Migrating or merging** existing `supplement`-category recommendations, or the profile's
  `supplements` prose. No backfill, no parser, no merge — Morgane re-encodes by hand if she wants.
- **The future medication/supplement safety check** ("current medications exist only to secure
  proposals"). This stub lands the rows it will read; the check itself is a later round.
- **Any patient-link change** — no token, routing, visibility or consent change.
- **A start date per row** (`started_on`). Settled as out for this run; created-at is enough. Can
  arrive later as a nullable column with no reshape if Morgane wants "depuis octobre".

## Open questions

- none — both stub open questions are resolved above (Decisions), and neither leaves anything for
  Build to decide.
