# Stub: Check-in and progression — « comment ça se passe ? », and what it adds up to

- feature-slug: check-in-and-progression
- scope: patient-loop
- personas: patient, practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: patient-home-today
- sequence: 6 of 6
- priority: P1
- size: M
- sources: V2 explication (« Feedback régulier » every 1–2 days, smiley answer, questions from the
  non-food recommendations; « Ma progression » — "pas encore créé") · feedback § 4 ("objectifs
  actifs et leur évolution") · decision D-9 · `patient_goals`, `patient_goal_check_ins`

## Problem

The old version asked « comment ça se passe ? » every day or two and promised a « Ma progression » page it never built. D-9 keeps the idea in-page: today the link asks the patient nothing between consultations and shows them no evolution.

## Proposed change

The old version asked the patient every day or two « comment ça se passe ? » with a one-tap
answer, and promised a « Ma progression » page it never built. Decision D-9 keeps the idea and
drops the outbound channel: **in-page, when the patient opens the link**, no email, no push.

- **The check-in prompt.** On the home, when the last check-in is older than the interval
  (default two days): one question, one tap. The question rotates over the active goals ("Ton
  énergie, cette semaine ?") and the non-food recommendations (sommeil, activité, hydratation —
  the categories the vocabulary already has). Answer: three faces → `better | stable | worse`,
  plus an optional word. Goal answers write `patient_goal_check_ins` (the table exists; the
  console's check-in form writes it today), `written_by: patient`; recommendation answers write a
  small new `patient_recommendation_check_ins` table (recommendation, checked_on, direction, note).
- **Ma progression** — a segment for the patient: per goal, the check-ins over time as a simple
  strip (faces on a timeline — no chart library), the current instruction, the count of meals
  logged this week and recipes tried. The same view in the console's at-a-glance page's "goals
  with evolution" slot (`practitioner-workflow/at-a-glance-page` reads the check-ins; this stub
  makes the patient's answers appear there too).

## Acceptance criteria (rough)

- [ ] When the last check-in is older than the interval, the home shows one question, one tap (three faces → better / stable / worse, optional word), rotating over active goals and non-food recommendations
- [ ] Goal answers write the existing `patient_goal_check_ins` table; recommendation answers write a new `patient_recommendation_check_ins` table; both with patient attribution
- [ ] « Ma progression » on the link shows each goal's check-ins over time as a simple strip, the current instruction, the week's meals logged and recipes tried; the console's at-a-glance goals slot shows the same strip
- [ ] No scheduler and no cron: the prompt is computed at render from the last check-in date

## Out of scope (this feature)

- Email or push nudges (`beyond-december`); any model call; a chart library

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-9 (in-page, no outbound channel; a simple progression view on both sides).

- No scheduler, no cron: the prompt is computed at render from the last check-in date. The email
  nudge is `beyond-december` if she ever wants it.
- Check-in questions are generated from data, not authored per patient — the recommendation title
  in the question, the category's verb from a small map. Keep the map in the vocabulary file.
- The patient's own check-in and Morgane's consultation check-in share a table; `written_by`
  tells them apart in the console.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Interval: every visit, every two days, weekly — hers.
- Should a "worse" answer notify her (an awaiting-attention count on the console, like meals) or
  just show in the strip? A count is cheap; ask which she would act on.

## Prompt

Run `/pipeline new check-in-and-progression` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
