# Build notes — at-a-glance-page

## What shipped

Two commits on `claude/at-a-glance-page`, PR #93:

1. `c58886c` — services: `next_consultation_prep` column (`patient_profiles`, nullable text),
   migration `0012`, `PatientProfile` model field, `setPatientNextConsultationPrep` service action
   - unit tests.
2. `bb79299` — admin: `updateNextConsultationPrepAction` (reads before write, audits
   `next_consultation_prep.updated` only on real change), the section registry
   (`patient-navigation.tsx`), six working-view components, `page.tsx` re-composition, the
   segmented-control CSS in `globals.css`, and the `apps/admin/AGENTS.md` § Interface rewrite.

Acceptance criteria 1–8 ticked on the PR body; criterion 9 (the `apps/docs` pages for
`technical/applications` and `business/roles`) is **Release responsibility, same PR** — left
unticked for Release.

## Decisions taken during Build

- **Segment mapping** (confirmed with the owner via question): Suivi = Objectifs et consigne,
  Recommandations, Recommandations archivées, Protocole de compléments, Essentiels placard/frigo;
  Journal = Journal des repas, Repas archivés, À retenir; Dossier = Lien patient, Consultations,
  Recettes, Recettes précédentes, Anamnèse; Profil = Profil, Zone sensible. The owner-approved list
  omitted the **Résumé vivant** card (the full summary editor); it was assigned to **Suivi** as the
  natural home beside the summary head.
- **Archived cards** inherit their active card's segment (archived recommendations sit with
  Recommandations, archived meals with the journal, etc.). The medium anchor row is the only
  navigation that surfaces every section without grouping.
- **"Résumé vivant"** stays as the full-editor card under Suivi; the working view's Résumé card is
  a read-only head. Editing continues to happen in the secondary section.
- **Empty instruction** on the working view: `InstructionBlock` with `superseded={[]}` renders the
  live editor, so the consigne can be written from the working view; superseded ones are only on
  the secondary card.
- **Prep note save**: on blur or Enter (single-line `Input`, `maxLength` 10000); Escape cancels.
  Empty string is normalised to `NULL` in the service — `NULL` = not set, per the spec.

## Notes for Release

- Docs criteria #9 is unticked here; update both `/technical/applications` and `/business/roles`
  pages in this PR at Release.
- The working view intentionally re-used existing components where it could: `InstructionBlock`,
  `GoalAddForm`, `SummaryHead` is new but lean. No card body was rewritten.
- `apps/demo` untouched; the patient link (`/p/[token]`) untouched.
