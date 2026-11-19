# Handoff rem-173

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez l'aperçu de l'application : le fond de page est bleu très clair (`#F4F8FC`) et les cartes sont blanches. Le texte est bleu-gris foncé (`#253348`). Appuyez sur la touche Tab : le contour de focus est net, en bleu `#2A82C5`.

## What changed

- `packages/ui/src/tokens.css` : `--background` `#f4f8fc`, `--foreground` `#253348`, `--muted-foreground` `#566579`, `--border` et `--input` `#d9e2eb`, `--ring` `#2a82c5`. Les surfaces douces (`--secondary`, `--muted`, `--accent`, `--primary-subtle`) prennent `#e4edf8` (surface.soft). Les cartes restent blanches.
- Le contour de focus était à 40 % d'opacité (`ring-ring/40`) dans 42 fichiers. Il est à pleine opacité (`ring-ring`) : `#2A82C5` sur le fond de page a un contraste de 3,9:1. C'est le seul changement dans les fichiers des apps.
- `packages/ui/src/lib/brand.ts` : `ink` et `paper` de la carte d'aperçu des liens ont les valeurs de la charte.
- Contrastes : `#253348` sur `#F4F8FC` 11,9:1, `#566579` sur `#F4F8FC` 5,5:1, `#566579` sur `#E4EDF8` 5,0:1.
- Le thème sombre garde ses valeurs. REM-175 décide de ce thème.

## Blockers

- Les aperçus Vercel de `admin` et `app` échouent : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a 10 branches, sa limite. L'opérateur libère des branches Neon ou monte la limite. Ensuite, une session relance les aperçus.

## Do not touch

- none
