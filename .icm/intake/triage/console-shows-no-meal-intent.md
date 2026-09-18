# Stub: the console cannot tell a planned meal from an eaten one

- lane: tweak
- found-by: meal-entry review · 2026-09-18

## Problem

`meal-entry` added `intent` (`planned | eaten`) to `patient_meal_entries` and the patient link
renders it as a badge, but nothing in `apps/admin` reads it. In
`apps/admin/components/patients/meal-entry-item.tsx` a meal the patient has not eaten yet looks
exactly like one they have, so Morgane can answer « Je vais manger des spaghetti » as though it
were a report of what happened — which is the opposite of § 8's point, where the whole value of a
planned meal is that the answer arrives before the meal does.

There is also no console control to flip one, so a patient who forgets to press « Je l'ai mangé »
leaves a row planned forever and Morgane cannot correct it.

## Proposed change

Render the intent in the journal card (a badge beside « écrit depuis le lien »), and decide
whether Morgane gets a flip control of her own or whether a stale planned row is simply left as
the record of what was said. The badge is the part that is clearly right; the control is a
question for her.
