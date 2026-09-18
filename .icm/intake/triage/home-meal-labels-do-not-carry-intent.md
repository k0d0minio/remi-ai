# Stub: « J'ai mangé » on the home lands on a form set to « Je vais manger »

- lane: tweak
- found-by: meal-entry review · 2026-09-18

## Problem

`apps/web/components/patient-link/meal-entry-point.tsx` renders both of § 6's labels and links
them to the same URL — the Repas segment — carrying nothing about which one was pressed. On
arrival, the form's visually primary button is « Je vais manger ».

A patient who taps « J'ai mangé » on the home is therefore one mis-tap from recording a meal they
have already eaten as one they are about to. Two labels that behave identically also teach that
the distinction does not matter, which it does — it is the whole of the `intent` column.

This shape came out of the `meal-entry` / `patient-home-today` merge: #106 shipped the two labels
inert, and `meal-entry` made them links rather than a second form, which was the smallest
resolution that left no dead control.

## Proposed change

Carry the intent through — `?intent=eaten` read by the Repas page and used to order or preselect
the two submit buttons — or collapse the card to one call to action. The first keeps her § 6
wording, which is the reason to prefer it.
