# Stub: Bulk entry — several rows per save for recommendations, supplements and essentials

- feature-slug: bulk-entry
- sequence: 3 of 7
- depends-on: none
- priority: P1
- size: L
- sources: feedback § 5 (the seven bullets) · § 2 row 2 · § 9.3 · § 5's "ensuite, l'IA" example ·
  `apps/admin/components/patients/{recommendation,supplement,pantry}-add-form.tsx` ·
  `apps/admin/lib/patients/actions.ts`

## What this is

Today each of the three protocol lists takes **one row per submit**: a recommendation is
`{category, title, detail}` and a save; a supplement is four fields and a save; an essential is
two fields and a save. A real protocol is eight recommendations, five supplements and a dozen
essentials — thirty round-trips. Her § 5 asks for the opposite, and this stub delivers its first
four bullets without any AI:

- **Recommendations** — one edit mode for the whole section: a table of rows (category, title,
  detail), add a row, remove a row, reorder, **one save**. Existing rows edit in the same grid.
- **Supplements** — the same, as the compact table her § 5 names: name · dose · moment · raison,
  every row visible at once.
- **Essentials** — the same, item + why, many at once; a paste-a-list affordance (one item per
  line becomes one row per line) since she will paste from her notes.
- **One save per logical section**, not per item; optional details (detail text, reason, timing)
  fold closed so the base action stays fast (§ 5 bullet 7).

Behind it, a **batch write** per section: one server action that takes the section's rows and
applies inserts, updates, archives and reorders in one transaction, audited as one event with the
counts. The single-row actions stay for the quick-add on the phone and for the patient-loop's own
writes; the batch is the desk path.

Her § 5 example — "j'écris ou je dicte « Oméga-3 2 g/jour au repas, magnésium bisglycinate 300 mg
le soir, vitamine D 2 000 UI/jour » et REMI transforme en champs structurés" — is what this grid is
shaped for: the AI round fills rows into this same edit mode (`ai-assist/free-text-to-rows`, P2 by
decision #8). Nothing in this stub calls a model.

## Worth knowing

- The forms are client components on `useActionState`; a multi-row grid wants local row state
  and a single submit — keep it a form (a hidden JSON field or indexed field names), so it still
  works without JS where the rest of admin does.
- Positions: the services already order by `position`; the batch replaces the section's order in
  one go — no per-row move-up/move-down calls.
- Concurrency: two operators editing the same section is a real case (Morgane on the phone, an
  operator at the desk). Last-write-wins with the audit event naming both is acceptable for the
  beta; say so in the PR.
- `@remi/ui` has `Table`; a grid of inputs in table cells is admin-local composition, not a new
  primitive (CONVENTIONS § Keeping the codebase lean).

## Open questions — flag these on pickup

- Does she want the category picker per row, or a section per category with rows under each (her
  mental model when she writes a protocol)?
- Supplements: is `supplement` still excluded from the recommendation vocabulary once supplements
  have their own table (`vocabulary.ts` excludes it today), or does she sometimes want a supplement
  as a recommendation line?
- Paste-a-list for recommendations too (one line → one title), or only for essentials?

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/bulk-entry.md` in the remi-ai repo and follow
the pipeline from there. Read the stub and its epic's `breakdown.md` (§ Decisions binds) first.
Scope: recommendations, supplements and pantry essentials each get a whole-section edit mode — a
multi-row grid with add / remove / reorder and one save — backed by one batch server action per
section (one transaction, one audit event), with a paste-a-list affordance for essentials and
optional details folded closed; single-row actions kept for the phone quick-add. No AI, nothing
on the patient link. Raise the stub's open questions rather than answering them.
