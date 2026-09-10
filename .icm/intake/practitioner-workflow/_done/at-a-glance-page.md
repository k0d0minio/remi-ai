# Stub: The at-a-glance page — a patient opens on the four questions, not on the schema

- feature-slug: at-a-glance-page
- sequence: 1 of 6
- depends-on: none
- priority: P1
- size: L
- sources: feedback § 4 (the proposed first screen) · § 2 rows 1, 3, 4 · § 9.1 ·
  `patient-workspace/breakdown.md` R1, R2, R10, R12, R21, R29, R30 (dropped epic, research kept) ·
  `apps/admin/app/(admin)/patients/[id]/page.tsx`

## What this is

When Morgane opens a patient, the first screen answers four questions at once: **Où en est-on ?
Sur quoi travaille-t-on ? Que s'est-il passé depuis la dernière fois ? Que dois-je faire
maintenant ?** Her § 4 lists what that screen holds, and this stub builds exactly that list:

- name + current status (the banner — R29);
- the 2–3 active goals with their evolution (latest check-in direction / measure per goal);
- the challenge / consigne of the week (the active instruction);
- the living summary, short — its first paragraph, with the rest one click away;
- the last meals and their feedback (the most recent journal entries, and the awaiting-feedback
  count that already loads);
- the main active recommendations (the top of each category, not the whole list);
- what to prepare for the next consultation — a **new** short free-text field on the patient,
  written by her, cleared or revised at the next consultation (`consultation-update` owns the
  write; this stub gives it its place and a minimal edit);
- quick actions: _Nouvelle consultation_ · _Ajouter une recommandation_ · _Proposer une recette_ ·
  _Ajouter un retour repas_ — each landing on the matching section or flow (until
  `consultation-update` and `recipe-in-place` ship, the first and third land on today's note form
  and assign form).

Everything else — the full recommendation list, supplements, essentials, recipes, the whole
journal, learnings, consultations, anamnesis, profile, consent, the sensitive zone — moves **behind**
the working view: secondary sections reached from a section index, tabs or folds. This stub
decides the navigation shape (the dropped epic's research argues tabs at ≤ 5 on the phone — R7,
R11 — and an index rail on desktop — R1, R10); `secondary-sections` finishes the detail sections
themselves. Existing card bodies are moved, not rebuilt.

The page keeps working on a phone (`apps/admin/AGENTS.md` § Interface: phone-usable is a
requirement). The § Interface rule that says the page "is one scrolling column ordered by how often
each block is reached" is rewritten to what becomes true: a working view first, details behind it,
on every size.

## Worth knowing

- Everything on the first screen except "what to prepare next time" is already loaded by
  `page.tsx` — this is a re-composition plus one new nullable text column on `patient_profiles`
  (or a one-row table beside `patient_summaries`; Define picks), migrated, audited.
- The stale copy on the goals card — "Rien de tout cela ne s'affiche sur le lien patient"
  (`page.tsx` ~line 239) — is wrong today (the link home renders goals) and goes with the card.
- One tree: the working view and the sections render once; desktop/phone are views over it, never
  two trees (the dropped epic's decision #2 still holds as engineering sense).
- `apps/docs/app/technical/applications` and `business/roles` describe the console's patient page;
  Release updates them in the same PR.

## Open questions — flag these on pickup

- "Évolution" of a goal: the latest check-in's direction (mieux / stable / moins bien) or a
  measure — which does she read first?
- How many recommendations count as "principales" — the first of each category, the first three
  overall, or those she flags? (A flag is a new column — ask before adding it.)
- Phone segments' labels (the dropped epic proposed _Suivi · Journal · Dossier · Profil_) — hers to
  name.

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/at-a-glance-page.md` in the remi-ai repo and
follow the pipeline from there. Read the stub, its epic's `breakdown.md` (§ Decisions binds), and
the dropped `_done/patient-workspace/breakdown.md` § Research for the layout disciplines — do not
redo the research. Scope: the admin patient page opens on a working view holding status, active
goals with evolution, the active instruction, the summary's head, last meals + awaiting-feedback
count, main active recommendations, a new "à préparer pour la prochaine consultation" field, and
four quick actions; every other section moves behind a section index / tabs / folds, bodies
untouched; phone stays first-class; `apps/admin/AGENTS.md` § Interface rewritten. Raise the stub's
open questions rather than answering them.
