# Stub: Patient-link segments — one token, a small multi-page surface at the real URL

- feature-slug: patient-link-segments
- sequence: 4 of 4
- depends-on: pantry-essentials, recipe-library, meal-journal
- priority: P1
- size: M
- sources: v2 brainstorm § J (PATIENT_OUTPUT) · scope answers 2026-09-01
  (patient-record/breakdown.md § Decisions, #1, #3)

## What this is

§ J names what a patient receives: the consultation summary and objectives, the priority
recommendations, the validated supplements, the pantry essentials, the recipe inspirations —
"lisible et agréable", without Morgane copy-pasting across tools. Today `/p/[token]` is one page
showing a fraction of that. This stub grows it into the decided shape (#3): **one token,
multi-page** — sub-routes under `/p/[token]/…`, the token in the path remaining the whole
credential, no session, no onward links into the signed-in app.

Segments, from what the two epics now store:

- **Home** — greeting, the living summary, the priority goals, and a small nav to the rest.
  (The existing objective/profile-extract rendering gets rethought here: the summary now says it
  better; what survives of the § A extract is a design call.)
- **Recommandations** — what the page already shows, moved into the structure.
- **Compléments** — the active supplement protocol (§ J: "compléments validés").
- **Placard & frigo** — the active pantry list, with the per-item whys.
- **Recettes** — active recipe assignments: title, body, Morgane's personal note.
- **Repas** — the meal journal with her feedback (scope per the meal-journal stub's open
  question on visibility).

A segment with nothing to show does not appear — Morgane fills patients at her own pace, and an
empty page reads as a broken product. Every segment keeps the existing page's properties: both
locales via the typed content dictionaries, `force-dynamic`, `recordPatientLinkOpened`, the
privacy note from `data-care`, real name when recorded, nothing from the anamnesis or the
consultation notes — those never leave the console.

## Worth knowing

- This is the epic's integration point with `patient-record`: summary, goals and supplements come
  from that epic's tables. Ship it after, or ship with those segments dark — the breakdown states
  the choice.
- Phone-first is non-negotiable: patients open this from a WhatsApp message.
- This surface is the FunMedDev demo candidate for 1 Dec (direction doc: patient experience,
  testable) — favour finished-feeling over feature-count.
- The `(patient)` route group's fixture pages (today/meals/plan) are *not* this stub's to clean
  up; do not wire the token anywhere near them.

## Open questions — flag these on pickup

- Which segments does Morgane want visible from day one for her current patients? (She may want
  repas held back — see the meal-journal stub.)
- Home composition: does the § A profile extract (constraints, preferences, measurements) stay
  patient-visible now that the summary exists, or does the summary replace it?
- Navigation labels are patient-facing copy in two locales — the French wording is Morgane's;
  collect it, don't invent it.

## Prompt

Run `/pipeline new .icm/intake/patient-surface/patient-link-segments.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first — and the
decisions of record in `.icm/intake/patient-record/breakdown.md`; #1 (view-only) and #3 (one
token, multi-page) fix this stub's shape. Scope: grow `apps/web`'s `/p/[token]` into sub-pages —
home (summary + goals), recommandations, compléments, placard & frigo, recettes, repas — rendering
only what the record holds, hiding empty segments, keeping token-as-credential, both locales,
`force-dynamic`, open-tracking and the privacy note; no forms, no session, no changes to the
signed-in app. This is a strong candidate for the pipeline's Design stage (a demo prototype of the
segment navigation) before Define — say so when routing. Raise the stub's open questions rather
than answering them.
