# Spec: Patient-link segments — one token, a small multi-page surface at the real URL

- slug: patient-link-segments
- apps: web
- touches: apps/web/app/[locale]/p/[token]/layout.tsx, apps/web/app/[locale]/p/[token]/page.tsx, apps/web/app/[locale]/p/[token]/recommandations/page.tsx, apps/web/app/[locale]/p/[token]/complements/page.tsx, apps/web/app/[locale]/p/[token]/placard-frigo/page.tsx, apps/web/app/[locale]/p/[token]/recettes/page.tsx, apps/web/app/[locale]/p/[token]/repas/page.tsx, apps/web/lib/patient-link/load.ts, apps/web/lib/patient-link/segments.ts, apps/web/components/patient-link/segment-nav.tsx, apps/web/components/patient-link/segment-page.tsx, apps/web/components/patient-link/goal-list.tsx, apps/web/components/patient-link/recommendation-list.tsx, apps/web/components/patient-link/supplement-list.tsx, apps/web/components/patient-link/pantry-list.tsx, apps/web/components/patient-link/recipe-list.tsx, apps/web/components/patient-link/meal-list.tsx, apps/web/lib/content/types.ts, apps/web/lib/content/en.ts, apps/web/lib/content/fr.ts
- complexity: complex
- demo: none

## Problem

Brainstorm § J names what a patient actually receives: the consultation summary and their
objectives, the priority recommendations, the validated supplements, the placard/frigo essentials,
the recipe inspirations — "lisible et agréable", in one place, without Morgane copy-pasting across
WhatsApp, Notes and email. Today `/p/[token]` is a single page showing a fraction of it: the
objective free text, the recommendations, and a § A profile extract. Everything the last four PRs
put in the record — the priority goals (#73), the pantry essentials (#68), the recipe library and
its per-patient assignments (#71), the meal journal with her feedback (#74) — is invisible to the
person it was written for, and the two patient-record stubs still open (the living summary, the
supplement protocol) have nowhere to land either.

This is stub 4 of 4 in the `patient-surface` epic, and the epic's integration point: it renders
both epics rather than storing anything. It ladders up to the current initiative's **"A usable
patient version for the partner clinic to test — testable by their team on 1 December 2026"**
objective, and it is the surface that objective is about: the patient half, on a phone, opened from
a WhatsApp message. Two decisions of record
([`patient-record/breakdown.md § Decisions`](../../../../../.icm/intake/patient-record/breakdown.md))
fix its shape and are not reopened here: **#1** — the link is view-only, WhatsApp stays the reply
channel, so no form appears at `/p/[token]`; **#3** — one token, multi-page, the token in the path
remaining the whole credential, segments with nothing to show staying hidden. "No AI anywhere"
holds: every word rendered was typed by Morgane in the console.

### Precondition — Build waits for two tables

Two of the six segments read tables that do not exist yet: the living summary
(`patient-record/living-summary`) and the supplement protocol
(`patient-record/supplement-protocol`), both still open stubs. Jamie's call (2026-09-03) is
**finish patient-record first**: this spec specifies all six segments against the final shape, and
**Build does not start until both of those PRs are merged to `main`** — not "ship those segments
dark". The two service reads this run needs are therefore named by behaviour, not by function
name; whatever `@remi/services/server` exports for the active summary and the active supplement
protocol is what the home and compléments segments call.

## Proposed change

`/p/[token]` becomes a small six-page surface under one token: a shared shell that resolves the
token and carries the navigation, and one page per segment that renders only what the record holds.

### The routes

French paths, because the reader is francophone and the URL is part of what she sends:

| Route                        | Segment          | Reads                                                     |
| ---------------------------- | ---------------- | --------------------------------------------------------- |
| `/p/[token]`                 | Home             | the patient, the active living summary, the active goals   |
| `/p/[token]/recommandations` | Recommandations  | the active recommendations, by category                    |
| `/p/[token]/complements`     | Compléments      | the active supplement protocol                             |
| `/p/[token]/placard-frigo`   | Placard & frigo  | the active pantry essentials — item + « pourquoi pour toi »|
| `/p/[token]/recettes`        | Recettes         | the active recipe assignments — title, body, her note      |
| `/p/[token]/repas`           | Repas            | the meal entries, her feedback beneath each one            |

Every route keeps every property the current page has, and this is the non-negotiable part of the
change: `force-dynamic`, both locales through the typed content dictionaries, the real name when
Morgane recorded one and the pseudonym otherwise, `recordPatientLinkOpened` on arrival, the
`data-care` privacy note and the disclaimer, the beta note, no onward link into the signed-in app,
and nothing from the anamnesis, the consultation notes, the goal check-ins or the journal's
learnings — the practitioner's working record never leaves the console.

### The shell

A layout at `p/[token]` resolving the token once per request and rendering the chrome: the
wordmark, the greeting with the patient's name, the segment navigation, and the privacy/disclaimer
card plus beta note as a shared footer. An unknown, malformed or revoked token is `notFound()` on
**every** route, home and sub-pages alike — the token is the whole credential and there is nothing
partial to show without it. `recordPatientLinkOpened` fires on a page arrival rather than only on
the home page, so a patient who opens the link and reads three segments is recorded as having
opened it; the service already rate-limits itself, so this is usually a read and no write.

### The navigation, and the hiding rule

The nav lists the segments **that have something to show for this patient**, computed per request
from the record. Home always appears. A segment whose read comes back empty appears nowhere and its
URL returns `notFound()` — a nav entry leading to an empty page and a reachable empty page are the
same broken product, and Morgane fills patients at her own pace. There is no per-segment visibility
switch and no configuration: presence of content is the only rule (Jamie, 2026-09-03 — "all six,
data-driven only"). A patient with a summary and nothing else sees one page and no nav.

Phone-first, and that is the acceptance bar rather than a preference: patients open this from a
WhatsApp message. The nav has to work at 375px with real French labels, and the current page's
`max-w-xl` single-column reading measure stays.

### Home, recomposed

Jamie's call (2026-09-03): **the living summary replaces the § A profile extract.** Home is the
greeting, the active living summary, and the priority goals with their baselines in her order.
What the current page shows below the recommendations — the constraints, the preferences, the
medications, the free-text supplements field and the age/height/weight line — comes off the
patient's page. It stays in the console, where it is hers to work from; the summary is now the
thing that says it better, and § C makes it the living document revised at each consultation
(decision #7). The legacy `objective` free-text field goes with it: the priority goals are § D's
structured replacement for it, and rendering both would show the patient two competing statements
of what they are working on.

### The segments

- **Recommandations** — what the page shows today, moved behind its own route: the active
  recommendations, each with its category badge, title and detail.
- **Compléments** — the active supplement protocol from `patient-record/supplement-protocol`:
  what she validated, how it is taken, and her reason where she wrote one. § J's "compléments
  validés", and the reason the free-text field leaves home.
- **Placard & frigo** — the active pantry essentials in her order, each with its `why`. The why is
  the point of the list, not a decoration: § H is justification logic, so an item renders with its
  reason attached rather than in a bare checklist.
- **Recettes** — the active assignments, newest first: the recipe title, the body as she wrote it
  (prose, `whitespace-pre-line`, no invented ingredient/step structure), and her per-patient
  « pourquoi pour toi » note. The library's `tags` are her filing vocabulary in the console and do
  not render here.
- **Repas** — every non-archived entry, newest meal first: the date, the slot label when set, what
  was eaten, the patient's own comment when she transcribed one, and her feedback beneath it where
  she has written it (Jamie, 2026-09-03 — "all entries, feedback where written"; this is the
  meal-journal spec's open question, answered). The four slot keys get patient-facing labels in the
  content dictionaries, not the admin vocabulary file. Per-entry learnings and the standalone
  observations do not render: her memorisation is the practitioner's record.

### Content and locales

One `patientLink` branch in `lib/content/{en,fr}.ts`, typed by `types.ts` so a missing translation
is a type error, extended with the nav labels, the per-segment titles and the per-segment field
labels. The French wording is Morgane's, and it is seeded from her own § J vocabulary
(« compléments validés », « placard & frigo », « recettes », « repas ») rather than invented —
confirming it with her is an open question below, and a copy change, not a build change.

### Reads

Directly from `@remi/services/server`, as the current page already does — this route is the app's
one real-data surface and does not go through the fixture-backed `lib/queries/`. No schema change,
no migration, no new service, no change to `apps/admin` or to the signed-in app.

## Acceptance criteria

- [ ] `/p/[token]` and the five sub-routes `recommandations`, `complements`, `placard-frigo`,
      `recettes`, `repas` all render for a valid token, in both `en` and `fr`.
- [ ] Every one of the six routes is `force-dynamic` and reads the database on each hit.
- [ ] An unknown, malformed or regenerated-away token returns 404 on all six routes, with no
      partial chrome and no patient name rendered.
- [ ] A segment whose content is empty for this patient appears in no navigation and returns 404 at
      its own URL; home always renders.
- [ ] The navigation shows exactly the non-empty segments, marks the current one, and is usable at
      375px wide with no horizontal scroll and 44px tap targets.
- [ ] Home renders the greeting, the active living summary and the active priority goals in her
      order, with baselines where written.
- [ ] Home renders none of: constraints, preferences, medications, the free-text supplements field,
      the objective free text, or the age/height/weight line.
- [ ] Recommandations renders the active recommendations with category, title and detail, exactly
      as the current page does.
- [ ] Compléments renders the active supplement protocol; it renders nothing from
      `patient_profiles.supplements`.
- [ ] Placard & frigo renders the active essentials in `position` order, each with its `why` when
      one is written.
- [ ] Recettes renders the active assignments newest first, each with the recipe title, the body as
      prose with line breaks preserved, and her note; no `tags` render.
- [ ] Repas renders every non-archived entry newest meal first with date, slot label when set,
      description, the patient's comment when present, and her feedback beneath it when written;
      entries without feedback still render.
- [ ] Repas renders no per-entry learning and no standalone observation.
- [ ] Nothing from the anamnesis, the consultation notes or the goal check-ins renders on any route.
- [ ] `recordPatientLinkOpened` is called on arrival at any of the six routes, once per request.
- [ ] The privacy note and the disclaimer from `data-care`, plus the beta note, appear on all six
      routes.
- [ ] The patient's real name renders when recorded and the pseudonym otherwise, on all six routes.
- [ ] No route contains a form, an input, a mutation or a link into the signed-in app; no session is
      created or read.
- [ ] Both locale dictionaries carry every new label, and `types.ts` makes a missing one a type
      error.
- [ ] `apps/admin`, the `(app)` route group and the `(patient)` fixture pages are untouched by the
      diff.
- [ ] No schema change, no migration and no new service: the diff touches `apps/web` only.

## Out of scope

- **Any patient input.** Decision #1: view-only. No meal logging, no reply, no check-off, no
  feedback form, no "j'ai fait" button — WhatsApp is the loop and Morgane transcribes.
- **Sessions, accounts or authentication of any kind on this surface.** The token is the whole
  credential (#3); no sign-in, no magic link, no cookie beyond what Next.js needs to render.
- **Changes to the signed-in app or the admin console.** The `(patient)` route group's fixture
  pages (today/meals/plan) are explicitly not this run's to clean up, and the token goes nowhere
  near them.
- **The two open patient-record stubs.** The living summary and the supplement protocol are their
  own runs; this run reads them and does not create them.
- **Per-segment visibility configuration.** Hiding is data-driven only. A switch letting Morgane
  hold a segment back from a patient who has content for it is a console feature, not this run's.
- **Goal check-ins, per-entry learnings, standalone observations, the standing instruction, the
  anamnesis and the consultation notes.** All practitioner record; none of it leaves the console.
- **Photos in the meal journal.** Decision #6: text-only until a blob-storage vendor is chosen —
  an owner decision that creates a files seam when it is made.
- **PDF export, print styling, sharing and offline.** § J says "lisible et agréable" on a phone;
  a downloadable version is a separate question.
- **Search, filtering or sorting controls** inside a segment. Her order is the order.
- **Push, email or any notification** when a segment gains content. The link is pulled, not pushed.
- **AI anywhere** — no drafting, no summarising, no adaptation. This renders what she typed.

## Open questions

- **The French nav labels and segment titles — pending Morgane's confirmation.** Seeded from her own
  § J vocabulary rather than invented, per the stub's instruction to collect and not invent.
  Non-blocking: they are content-dictionary strings, so her wording lands as a copy change with no
  build consequence.
- **Whether dropping the § A extract from home is right for her current patients.** Jamie decided
  it (2026-09-03) on the ground that the living summary says it better; Morgane has not seen it
  side by side. Non-blocking: it is a render decision, reversible in one component, and the data
  stays in the record either way.
- **Whether an unanswered meal on the patient's own page reads as neglect.** The meal-journal stub
  raised it; Jamie answered it for this run (all entries, feedback where written). Terrain may say
  otherwise, and `feedback_written_at` is written, so the feedback-only variant stays a one-line
  filter rather than a migration.
- **Whether patients want the surface at all in this shape** is what the 1 December partner-clinic
  test is for. Not a blocker; the reason the segments are thin and the record is the only source.
