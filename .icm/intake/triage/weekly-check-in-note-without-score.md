# Stub: A word written on an unrated goal is dropped without a message

- lane: tweak
- found-by: check-in-and-progression · release code review · 2026-09-24
- complexity: low

## Problem

On the link's weekly card (`apps/web/components/patient-link/weekly-check-in-form.tsx`), a goal
left without a number writes nothing — as the spec says (D-30) — so a word typed under it is
discarded while the form reports success and the card closes for the week. The patient believes
Morgane will read it.

## Proposed change

Either refuse the submission when a goal carries a word but no number (« Ajoutez un chiffre à
côté de votre mot »), or hide the word field until a number is picked. One behaviour, decided in
the tweak — the operator's call on which reads better.
