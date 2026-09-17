# Spec: Secondary sections — the dossier, the profile and what was archived, good where they now live

- slug: secondary-sections
- apps: admin, docs
- touches: apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/, apps/admin/AGENTS.md, apps/docs/app/technical/applications, apps/docs/app/business/roles
- complexity: standard

## Problem

`at-a-glance-page` (#93) moved every detail section behind the working view and settled how each is
reached, but deliberately left their bodies alone — "bodies of secondary sections are untouched" is
written into `apps/admin/AGENTS.md` and into the spec's Out of scope, with this stub named as the
finisher. So the sections are now in the right place and still shaped for encoding the database
rather than for Morgane's work.

Three of them are the ones her feedback names (§ 4 last paragraph, § 2 row 1). The anamnesis lists
all twelve categories always, so a record where two are filled reads as ten empty headings. The
profile is a 500-line form that must be opened, scanned and scrolled to read a consent date. Four
of the page's sections exist only to hold archived rows and appear conditionally, so the page's
shape changes from patient to patient — and the delete flow is a red card at the foot of it.

This is the last stub of `practitioner-workflow`, the epic that carries the initiative's "usable
patient version for the partner clinic to test" objective: nothing downstream gets real data until
encoding a patient takes minutes rather than an afternoon.

## Proposed change

Four changes inside the secondary sections. No table changes, no service changes, no change to the
patient link, and the two forms that do the writing — `PatientForm` and the anamnesis category
editor — are moved and re-composed, never rewritten.

### 1. Anamnèse — filled first, empty as an invitation

The `anamnesis` section (Dossier segment) renders, in order:

- A one-line read of where the record stands: `« 7 des 12 domaines renseignés »`.
- **The filled categories**, in `anamnesisCategories` order, each as today: heading, body text,
  a "Modifier" button that opens that category's textarea in place.
- **The empty categories**, at the end, as one short list of "Compléter" buttons — the category
  name is the button. Clicking one opens that category's textarea in place, in the list; on save
  the category re-renders among the filled ones.

Still **one category edited at a time** — the `editing` state in `AnamnesisBlock` is unchanged.
Nothing here reaches the patient link. When every category is empty the section is the "à
compléter" list alone; when all twelve are filled the list is absent.

### 2. Profil — a read summary with edit in place

The `profile` section renders a **read summary** by default. Its fields are the stub's list, in
three groups:

| Group             | Fields                                                                         |
| ----------------- | ------------------------------------------------------------------------------ |
| Identité          | pseudonym, full name, email, language, status                                  |
| Mesures           | birth date (as age), sex, height, weight                                       |
| Alimentation      | dietary regime, allergies, intolerances, food budget, likes cooking            |
| Consentement      | consent date + channel, or "Pas encore enregistré"                             |

Below it, `« Modifié le <date> »` from `patient.lastEditedAt`.

A **"Modifier"** button swaps the read summary for `<PatientForm patient={patient} />` in place —
the whole existing form, every field, unchanged, including the fields the summary does not show
(objective, medications, supplements already taken, constraints, preferences, referral, the legacy
`anamnesis` textarea). A **"Fermer"** control returns to the read summary. The form is not closed
automatically on save: `PatientForm` owns its own `useActionState` result and saying "Enregistré."
where she is looking is worth more than an automatic collapse, and touching that would mean
rewriting the form.

Empty fields read `—`; a group whose fields are all empty reads `rien d'encodé`. The consent read
keeps today's recorded / not-recorded distinction exactly, so `.icm/docs/RETENTION.md § Consent`
stays true as written and needs no edit.

### 3. Archived rows fold into their section, with a count

Every archived grouping on the page becomes a **closed `Accordion` fold at the end of its parent
section**, its trigger carrying the count — `« Archivées · 3 »`. The fold wraps the existing list
component; it does not fork it.

Four conditional sections disappear into their parents:

| Today's section              | Folds into        | Fold label                    |
| ---------------------------- | ----------------- | ----------------------------- |
| `archived-recommendations`   | `recommendations` | Recommandations archivées · n |
| `archived-pantry`            | `pantry`          | Essentiels archivés · n       |
| `past-recipes`               | `recipes`         | Recettes précédentes · n      |
| `archived-meals`             | `meals`           | Repas archivés · n            |

Three groupings that already sit inside their section are normalised onto the same fold, so the
page has one way of showing history rather than three: archived supplements (a raw `<details>`
today), archived observations inside _À retenir_ (a plain labelled block), and archived goals
inside _Objectifs et consigne_ (a bordered divider).

All folds are **closed by default with their count visible** — R16 and the dropped `history-folds`
stub's fallback rule, taken because the Design stage that would have answered it for recipes no
longer exists. `Accordion` already gives the R27 semantics (button in a heading, `aria-expanded`,
`aria-controls`) and `packages/ui/src/tokens.css` already collapses its animation under
`prefers-reduced-motion` (R28) — nothing is needed in `packages/ui`.

### 4. The sensitive zone folds closed at the end of the profile

The `danger-zone` section and its red card disappear. The delete flow becomes the **last fold of
the `profile` section**, closed, triggered by "Zone sensible" in the error tone. The destructive
description that is on the card today and the `DeletePatient` component itself both move inside the
fold, unchanged.

### The section registry shrinks

`sections` in `page.tsx` loses five entries — the four conditional archived ones and `danger-zone`
— so the desktop index, the medium anchor row and the phone segments all stop changing shape from
patient to patient. Remaining entries, their labels, their counts and their segments are untouched;
**Dossier stays a segment** (owner, this run — the anamnesis is a tab away during a consultation,
not a page away), so no route is added and the working view links nowhere new.

### Copy that goes stale

`apps/admin/AGENTS.md` § Interface ends "Bodies of secondary sections are untouched." — true of
#93, false after this. It is rewritten to say what the secondary sections now are.

## Acceptance criteria

- [ ] The anamnesis section lists filled categories first with their text, then the empty ones as a
      short list of "Compléter" buttons, above a line reading how many of the twelve are filled.
- [ ] Clicking "Compléter" or "Modifier" opens that category's editor in place; only one category
      is editable at a time, and saving re-renders it among the filled categories.
- [ ] The profile section shows a read summary (identity, measures, diet, allergies, intolerances,
      budget, likes cooking, consent date and channel, plus "Modifié le …") before any click.
- [ ] "Modifier" replaces the read summary with the existing `PatientForm` in place, with every
      field it has today and no field removed; "Fermer" returns to the read summary.
- [ ] A profile with neither consent date nor channel reads "Pas encore enregistré", as
      `RETENTION.md § Consent` describes.
- [ ] Archived recommendations, archived essentials, previous recipes and archived meals each render
      as a closed fold with a count at the end of their active section; the four standalone
      sections no longer exist.
- [ ] Archived supplements, archived observations and archived goals use the same fold with a count.
- [ ] The delete flow is a closed fold at the end of the profile section; there is no red card and
      no `danger-zone` section.
- [ ] The section registry, the desktop index, the medium anchor row and the phone segments contain
      no conditional entry — the same section list for every patient.
- [ ] No migration, no schema change, no service change, and no file under `apps/web` or the patient
      link (`/p/[token]`) is modified.
- [ ] `apps/admin/AGENTS.md` § Interface no longer claims the secondary sections' bodies are
      untouched and describes what they now are.
- [ ] The `apps/docs` pages `technical/applications` and `business/roles` describe the secondary
      sections as specified (Release responsibility, same PR).

## Out of scope

- **Per-field provenance on the profile** — "modifié par la patiente le …" needs a writer on each
  field, which arrives with `patient-loop/patient-profile-edit`. This run shows the profile's
  single `lastEditedAt`.
- **The forms themselves.** `PatientForm`'s 500 lines, its field set, its save action and the
  anamnesis textarea are moved and re-composed, not rewritten. The legacy `anamnesis` free-text
  field keeps its place and its "à redistribuer" hint inside the form.
- **Row density (R13)** — turning homogeneous rows into hairline list rows. The archived folds wrap
  `RecommendationGroups`, `PantryList`, `RecipeAssignments` and `MealJournal`, which the *active*
  lists also use, so changing them is a page-wide sweep. The stub says do it where a section is
  touched anyway and do not sweep; no section this run touches is a nested-card list.
- **"Dernière archivée en août" on a closed fold** — the count is the whole read this run.
- Any table, migration, service function or server action.
- Anything on the patient link, in `apps/web`, or in `apps/demo`.
- The phone "Ajouter" bottom sheet — still unowned, as `at-a-glance-page` left it.

## Open questions

- Non-blocking: previous recipes fold **closed** like the other three, though the existing copy
  ("l'historique des adaptations, pas une corbeille") argues she consults them. R16 warns against
  hiding material that is genuinely read. The count is visible either way; if she opens it every
  time, flipping one `defaultValue` is a tweak.
