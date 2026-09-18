# Spec: Reuse and duplicate — a protocol block copied from another patient or a template

- slug: reuse-and-duplicate
- personas: practitioner, operator
- touches: apps/admin/components/patients/, apps/admin/lib/patients/actions.ts, apps/admin/app/(admin)/patients/[id]/page.tsx, packages/services/src/db/schema.ts, packages/services/src/db/migrations/, packages/services/src/db/services/protocol-templates/, packages/services/src/db/services/patient-recommendations/, packages/services/src/db/services/patient-supplements/, packages/services/src/db/services/pantry-essentials/, packages/services/src/db/services/recipe-assignments/, packages/services/src/shared/audit.ts
- complexity: complex

Context budget: beyond the Inputs table — the two dependency specs (`bulk-entry`, `recipe-in-place`) and the four row shapes in `db/schema.ts`, read to state the copy rule per field and name real paths in `touches:`. `business/scope` was not loaded: the stub traces to Morgane's feedback, which ranks above it (D-11).

## Problem

Ten patients on « augmenter les protéines, favoriser les oméga-3, limiter les sucres raffinés » is
the same three rows typed ten times. `bulk-entry` (#97) made a section's rows editable together and
`recipe-in-place` (#95) made a recipe creatable and assignable from the patient page, so encoding a
protocol is now one save per section instead of thirty — but every one of those rows is still typed
from nothing, on every patient. Her § 5 asks for « fonctions de duplication / réutilisation pour les
recommandations, compléments et recettes récurrentes », and the epic's product rule is blunter than
the ask: a practitioner never encodes the same information twice.

It matters because the console is the precondition for everything else. The current initiative
(`business/initiatives`) is a patient experience validated on real terrain before the 19 December
open day, and its second objective — a usable version the partner clinic's team tests on
1 December — is reached by Morgane accompanying 10–15 patients herself. Ten patients is where
retyping stops being an irritation and becomes the reason a protocol is encoded thinly or not at
all. This is the last stub of `practitioner-workflow`; the six before it made one patient fast, and
this one makes the tenth patient fast.

## Proposed change

Two ways to fill a section's edit grid from something that already exists, both landing as unsaved
rows in the multi-row edit mode `bulk-entry` built, so nothing reaches the database until she has
read it and pressed the section's one save. Copies are copies: no row is linked back to its source,
and changing a source later changes nothing that was copied from it (D-5's posture for recipes,
applied to protocol rows).

**Copy from another patient.** In a section's edit mode, « Reprendre de … » opens a picker of her
other patients — pseudonym and last consultation date, filtered by typing, no roster redesign.
Choosing one lists that patient's **active** rows of the same kind with checkboxes; the chosen rows
are appended to the grid, unsaved. The four kinds are the three protocol sections
(recommendations, supplements, pantry essentials) and assigned recipes.

**Personal templates.** A named set of rows of one kind — « Base anti-inflammatoire »,
« Compléments fatigue » — saved from any grid and inserted into any other grid of that kind.
One small table, `protocol_templates` (kind, name, rows as JSON, owning operator, a shared flag,
timestamps): deliberately not a normalised practitioner base, which brainstorm § 7 rules out.

Recipes reuse through the library and variants already (`recipe-in-place`); here they only join the
copy-from-patient picker, so a week's assignment set can be reused. **Recipes are not templatable**
— a named set of library recipes is a patient group in disguise, and groups are parked in
`beyond-december/patient-groups`.

### What a copy carries

A copied row carries the **factual** fields and arrives with the **personal** ones blank, because
the personal ones were written to one person and a justification saved unread onto a third patient
is worse than a blank. The rule is per field, and the spec states it once:

| Kind             | Carries                                        | Arrives blank                        |
| ---------------- | ---------------------------------------------- | ------------------------------------ |
| Recommendation   | `category`, `title`                            | `detail`                             |
| Supplement       | `name`, `dose`, `timing`                       | `reason`                             |
| Pantry essential | `item`                                         | `why`                                |
| Assigned recipe  | the library recipe itself (referenced, not copied) | `note` (« pourquoi pour toi ») |

A copied recipe assignment takes **today** as its `assigned_on`, never the source patient's date.
Archived rows are never offered by the picker, and a row already in the grid is not de-duplicated:
she sees both and removes one.

### Templates

- **Saving.** « Enregistrer comme modèle » in a section's edit mode takes the grid's rows into a
  small editable preview with the personal fields **already blanked** by the table above. She
  adapts what a reusable set deserves — a generic « raison » for a supplement base is worth
  keeping, and here it is text she wrote for the template rather than text lifted off a patient —
  names the set, and saves. Nothing is written to the patient by this gesture.
- **Inserting.** « Insérer un modèle » lists her templates of that section's kind; the chosen one's
  rows are appended to the grid, unsaved, exactly as a copy is.
- **Managing.** The same list renames and deletes. Saving under a name she already uses for that
  kind asks to overwrite, and overwriting replaces the set's rows.
- **Ownership.** A template belongs to the operator who saved it and is private by default; a
  « partager » control makes it visible to every operator of the console. She sees her own plus the
  shared ones; only the owner renames, overwrites, deletes or un-shares.
- **Row shape.** The stored rows are read **tolerantly**, not migrated: an unknown field is
  ignored and a missing one takes the column's own default (the schema's `.default("")` posture),
  so a later field added to a row shape neither breaks the templates saved before it nor needs a
  data migration. A template that predates a field simply inserts rows with that field empty.

### The audit trail

Reading another patient's rows into this patient's grid is health data crossing records. It is an
operator acting inside her own console, so no new permission is introduced (`business/roles` §
Operator), but it is recorded: **the picker's confirmation writes one audit event per copy**,
naming the source patient and the number of rows taken, before anything is saved. That is
deliberate — the copy is the moment the data crossed, and she may then abandon the grid without
saving, which would leave no trace at all if the event waited for the save. Template saves,
renames, overwrites, deletes and share-flag changes each write one event; inserting a template
writes none, because a template holds no patient's data by the time it is stored.

The section's own save is unchanged: `bulk-entry`'s batch action still writes its single
counts-carrying event, and nothing here adds a second write path to a protocol section.

## Acceptance criteria

- [ ] In the edit mode of each of the three protocol sections, « Reprendre de … » opens a picker of the operator's other patients showing pseudonym and last consultation date, filtered by typing
- [ ] Choosing a patient lists that patient's active rows of the same kind with checkboxes; the chosen rows are appended to the current grid unsaved, and cancelling the section leaves both patients unchanged
- [ ] A copied row carries the factual fields and arrives with the personal ones blank, per the table above; archived rows are never offered
- [ ] Assigned recipes join the copy-from-patient picker: the chosen assignments append as unsaved assignment rows referencing the same library recipes, with a blank note and today's date
- [ ] « Enregistrer comme modèle » opens the grid's rows in an editable preview with the personal fields blanked, and saves them under a name as a template of that section's kind, writing nothing to the patient
- [ ] « Insérer un modèle » lists the operator's templates of that kind and appends the chosen one's rows to the grid unsaved
- [ ] A template can be renamed and deleted from that list; saving under an existing name of the same kind asks to overwrite and replaces its rows
- [ ] A template is private to the operator who saved it until she shares it; a shared template is listed for every operator, and only its owner renames, overwrites, deletes or un-shares it
- [ ] The whole feature is backed by one new `protocol_templates` table (kind, name, rows as JSON, owning operator, shared flag, timestamps) with a migration in the repo, and no other table gains a column
- [ ] A template whose stored rows lack a field the row shape has gained inserts rows with that field at its default, with no migration and no error
- [ ] Copying rows from another patient writes one audit event naming the source patient and the row count, at the moment of the copy rather than at the section's save
- [ ] Saving, renaming, overwriting, deleting or changing the share flag of a template each write one audit event
- [ ] A patient's own page never offers that patient in its own « Reprendre de … » picker

## Out of scope

- **Templates of recipes** — a named set of library recipes is `beyond-december/patient-groups` in disguise; recipes reuse through the copy-from-patient picker only.
- **A normalised practitioner base** — brainstorm § 7. Rows are stored as JSON on one table and nothing points at a catalogue.
- **Any AI**, including suggesting which template fits a patient (`ai-assist`; decisions D-8 and D-14).
- **Anything on the patient link** — nothing here renders in `apps/web`, and the patient is never told a row was copied.
- **Copying anything but the four kinds named** — goals, instructions, the summary, anamnesis, notes, observations and meal entries are not copyable this run.
- **Editing a template's rows after it is saved** — the editable preview exists at save time; afterwards a set that changed is overwritten under the same name.
- **A console-wide template screen.** Templates are reached from the section they belong to; no `/modeles` page.
- **Retro-fitting provenance onto copied rows.** A copy is a copy (D-5); no `copied_from` column on the protocol tables.
- **Concurrency beyond `bulk-entry`'s.** Two operators editing the same section stays last-write-wins, as that spec settled and stated.

## Open questions

- none — the stub's two **Open for Define** points were settled with the operator in session (templates are per-operator with a « partager » flag; a copy carries the factual fields and blanks the personal ones), along with the template-management surface and the blanking rule at save time.
