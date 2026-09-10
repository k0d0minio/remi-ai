# Stub: Check-in and progression — « comment ça se passe ? », and what it adds up to

- feature-slug: check-in-and-progression
- sequence: 6 of 6
- depends-on: patient-home-today
- priority: P1
- size: M
- sources: V2 explication (« Feedback régulier » every 1–2 days, smiley answer, questions from the
  non-food recommendations; « Ma progression » — "pas encore créé") · feedback § 4 ("objectifs
  actifs et leur évolution") · decision #9 · `patient_goals`, `patient_goal_check_ins`

## What this is

The old version asked the patient every day or two « comment ça se passe ? » with a one-tap
answer, and promised a « Ma progression » page it never built. Decision #9 keeps the idea and
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

## Worth knowing

- No scheduler, no cron: the prompt is computed at render from the last check-in date. The email
  nudge is `beyond-december` if she ever wants it.
- Check-in questions are generated from data, not authored per patient — the recommendation title
  in the question, the category's verb from a small map. Keep the map in the vocabulary file.
- The patient's own check-in and Morgane's consultation check-in share a table; `written_by`
  tells them apart in the console.

## Open questions — flag these on pickup

- Interval: every visit, every two days, weekly — hers.
- Should a "worse" answer notify her (an awaiting-attention count on the console, like meals) or
  just show in the strip? A count is cheap; ask which she would act on.

## Prompt

Run `/pipeline new .icm/intake/patient-loop/check-in-and-progression.md` in the remi-ai repo and
follow the pipeline from there. Read the stub, its epic's `breakdown.md` (decision #9 binds) and
the `patient-home-today` run's notes first. Scope: an in-page check-in prompt on the patient home
computed from the last check-in date, rotating over active goals and non-food recommendations
with a three-face answer, writing goal check-ins (existing table) and recommendation check-ins
(new table) with patient attribution; a « Ma progression » segment and the same strip in the
console's at-a-glance goals slot. No scheduler, no email, no model call. Raise the stub's open
questions rather than answering them.
