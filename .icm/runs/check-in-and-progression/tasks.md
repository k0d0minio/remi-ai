# Tasks: check-in-and-progression

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] With at least one active goal and no patient-written check-in in the last 7 days, the link's home shows the weekly card: every active goal in her order with a 0–5 choice and an optional word, and « Cette semaine, comment ça s'est passé pour : <objectif> ? » wording in both locales
- [x] Submitting with at least one score writes one `patient_goal_check_ins` row per rated goal with `written_by: patient`, today's `checked_on`, the score, the note, and a direction of better / stable / worse against that goal's previous patient score (none for a first score); unrated goals write nothing, and a submission with no score is refused
- [x] The write goes through the link-writes path (token-scoped, rate-limited, audited); a second submission inside the 7-day window writes nothing
- [x] After answering, the home shows when the last answer was given and when the next question opens instead of the card; with no active goals there is no card
- [x] `/p/<token>/progression` exists and appears in the navigation only when the patient has an active goal or a closed challenge; it shows, per active goal, a strip of the patient's last 12 scores with dates (no chart library), the current instruction, the number of meals logged in the last 7 days, and past challenges with their dates and outcome
- [x] The console's at-a-glance goals slot shows the same strip per goal, and the goal trail shows a patient row's score and the « écrit par la patiente » mark
- [x] A patient-written _worse_ row that is not yet seen counts toward an awaiting-attention line on the patient page, worded like the meals awaiting a reply; « Vu » on that row clears it from the count, and practitioner rows never count
- [x] One migration adds nullable `score` (0–5, checked) and `seen_at` to `patient_goal_check_ins`; existing rows and Morgane's consultation check-in form behave as before
- [x] No scheduler, no cron, no email, no push, no model call: the prompt is computed at render from the last check-in date

## Queue

- [x] Schema + migration `0022_goal_check_in_scores` — `packages/services/src/db` (4e726b2)
- [x] Services: weekly check-in, strips, awaiting count, mark-seen + tests — `packages/services/src` (923135d)
- [x] Link: weekly card on the home, « Ma progression » segment, `ScoreStrip` in `@remi/ui` (1a1750e)
- [x] Console: strip in the working view, trail score / link mark / « Vu », awaiting line, RETENTION (fb2cdcb)
- [x] Name the weekly answer types (fbf3cba)
- [ ] Cheap-tier GREEN → merge main → flip ready → full-tier GREEN
