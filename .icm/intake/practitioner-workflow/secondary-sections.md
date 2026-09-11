# Stub: Secondary sections — anamnesis, profile, consent and history behind the working view

- feature-slug: secondary-sections
- sequence: 7 of 7
- depends-on: at-a-glance-page
- priority: P1
- size: S
- sources: feedback § 4 last paragraph ("l'anamnèse détaillée, le profil complet, le consentement
  et les données administratives doivent rester accessibles, mais …") · § 2 row 1 ·
  `_done/patient-workspace/_done/history-folds.md` (dropped; R8, R9, R13, R16, R27 still apply) ·
  `apps/admin/components/patients/{anamnesis-block,patient-form,delete-patient}.tsx`

## What this is

`at-a-glance-page` moves the detail sections behind the working view and decides how they are
reached. This stub finishes them so they are good where they now live:

- **Anamnesis** — twelve categories always listed today, each edited one at a time. Behind the
  working view it becomes a "Dossier" section: filled categories first with their text, empty ones
  as a short list of "Compléter" links; still one category edited at a time.
- **Profile, consent, administrative data** — the 500-line profile form becomes a read summary
  (identity, measures, diet, allergies, intolerances, budget, likes cooking, consent date and
  channel) with "Modifier" opening the form in place. The patient-loop's `patient-profile-edit`
  lets the patient edit the food-preference half; this read summary shows who last changed what.
- **Archived rows** — recommendations, essentials, recipes and meals each fold their archived rows
  into their own section as a closed accordion with a count ("Archivées · 3"), the way
  observations already do. Four conditional cards disappear. (The dropped `history-folds` stub's
  design, kept.)
- **The sensitive zone** — the delete flow, folded closed at the very end of the profile section,
  never a red card on the working view.

## Worth knowing

- Nothing here changes a table. The anamnesis, profile and delete components move; their forms are
  untouched.
- Homogeneous rows (recommendation entries, essentials, meals) read better as list rows than as
  nested cards (R13) — do it where a section is touched anyway, do not sweep the page for it.
- `RETENTION.md` describes what the console shows about consent; if the read summary changes what
  is visible, update it in the same PR.

## Open questions — flag these on pickup

- Does she want the anamnesis reachable during a consultation (a tab away) or only when preparing
  one (a page away)? It decides whether "Dossier" is a segment or a link.

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/secondary-sections.md` in the remi-ai repo
and follow the pipeline from there. Read the stub, its epic's `breakdown.md` (§ Decisions binds)
and the `at-a-glance-page` run's notes first. Scope: behind the working view, the anamnesis
becomes a filled-first dossier section, the profile a read summary with edit-in-place, archived
rows fold into their sections with counts, and the delete flow folds closed at the end of the
profile; components moved, forms untouched, no table change, nothing on the patient link. Raise
the stub's open question rather than answering it.
