# Bug: fix-console-today-timezone

- observed: between roughly midnight and 01:00–02:00 Brussels time, the patient page and the new
  consultation screen default every date field (meal entry, observation, goal check-in, recipe
  assignment, consultation date) to yesterday · expected: they default to today in Brussels, the
  same day the patient's own entries use
- cause: both pages computed `today` as `new Date().toISOString().slice(0, 10)`, which reads UTC —
  an hour or two behind Brussels — instead of `todayAtPractice()`, the helper `meal-entry` already
  added for the patient side
- fix: `apps/admin/app/(admin)/patients/[id]/page.tsx` and
  `apps/admin/app/(admin)/patients/[id]/consultation/page.tsx`: both `today` consts now call
  `todayAtPractice()` (already imported in the first file; added to the second's
  `@remi/services/shared` import); the two hand-rolled `toISOString().slice(0, 10)` lines are gone
- changelog: entry added
- learned: none
