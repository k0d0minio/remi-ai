# Stub: pressing « Je l'ai mangé » twice says the meal is gone

- lane: tweak
- found-by: meal-entry review · 2026-09-18

## Problem

`markMealEntryEaten` is deliberately one-way: a row that is already `eaten` comes back
`not_found` ("no such planned meal"). `apps/web/lib/patient-link/actions.ts` maps `not_found` to
the dictionary's « Ce repas n'existe plus. Rechargez la page. »

So a patient on a stale page who presses the button twice — or presses it once, having already
flipped the meal on their phone — is told their meal no longer exists, when in fact the flip they
asked for has happened. The message is alarming and factually wrong.

## Proposed change

Distinguish "already eaten" from "no such row" at the service boundary, and word the first as the
reassurance it is (« C'est déjà noté. »). A `conflict` code rather than `not_found` would carry
that without inventing a second lookup.
