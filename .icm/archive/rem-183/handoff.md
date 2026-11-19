# Handoff rem-183

## Décisions

- Q1 : la baseline ne remplace pas la phrase de description. Les deux existent (Jamie, 2026-11-19, valeur par défaut).
- Q2 : la version anglaise est « Between recommendation and action » (Jamie, 2026-11-19, valeur par défaut).

## Ce qui change

- `packages/ui/src/lib/brand.ts` : nouvelle constante `BRAND_BASELINE` en `fr` et en `en`, à côté de `BRAND_TAGLINE`. Elle est exportée par `@remi/ui/server`.
- `apps/marketing/components/site-footer.tsx` : le pied de page du site public montre la baseline sous le logo, au-dessus de la phrase de description.
- `BRAND_TAGLINE` ne change pas. Il reste la description des métadonnées et des aperçus de lien.

## Next action

L'opérateur teste le changement et coche Ready to merge. Ensuite, il dit `release REM-183`.

## How to test

Ouvre la page d'accueil du site public et descends jusqu'au pied de page. Sous le logo, la ligne « Entre recommandation et action » est en gras. La phrase de description suit, sans changement.

## Blockers

- none

## Do not touch

- none
