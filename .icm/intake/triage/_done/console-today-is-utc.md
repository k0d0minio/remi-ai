# Stub: the console's « aujourd'hui » is UTC, not Belgian

- lane: bug
- found-by: meal-entry · 2026-09-18

## Problem

`apps/admin/app/(admin)/patients/[id]/page.tsx` and
`app/(admin)/patients/[id]/consultation/page.tsx` both compute today as
`new Date().toISOString().slice(0, 10)`, which reads UTC. Brussels is an hour or two ahead, so
between midnight and 01:00 or 02:00 local time the meal form and the consultation form default to
**yesterday's** date. Morgane can see and correct both fields, which is why this is a paper cut
rather than a defect — but it is the same clock the patient link now needs and cannot correct.

`meal-entry` added `todayAtPractice()` in `packages/services/src/shared/format.ts` for the patient
side, where the entry carries no date field at all. The console did not move to it: changing two
call sites Morgane can already correct was outside that run's scope.

## Proposed change

Point both console call sites at `todayAtPractice()` so one notion of "today" serves the whole
product, and delete the two hand-rolled `toISOString().slice(0, 10)` lines.
