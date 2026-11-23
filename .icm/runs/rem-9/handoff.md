# Handoff rem-9

## Next action

Lire les réponses avec `.icm/_system/scripts/questions.sh REM-9`. Sur `RESULT: OK`, faire le changement dans `apps/web/components/signup/consent-step.tsx` et `apps/web/lib/content/fr.ts` (et `types.ts`), puis le texte des CGV selon Q1.

Plan du changement (ne dépend pas des réponses) :

- Retirer le bloc de lecture et le bouton « Relire ».
- Une seule case de 44 × 44 px : « J'accepte les Conditions générales de vente et la Politique de confidentialité. »
- Chaque nom de document est un lien (style REM-11) qui ouvre le document dans le `Sheet` de `@remi/ui` (bouton de fermeture 44 × 44 px de REM-12). Le lien ne coche pas la case.
- La case coche toutes les clés obligatoires (`care`) : le formulaire et le serveur ne changent pas. La coche vit dans le formulaire, donc elle survit à l'ouverture et à la fermeture d'un document.
- « Continuer » reste désactivé tant que la case n'est pas cochée.

## How to test

<À écrire après le changement.>

## Blockers

- Q1 et Q2 attendent la réponse de Jamie sur la carte HUD ou dans le corps de #240. L'app n'a aucun texte des CGV. Le seul document de l'inscription est la politique de confidentialité (`care`, version 3), et seule sa version est enregistrée.

## Do not touch

- Le questionnaire et l'admin (REM-161 travaille en parallèle).
- `packages/services/src/consent/texts/care/*` : un texte publié ne change jamais (empreinte vérifiée par `index.test.ts`).
