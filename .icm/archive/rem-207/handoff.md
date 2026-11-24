# Handoff rem-207

## Next action

L'opérateur teste sur la preview, coche Ready to merge sur la PR #246, puis dit
`release REM-207`.

## How to test

Fais une nouvelle inscription patient sur la preview, puis ouvre Profil, « Mes consentements ».
La ligne « Conditions générales de vente » dit « Acceptées le » et la date du jour, version 1,
avec seulement « Relire ». Dans la console, le dossier de ce patient montre « Acceptées » et la
version 1.

## Critères

- Deux lignes `care` et `cgv` à l'inscription, avec date, langue et empreinte : test
  `patient-signup.test.ts` (CI).
- Une version de CGV périmée ou absente ne crée pas de compte : tests `consent/index.test.ts` et
  `patient-signup.test.ts` (CI).
- L'empreinte du fichier `cgv/1.fr-BE.md` reste fixée : `consent/index.test.ts` (CI).
- Ligne CGV en lecture seule (Q1) : `consentSummaries` ne propose ni retrait ni nouveau
  consentement, le service refuse `refused` et `withdrawn` pour `cgv` : `shared/consent.test.ts`
  et `withdraw.test.ts` (CI). L'écran : opérateur.
- Pas de ligne CGV sans ligne en base (Q2) : `shared/consent.test.ts` (CI).
- La prise en main du dossier enregistre aussi `cgv` (Q3) : `patient-takeover.test.ts` (CI). La
  « reprise d'inscription » est la même page (`/inscription/reprendre/<token>`).
- Textes nouveaux en français : « Conditions générales de vente », « Acceptées le {date} »,
  « Acceptées » (agent, fait).
- Écrans « Mes consentements » et dossier de la console : opérateur.

## Blockers

- Ready to merge attend la coche de l'opérateur.

## Do not touch

- `packages/services/src/consent/texts/cgv/1.fr-BE.md` : un texte publié ne change jamais.
