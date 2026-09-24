# Spec: Check-in and progression — her weekly 0–5 per goal, and « Ma progression » on both sides

- slug: check-in-and-progression
- personas: patient, practitioner
- touches: packages/services/src/db, packages/services/src/shared, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients
- complexity: standard

## Problem

Between two consultations the patient link asks the patient nothing about the goals it shows, and
nothing shows the patient how those goals are moving. The old version asked « comment ça se passe ? »
every day or two and promised a « Ma progression » page it never built. Morgane's 14 Sept document
(§ 1, ranked first under D-17) asks for it on her own scale: « Possibilité de côté chaque semaine ?
0 à 5 » on each of the three goals. D-9 keeps the idea in-page, with no outbound channel and a simple
progression view on both sides. This advances the initiative _a patient experience validated on real
terrain, in time for the December open day_, and its objective _the patient loop working end to end
for one real patient_: her pilot question is whether REMI helps people apply their recommendations
between consultations, and a weekly score per goal is the patient's own answer to it.

## Proposed change

Decisions settled with the operator in Define (2026-09-24), answering the stub's **Open for Define**
points:

- **The form is her weekly 0–5 score per goal** (D-19's open point, closed). It replaces the stub's
  three faces every two days. It asks about goals only. Recommendation check-ins and their new table
  are dropped (see Out of scope).
- **The score means how the week went for that goal**: « Cette semaine, comment ça s'est passé pour :
  <objectif> ? », where 0 = pas bien du tout and 5 = très bien. A score **lower than the patient's
  previous score on the same goal** is _worse_. Equal is _stable_, higher is _better_, and a first
  score has no direction.
- **The check-in card sits beside the general-feedback box on the home**, as two separate cards.
  This settles the same point for `general-feedback`.
- **A worse score raises an awaiting-attention count in the console**, worded like the meals
  awaiting a reply, and it is cleared when she marks the row seen.
- **"Recipes tried" is dropped from « Ma progression »**: no data records it today, and it returns
  with `recipe-feedback-and-favourites`.

**On the patient link (D-2, D-9):**

- **The weekly check-in card on the home.** It appears when the patient has at least one active goal
  and has written no check-in of their own in the last 7 days. That window is computed at render
  from the date of the patient's last check-in, with no scheduler and no cron. The card lists every
  active goal in her order, each with a 0–5 choice (six buttons) and an optional word. A goal can be
  left unrated, but submitting needs at least one score. Submitting writes one
  `patient_goal_check_ins` row per rated goal, with `written_by: patient`, `checked_on` = today, the
  score, the direction computed against that goal's previous patient score, and the word as the note.
  It goes through the existing link-writes path, so it is token-scoped, rate-limited and audited. Once
  answered, the card gives way to one line: when the last answer was given and when the next question
  opens. A second submission inside the window writes nothing (this covers a double submit or a
  second tab).
- **« Ma progression »**: a new segment, `/p/<token>/progression`, shown in the navigation when the
  patient has at least one active goal or one closed challenge (the same data-driven hiding rule as
  the other segments). It shows:
  - for each active goal, in her order, a **strip**: the patient's weekly scores oldest to newest,
    the last 12, each a small 0–5 mark with its date. It is built with the design system and no chart
    library. When there are no scores yet, the goal shows an empty-state line.
  - the current instruction (« la consigne »), when there is one.
  - the number of meals logged in the last 7 days.
  - past challenges, newest first: the text, the dates, and the outcome in her words (Acquis /
    Non acquis / Abandonné), from `patient_challenges`.
- All new wording lives in the link's content files in both locales. The French uses the link's
  « vous » register.

**In the console (D-9, "on both sides"):**

- **The at-a-glance goals slot** on the patient page shows the same strip per goal, next to what it
  already shows.
- **The goal trail** shows a patient row's score (« 3/5 ») and the « écrit par la patiente » mark
  from `written_by`.
- **Awaiting attention.** A patient-written row whose direction is _worse_ and that is not yet seen
  counts toward « N objectif(s) en baisse » on the patient page, worded and placed like the meals
  awaiting a reply. Each such row in the trail carries a « Vu » action that marks it seen and takes
  it out of the count. Seeing is idempotent.

**Data:** one migration on the existing table. `patient_goal_check_ins` gains a nullable `score`
(integer, 0–5, checked) and a nullable `seen_at` (timestamptz). Existing rows and Morgane's
consultation check-in form are unchanged: she writes no score, and her rows never count as awaiting.

## Acceptance criteria

- [ ] With at least one active goal and no patient-written check-in in the last 7 days, the link's home shows the weekly card: every active goal in her order with a 0–5 choice and an optional word, and « Cette semaine, comment ça s'est passé pour : <objectif> ? » wording in both locales
- [ ] Submitting with at least one score writes one `patient_goal_check_ins` row per rated goal with `written_by: patient`, today's `checked_on`, the score, the note, and a direction of better / stable / worse against that goal's previous patient score (none for a first score); unrated goals write nothing, and a submission with no score is refused
- [ ] The write goes through the link-writes path (token-scoped, rate-limited, audited); a second submission inside the 7-day window writes nothing
- [ ] After answering, the home shows when the last answer was given and when the next question opens instead of the card; with no active goals there is no card
- [ ] `/p/<token>/progression` exists and appears in the navigation only when the patient has an active goal or a closed challenge; it shows, per active goal, a strip of the patient's last 12 scores with dates (no chart library), the current instruction, the number of meals logged in the last 7 days, and past challenges with their dates and outcome
- [ ] The console's at-a-glance goals slot shows the same strip per goal, and the goal trail shows a patient row's score and the « écrit par la patiente » mark
- [ ] A patient-written _worse_ row that is not yet seen counts toward an awaiting-attention line on the patient page, worded like the meals awaiting a reply; « Vu » on that row clears it from the count, and practitioner rows never count
- [ ] One migration adds nullable `score` (0–5, checked) and `seen_at` to `patient_goal_check_ins`; existing rows and Morgane's consultation check-in form behave as before
- [ ] No scheduler, no cron, no email, no push, no model call: the prompt is computed at render from the last check-in date

## Out of scope

- Check-in questions on recommendations and a `patient_recommendation_check_ins` table (settled in
  Define: goals only, her § 1)
- "Recipes tried" on « Ma progression », which returns with `recipe-feedback-and-favourites` (P2)
- A score field in Morgane's consultation check-in form
- An awaiting count on the patient list (meals carry none there either)
- Email or push nudges (`beyond-december`, D-9); any model call; a chart library
- The general-feedback box itself (`general-feedback` places its card beside this one)

## Open questions

- none
