# Spec: The at-a-glance page — a patient opens on the four questions, not on the schema

- slug: at-a-glance-page
- apps: admin, docs
- touches: apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/, apps/admin/AGENTS.md, packages/services/src/db/schema.ts, apps/docs/app/technical/applications, apps/docs/app/business/roles
- complexity: complex

## Problem

When Morgane opens a patient, the first thing she sees is the same long scroll she always saw — seventeen cards, one row per save, the link at the top and deletion at the bottom. There is no working view: nothing distinguishes what she reads at the start of a consultation from what she touches once a month. The page answers no question on its own; she has to hunt for status, goals, the instruction, recent meals, and the main recommendations every time.

The dropped `patient-workspace` epic researched the layout disciplines (R1–R30) and settled the engineering shape — one tree, three window classes, progressive disclosure. This stub inherits those decisions and applies them to a page that now has more data than it did then.

## Proposed change

The admin patient page opens on a **working view** that answers four questions at a glance: _Où en est-on ? Sur quoi travaille-t-on ? Que s'est-il passé depuis la dernière fois ? Que dois-je faire maintenant ?_ Every other section moves behind a section index / tabs / folds, with bodies untouched.

### The working view — what she opens on

The working view is the default landing state of the page. It holds, in order:

1. **Status banner** (R29) — pseudonym, status badge, the age · sex · measures line. Already exists; repositioned to stay above the working view and above every secondary section (sticky on desktop, part of the compact banner on phone).

2. **Active goals with evolution** — the 2–3 active goals, each showing its **measure first** (the latest numeric value from the most recent check-in), then the **direction** (mieux / stable / moins bien). The add-goal form stays inline below the list when the max is not reached. Archived goals are hidden from the working view — they live in the secondary sections.

3. **Active instruction** — the current consigne / challenge of the week, rendered by the existing `InstructionBlock`. Superseded instructions are hidden from the working view.

4. **Living summary head** — the first paragraph of the summary. A "Voir le résumé complet" trigger reveals the rest inline (client island, no navigation). When the summary has no content, a prompt to write one appears.

5. **Last meals and awaiting-feedback count** — the most recent 3–5 meal entries from the journal, plus the awaiting-feedback count already loaded. Full journal is in the secondary sections.

6. **Main active recommendations** — the **first recommendation of each category** from the active list. One compact row per category, showing name and key detail. The full recommendation list (all categories, all entries) is in the secondary sections.

7. **"À préparer pour la prochaine consultation"** — a new nullable free-text field on `patient_profiles`. Written by Morgane, cleared or revised at the next consultation (owned by `consultation-update`; this stub gives it its place and a minimal inline edit). Empty state: a prompt to write. Rendered as a single text block with an edit affordance.

8. **Quick actions** — a row of four action buttons:
   - _Nouvelle consultation_ → lands on the note form in the consultations section (until `consultation-update` ships)
   - _Ajouter une recommandation_ → lands on the recommendation add form
   - _Proposer une recette_ → lands on the assign-form (until `recipe-in-place` ships)
   - _Ajouter un retour repas_ → lands on the meal add form

   Each action scrolls to the target section or opens its form. On phone, actions are accessible from the working view content.

### Navigation — everything else

All sections not in the working view are **secondary sections**, reached from navigation. Bodies are moved, not rebuilt — every existing card component stays as-is.

**Desktop (lg, ≥ 1024 px):**

- The working view is the main content area. Secondary sections are below it in a single-column scroll.
- A **sticky section index** (R10) at the top of a right rail lists every section (working view + all secondary sections) with counts. The current section is marked; clicking an entry scrolls to it.
- The working view and all secondary sections render in the same DOM order (R1 design decision #2 from the dropped epic). The section index is the only desktop chrome beyond the existing layout.

**Phone (< 768 px):**

- A **segmented control** (R7, R11) with at most five segments replaces the full scroll: **Suivi · Journal · Dossier · Profil**. Each segment shows its sections; the working view content lives in "Suivi".
- The segment is in the URL so a link lands on it and back-navigation restores it.
- A pinned bottom "Ajouter" action (R15, R23) opens a bottom sheet whose first step asks what to add.

**Medium (md, 768–1023 px):**

- Single column; the section index becomes a horizontally scrolling row of anchors (R10).

### The section registry

A shared list defines every section and which segments/index it belongs to. The working view is not a section — it is a composed view drawn from data the page already loads. Secondary sections are the existing cards, each registered once. The registry drives:

- The desktop section index
- The phone segmented control
- The medium anchor row

### New data: "À préparer pour la prochaine consultation"

- **Schema:** add `next_consultation_prep` (text, nullable) to `patient_profiles`. Nullable because most patients will not have it set initially; empty string is not used (NULL = not set).
- **Service:** expose a minimal update action for this field only (the `consultation-update` stub will extend it with the clear/revised logic).
- **Display:** the working view shows the field with an inline edit affordance (click to edit, save on blur or Enter, cancel on Escape). Empty state: "Ajouter une note pour la prochaine consultation."

### `apps/admin/AGENTS.md` § Interface rewrite

Replace the current § Interface with:

> **Phone-usable is a requirement, not a nicety.** Morgane works from consultations. The patient page opens on a working view — status, goals, instruction, summary head, last meals, main recommendations, a preparation note, and quick actions. Every other section is behind navigation: a section index on desktop, a segmented control on phone (Suivi · Journal · Dossier · Profil). Bodies of secondary sections are untouched.

### Stale copy removal

The goals card description ("Rien de tout cela ne s'affiche sur le lien patient" — `page.tsx` ~line 239) is wrong today (the link home renders goals) and is removed with the card re-composition.

## Acceptance criteria

- [ ] The patient page opens on a working view containing: status banner, active goals (measure first, direction second), active instruction, summary head (first paragraph, expandable), last meals + awaiting-feedback count, main recommendations (first per category), "à préparer" field, and four quick actions.
- [ ] Every section not in the working view is behind a section index (desktop) or segmented control (phone) with bodies untouched — no existing card component is rewritten.
- [ ] The `next_consultation_prep` column exists on `patient_profiles`, is nullable text, and has a minimal service action to read and update it.
- [ ] The working view and secondary sections render in one DOM order; desktop, medium, and phone are views over that order, never two trees.
- [ ] The phone segmented control shows at most 5 segments (Suivi · Journal · Dossier · Profil), the active segment is in the URL, and back-navigation restores it.
- [ ] The desktop section index is sticky, shows the current section, and clicking an entry scrolls to it.
- [ ] The stale goals card description is removed.
- [ ] `apps/admin/AGENTS.md` § Interface is rewritten as specified.
- [ ] The `apps/docs` pages for `technical/applications` and `business/roles` are updated to reflect the new page layout (Release responsibility, same PR).

## Out of scope

- The bodies of secondary sections — `secondary-sections` stub finishes those.
- The "Nouvelle consultation" and "Proposer une recette" landing flows — `consultation-update` and `recipe-in-place` own those.
- Bulk entry, recipe creation, reuse and duplicate — separate stubs.
- Any change to the patient link (`/p/[token]`).
- The add-form bottom sheet on phone — belongs to `add-surfaces` in the dropped epic's build order, and to `secondary-sections` or a future stub here.
- Moving from the current `max-w-2xl` to the dropped epic's `wide` (88 rem) container — that is a frame-level change that belongs to a later stub when the desktop layout is fully specified.

## Open questions

- None — all three stub questions resolved (goal evolution: measure first, direction second; main recommendations: first per category; phone segments: Suivi · Journal · Dossier · Profil).
