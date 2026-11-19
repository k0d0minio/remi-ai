# Handoff rem-180

## Next action

L'opérateur teste le changement sur la prévisualisation `app`, puis coche Ready to merge.

## How to test

Ouvre l'inscription, le questionnaire et la page du lien patient en français : le patient est tutoyé, et le consentement est la version 3 du 19 novembre 2026. Les pages du praticien gardent le « vous ».

## Blockers

- none

## Do not touch

- `packages/services/src/consent/texts/care/1.fr-BE.md`, `care/2.fr-BE.md`, `genetic/1.fr-BE.md` : textes signés, leur hash est sur les lignes de consentement.

## Decisions

- Q1 : les textes légaux passent aussi au « tu » (Jamie, 2026-11-19). Les textes signés ne changent pas : le « tu » est une nouvelle version, `care` 3 et `genetic` 2.
