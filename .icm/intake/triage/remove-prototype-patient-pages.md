# Stub: Remove the prototype's patient pages from the `(app)` group

- lane: chore
- found-by: `patient-home-navigation/app-shell-and-nav` · 2026-11-11
- complexity: low
- priority: P2

## Problem

`apps/web/app/[locale]/(app)/(patient)/` holds `today`, `steps` and `plan`. They read fixture plans and run on the development session only. The patient's real shell is now `apps/web/app/[locale]/(patient)/`. Two patient surfaces exist, and only one reaches a patient.

## Proposed change

Remove the three pages, the `patientNav` copy, their content keys, their icons in `components/shell/nav-icons.ts`, and the queries and fixtures that only they read. Change `landingPath("patient")` in `apps/web/lib/auth/landing.ts`, or remove the patient role from the development session.

## Acceptance criteria

- [ ] `apps/web/app/[locale]/(app)/(patient)/` does not exist.
- [ ] No code reads `patientNav`, and no query or fixture is left without a reader.
- [ ] The development session for a patient lands on a page that exists.
