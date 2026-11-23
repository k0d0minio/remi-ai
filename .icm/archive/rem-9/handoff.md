# Handoff rem-9

## Next action

Jamie teste la prévisualisation de #240, puis coche **Ready to merge**. Ensuite : `release REM-9`.

## Décisions

- Q1 et Q2 : les défauts. Jamie, 2026-11-23 : « Yes, use defaults ».
  - Q1 : les CGV du site public (02.11.2026, bandeau « à faire valider par un juriste » compris) sont copiées mot pour mot dans `packages/services/src/consent/texts/cgv/1.fr-BE.md`. `index.test.ts` fixe son empreinte.
  - Q2 : l'enregistrement ne change pas. La case coche le consentement obligatoire `care` (la politique de confidentialité) : une ligne avec la date, la version et l'empreinte du texte. La version des CGV n'est pas enregistrée.

## Le changement

- Le bloc de lecture et le bouton « Relire » sont retirés.
- Une seule case de 44 × 44 px : « J'accepte les Conditions générales de vente et la Politique de confidentialité. »
- Chaque nom de document est un lien bleu et souligné. Il ouvre le document dans le `Sheet` de `@remi/ui`, sans changer de page.
- « Continuer » reste désactivé tant que la case n'est pas cochée.
- Le composant sert aussi la page de reprise de dossier (`/inscription/reprendre/<token>`) : elle change de la même façon.

## How to test

Ouvre un lien d'inscription d'un praticien sur la prévisualisation, sur un téléphone. Touche « Conditions générales de vente », puis « Politique de confidentialité » : chaque document s'ouvre dans une fenêtre sur la même page et se ferme avec la croix. « Continuer » reste gris jusqu'à ce que tu coches la case, et la case reste cochée après l'ouverture d'un document.

## Blockers

- none

## Do not touch

- Le questionnaire et l'admin (REM-161 travaille en parallèle).
- Les textes publiés de `packages/services/src/consent/texts/` : un nouveau libellé est une nouvelle version.
