# Handoff rem-170

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application et du site public. Les boutons principaux et les liens ont le bleu `#3362AE` de la charte. Sur le site public, les sections « génétique » et « étapes » n'ont plus de dégradé.

## What changed

- `packages/ui/src/tokens.css` : `--brand-600` est `#3362ae` (brand.primary), et la rampe de bleus suit cette teinte. `--vital-500` est `#00a6a9` (brand.accent). `--info` est `#2a82c5` (brand.secondary), la couleur des pictogrammes informatifs.
- Le dégradé de marque est retiré : le token `--gradient-brand`, l'utilitaire `bg-brand-gradient` et ses deux usages sur le site public, qui prennent le bleu principal.
- `packages/ui/src/lib/brand.ts` et les icônes `apps/{web,admin,docs}/app/icon.svg` ont les mêmes valeurs.
- Le texte blanc sur `#3362AE` a un contraste de 6,0:1.
- Le thème sombre garde ses valeurs `--info`. REM-175 décide de ce thème.
- `packages/ui/brand/README.md` garde son ancien tableau : REM-185 le change.

## Blockers

- none

## Do not touch

- none
